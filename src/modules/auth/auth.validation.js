const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  country: z.string().max(3).optional()
});

// FASE 8 - REGISTRO PROVEEDOR
const registerProviderSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64),
  businessName: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(3).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const verify2FASchema = z.object({
  userId: z.coerce.number().int().positive(),
  token: z.string().length(6)
});

const enable2FASchema = z.object({
  token: z.string().length(6)
});

module.exports = { registerSchema, registerProviderSchema, loginSchema, verify2FASchema, enable2FASchema };