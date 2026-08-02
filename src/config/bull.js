const Queue = require('bull');

function createQueue(name) {
  return new Queue(name, process.env.REDIS_URL);
}

module.exports = { createQueue };