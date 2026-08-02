const { z } = require('zod');

const updateProviderSchema = z.object({
  businessName: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(3).optional(),
  isActive: z.boolean().optional()
});

module.exports = { updateProviderSchema };