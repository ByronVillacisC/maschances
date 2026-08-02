const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { corsConfig } = require('./config/cors');
const { errorHandler } = require('./middlewares/errorHandler.middleware');
const { globalLimiter, authLimiter } = require('./middlewares/rateLimiter.middleware');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(corsConfig);

// Rate limiting a nivel app
app.use('/api/v1/auth', authLimiter);
app.use('/api/', globalLimiter);

// Health check
app.get('/health', async (req, res) => {
  const { getPrisma } = require('./config/database');
  const { getRedis } = require('./config/redis');
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    await getRedis().ping();
    res.json({ status: 'healthy', service: 'pluschances-api' });
  } catch {
    res.status(503).json({ status: 'unhealthy', service: 'pluschances-api' });
  }
});

// Routes
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/users', require('./modules/users/users.routes'));
app.use('/api/v1/packages', require('./modules/packages/packages.routes'));
app.use('/api/v1/owner-packages', require('./modules/packages/ownerPackages.routes'));
app.use('/api/v1/raffles', require('./modules/raffles/raffles.routes'));
app.use('/api/v1/tickets', require('./modules/tickets/tickets.routes'));
app.use('/api/v1/cart', require('./modules/cart/cart.routes'));
app.use('/api/v1/claims', require('./modules/claims/claims.routes'));
app.use('/api/v1/notifications', require('./modules/notifications/notifications.routes'));
app.use('/api/v1/history', require('./modules/notifications/history.routes'));
app.use('/api/v1/policies', require('./modules/policies/policies.routes'));
app.use('/api/v1/geo', require('./modules/geo/geo.routes'));
app.use('/api/v1/reports', require('./modules/reports/reports.routes'));
app.use('/api/v1/admin', require('./modules/admin/admin.routes'));

// FASE 8 - PROVEEDORES
app.use('/api/v1/providers', require('./modules/providers/providers.routes'));
app.use('/api/v1/products', require('./modules/products/products.routes'));

app.use(errorHandler);

module.exports = app;