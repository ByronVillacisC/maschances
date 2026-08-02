// src/queues/audit.queue.js
const { createQueue } = require('../config/bull');
module.exports = createQueue('audit');