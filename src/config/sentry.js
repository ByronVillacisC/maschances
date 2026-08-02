// src/config/sentry.js
let Sentry;

function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  try {
    Sentry = require('@sentry/node');
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1)
    });
  } catch (_) {
    // Sentry no instalado: continuar sin él
  }
}

function getSentry() {
  return Sentry || null;
}

function captureException(err) {
  if (Sentry) {
    Sentry.captureException(err);
  }
}

module.exports = { initSentry, getSentry, captureException };