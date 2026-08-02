const router = require('express').Router();
const authService = require('./auth.service');
const { registerSchema, registerProviderSchema, loginSchema, verify2FASchema, enable2FASchema } = require('./auth.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { ok, error } = require('../../utils/response');

// POST /api/v1/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await authService.register(data);
    return ok(res, { user });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// ─── CAMBIO: ENDPOINT REGISTRO PROVEEDOR DESACTIVADO ─────────────────────────
// El registro público de proveedores está desactivado.
// Solo Admin/Superadmin puede asignar rol 'provider' desde el panel de permisos.
// POST /api/v1/auth/register-provider - FASE 8 (DESACTIVADO)
/*
router.post('/register-provider', async (req, res, next) => {
  try {
    const data = registerProviderSchema.parse(req.body);
    const provider = await authService.registerProvider(data);
    return ok(res, { provider });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});
*/
// CAMBIO: Respuesta informativa si alguien intenta acceder al endpoint desactivado
router.post('/register-provider', (req, res) => {
  return error(res, 'El registro público de proveedores está desactivado. Contacte al administrador.', 403);
});

// POST /api/v1/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);

    if (result.requires2FA) {
      return ok(res, { requires2FA: true, userId: result.userId });
    }

    authService.setAuthCookies(res, result.accessToken, result.refreshToken);
    return ok(res, { user: result.user });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// POST /api/v1/auth/2fa/verify
router.post('/2fa/verify', async (req, res, next) => {
  try {
    const data = verify2FASchema.parse(req.body);
    const result = await authService.verify2FA(data);
    authService.setAuthCookies(res, result.accessToken, result.refreshToken);
    return ok(res, { user: result.user });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return error(res, 'Refresh token requerido', 401);
    const result = await authService.refreshTokens(token);
    authService.setAuthCookies(res, result.accessToken, result.refreshToken);
    return ok(res, { refreshed: true });
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// POST /api/v1/auth/logout
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    await authService.logout(token);
    authService.clearAuthCookies(res);
    return ok(res, { logout: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  return ok(res, { user: req.user });
});

// POST /api/v1/auth/2fa/setup
router.post('/2fa/setup', authMiddleware, async (req, res, next) => {
  try {
    const result = await authService.setup2FA(req.user.id);
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// POST /api/v1/auth/2fa/enable
router.post('/2fa/enable', authMiddleware, async (req, res, next) => {
  try {
    const { token } = enable2FASchema.parse(req.body);
    const result = await authService.enable2FA(req.user.id, token);
    return ok(res, result);
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// POST /api/v1/auth/2fa/disable
router.post('/2fa/disable', authMiddleware, async (req, res, next) => {
  try {
    const result = await authService.disable2FA(req.user.id);
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

module.exports = router;
