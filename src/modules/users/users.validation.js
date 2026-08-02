const { z } = require('zod');

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  country: z.string().max(3).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(64)
});

const setRoleSchema = z.object({
  role: z.enum(['user', 'owner', 'admin', 'superadmin'])
});

module.exports = { updateUserSchema, changePasswordSchema, setRoleSchema };