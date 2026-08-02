// src/queues/reservation.queue.js
const { createQueue } = require('../config/bull');
module.exports = createQueue('reservation');