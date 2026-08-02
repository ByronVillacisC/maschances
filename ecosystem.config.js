// ecosystem.config.js
const cpus = require('os').cpus().length;

module.exports = {
  apps: [
    {
      name: 'pluschances-api',
      script: 'src/main.js',
      instances: Math.min(cpus, 4),
      exec_mode: 'cluster',
      max_memory_restart: '512M',
      env: {
        PORT: 4000,
        NODE_ENV: 'production'
      },
      error_file: './logs/api-error.log',
      out_file:   './logs/api-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'pluschances-worker',
      script: 'src/workers/worker.main.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/worker-error.log',
      out_file:   './logs/worker-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};