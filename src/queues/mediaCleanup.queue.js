// src/queues/mediaCleanup.queue.js
const { createQueue } = require('../config/bull');
module.exports = createQueue('mediaCleanup');