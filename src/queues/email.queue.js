const { createQueue } = require('../config/bull');
module.exports = createQueue('email');