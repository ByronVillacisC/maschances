const { error } = require('../utils/response');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return error(res, 'No autorizado', 401);
    if (!roles.includes(req.user.role)) return error(res, 'Acceso denegado', 403);
    next();
  };
}

module.exports = { requireRole };