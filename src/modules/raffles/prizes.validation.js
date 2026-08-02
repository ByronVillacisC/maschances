const { z } = require('zod');

const addPrizeSchema = z.object({
  productId: z.coerce.number().int().positive(),
  position: z.coerce.number().int().min(1).max(10)
});

module.exports = { addPrizeSchema };