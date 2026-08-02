// src/modules/packages/packages.validation.js
const { z } = require('zod');

const createPackageSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional()
});

const updatePackageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  isActive: z.boolean().optional()
});

module.exports = { createPackageSchema, updatePackageSchema };