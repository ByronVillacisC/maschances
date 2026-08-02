// src/queues/draw.queue.js
const { createQueue } = require('../config/bull');
module.exports = createQueue('draw');