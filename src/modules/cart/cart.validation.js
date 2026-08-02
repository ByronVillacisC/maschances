// src/modules/cart/cart.validation.js
const { z } = require('zod');

const addToCartSchema = z.object({
  raffleId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive().max(100)
});

const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive().max(100)
});

module.exports = { addToCartSchema, updateCartItemSchema };