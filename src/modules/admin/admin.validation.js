const { z } = require('zod');

// CAMBIO: incluir 'provider' en los roles permitidos para que Admin pueda activar proveedores
const setPermissionSchema = z.object({
  role: z.enum(['user', 'owner', 'provider', 'admin', 'superadmin'])
});

const setCommissionSchema = z.object({
  rate: z.coerce.number().min(0).max(100)
});

const userIdParamSchema = z.object({
  userId: z.coerce.number().int().positive()
});

module.exports = { setPermissionSchema, setCommissionSchema, userIdParamSchema };
