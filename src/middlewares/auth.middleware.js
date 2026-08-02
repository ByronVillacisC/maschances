const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.access_token;
    if (!token) return error(res, 'No autorizado', 401);

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return error(res, 'Token inválido o expirado', 401);
  }
}

module.exports = { authMiddleware };