// src/middlewares/errorHandler.middleware.js
const logger = require('../utils/logger');
const { captureException } = require('../config/sentry');

function errorHandler(err, req, res, next) {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  captureException(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
}

module.exports = { errorHandler };