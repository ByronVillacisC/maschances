// src/modules/reports/reports.validation.js
const { z } = require('zod');

const paginationSchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

module.exports = { paginationSchema };