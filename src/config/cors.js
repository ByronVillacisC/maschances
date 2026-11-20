const cors = require('cors');

// Permite localhost en desarrollo + dominios de producción y Vercel
const getAllowedOrigins = () => {
  const origins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) || [];

  // Agrega dominio de producción y URL automática de Vercel si existen
  origins.push('https://vercel.app');
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }

  // Agrega localhost automáticamente en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:3000');
    origins.push('http://localhost:3001');
  }

  return origins.filter(Boolean);
};

const corsConfig = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Permite requests sin origin (Postman, curl, mismo servidor, etc.)
    if (!origin) return callback(null, true);

    // Permite los orígenes listados o cualquier subdominio preview de Vercel
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
  exposedHeaders: ['Set-Cookie'],
});

module.exports = { corsConfig };
