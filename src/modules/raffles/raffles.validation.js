// src/modules/raffles/raffles.validation.js
const { z } = require('zod');

const RAFFLE_STATUSES = ['draft', 'active', 'closed', 'drawn'];

const createRaffleSchema = z.object({
  packageId: z.coerce.number().int().positive(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  totalTickets: z.coerce.number().int().positive().max(100000),
  ticketPrice: z.coerce.number().positive(),
  currency: z.string().length(3).default('USD'),
  drawAt: z.string().datetime().optional()
});

const updateRaffleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  totalTickets: z.coerce.number().int().positive().max(100000).optional(),
  ticketPrice: z.coerce.number().positive().optional(),
  currency: z.string().length(3).optional(),
  status: z.enum(RAFFLE_STATUSES).optional(),
  drawAt: z.string().datetime().optional()
});

module.exports = { createRaffleSchema, updateRaffleSchema };