const cors = require('cors');

// Permite localhost en desarrollo + dominios de producción
const getAllowedOrigins = () => {
  const origins = process.env.CORS_ORIGINS?.split(',') || [];
  
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
    
    // Permite requests sin origin (Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
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