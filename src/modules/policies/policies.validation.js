// src/modules/policies/policies.validation.js
const { z } = require('zod');

const createPolicySchema = z.object({
  type: z.enum(['terms', 'privacy', 'cookies', 'refund']),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  locale: z.string().length(2).default('es')
});

const updatePolicySchema = z.object({
  type: z.enum(['terms', 'privacy', 'cookies', 'refund']).optional(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  locale: z.string().length(2).optional(),
  isActive: z.boolean().optional()
});

const policyIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

module.exports = { createPolicySchema, updatePolicySchema, policyIdParamSchema };