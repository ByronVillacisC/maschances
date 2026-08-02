// src/modules/notifications/notifications.validation.js
const { z } = require('zod');

const notificationIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

module.exports = { notificationIdParamSchema };