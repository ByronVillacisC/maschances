// src/modules/claims/claims.validation.js
const { z } = require('zod');

const createClaimSchema = z.object({
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  raffleId: z.coerce.number().int().positive().optional(),
  ticketId: z.coerce.number().int().positive().optional()
});

const updateClaimSchema = z.object({
  status: z.enum(['open', 'in_review', 'resolved', 'rejected']).optional(),
  resolution: z.string().max(2000).optional()
});

const claimIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

module.exports = { createClaimSchema, updateClaimSchema, claimIdParamSchema };