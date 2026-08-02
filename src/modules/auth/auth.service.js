const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { getPrisma } = require('../../config/database');
const { logAudit } = require('../audit/audit.service');
const { addHistoryEntry } = require('../history/history.service');

const SALT_ROUNDS = 12;

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax', // ← CAMBIADO: 'lax' para desarrollo local
    maxAge: 15 * 60 * 1000
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax', // ← CAMBIADO: 'lax' para desarrollo local
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh'
  });
}

function clearAuthCookies(res) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
}

async function register({ email, password, firstName, lastName, phone, country }) {
  const prisma = getPrisma();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw { status: 409, message: 'Email ya registrado' };

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, phone, country, role: 'user' }
  });

  await logAudit({ userId: user.id, action: 'register', entity: 'User', entityId: user.id });

  return { id: user.id, email: user.email, role: user.role };
}

// ─── CAMBIO: REGISTRO DE PROVEEDOR DESACTIVADO ───────────────────────────────
// La función se mantiene pero NO se expone vía endpoint público.
// Solo Admin/Superadmin pueden asignar rol 'provider' manualmente desde el panel de permisos.
async function registerProvider({ email, password, businessName, description, phone, address, city, country }) {
  const prisma = getPrisma();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw { status: 409, message: 'Email ya registrado' };

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'provider',
      phone,
      country,
      provider: {
        create: {
          businessName,
          description,
          phone,
          address,
          city,
          country
        }
      }
    },
    include: { provider: true }
  });

  await logAudit({ userId: user.id, action: 'register_provider', entity: 'Provider', entityId: user.provider.id });

  return { id: user.id, email: user.email, role: user.role, providerId: user.provider.id };
}

async function login({ email, password }) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw { status: 401, message: 'Credenciales inválidas' };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw { status: 401, message: 'Credenciales inválidas' };

  if (user.twoFactorEnabled) {
    return { requires2FA: true, userId: user.id };
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  await logAudit({ userId: user.id, action: 'login', entity: 'User', entityId: user.id });
  await addHistoryEntry({ userId: user.id, type: 'login', title: 'Inicio de sesión' });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
}

async function verify2FA({ userId, token }) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret) throw { status: 401, message: 'Usuario no encontrado' };

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1
  });
  if (!valid) throw { status: 401, message: 'Código 2FA inválido' };

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  await logAudit({ userId: user.id, action: 'login_2fa', entity: 'User', entityId: user.id });
  await addHistoryEntry({ userId: user.id, type: 'login', title: 'Inicio de sesión con 2FA' });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
}

async function refreshTokens(token) {
  const prisma = getPrisma();
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw { status: 401, message: 'Refresh token inválido' };
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || new Date() > stored.expiresAt) throw { status: 401, message: 'Refresh token expirado' };

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user || !user.isActive) throw { status: 401, message: 'Usuario inactivo' };

  await prisma.refreshToken.delete({ where: { token } });

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: newRefreshToken, userId: user.id, expiresAt } });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function logout(token) {
  if (!token) return;
  const prisma = getPrisma();
  await prisma.refreshToken.deleteMany({ where: { token } });
}

async function setup2FA(userId) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw { status: 404, message: 'Usuario no encontrado' };

  const secret = speakeasy.generateSecret({ name: `+Chances (${user.email})` });
  await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret.base32 } });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  return { secret: secret.base32, qrCode };
}

async function enable2FA(userId, token) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret) throw { status: 400, message: 'Primero configura 2FA' };

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1
  });
  if (!valid) throw { status: 401, message: 'Código 2FA inválido' };

  await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
  return { twoFactorEnabled: true };
}

async function disable2FA(userId) {
  const prisma = getPrisma();
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: false, twoFactorSecret: null }
  });
  return { twoFactorEnabled: false };
}

module.exports = {
  register,
  registerProvider,
  login,
  verify2FA,
  refreshTokens,
  logout,
  setup2FA,
  enable2FA,
  disable2FA,
  setAuthCookies,
  clearAuthCookies
};