// src/modules/tickets/tickets.validation.js
const { z } = require('zod');

const purchaseSchema = z.object({
  raffleId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().max(100)
});

module.exports = { purchaseSchema };