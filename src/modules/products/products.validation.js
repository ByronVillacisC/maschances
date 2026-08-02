const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive(),
  currency: z.string().length(3).default('USD'),
  claimAddress: z.string().max(500).optional(),
  stock: z.coerce.number().int().min(0).default(0)
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive().optional(),
  currency: z.string().length(3).optional(),
  claimAddress: z.string().max(500).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional()
});

module.exports = { createProductSchema, updateProductSchema };