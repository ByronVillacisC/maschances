// src/modules/policies/policies.routes.js
const router = require('express').Router();
const policiesService = require('./policies.service');
const { createPolicySchema, updatePolicySchema, policyIdParamSchema } = require('./policies.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { ok, error } = require('../../utils/response');

// GET /api/v1/policies — público
router.get('/', async (req, res, next) => {
  try {
    const result = await policiesService.getPolicies();
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// GET /api/v1/policies/:id — público
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = policyIdParamSchema.parse(req.params);
    const policy = await policiesService.getPolicyById(id);
    return ok(res, { policy });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// POST /api/v1/policies — admin/superadmin
router.post('/', authMiddleware, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const data = createPolicySchema.parse(req.body);
    const policy = await policiesService.createPolicy(data);
    return res.status(201).json({ success: true, data: { policy } });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// PUT /api/v1/policies/:id — admin/superadmin
router.put('/:id', authMiddleware, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const { id } = policyIdParamSchema.parse(req.params);
    const data = updatePolicySchema.parse(req.body);
    const policy = await policiesService.updatePolicy(id, data);
    return ok(res, { policy });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// DELETE /api/v1/policies/:id — admin/superadmin
router.delete('/:id', authMiddleware, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const { id } = policyIdParamSchema.parse(req.params);
    const result = await policiesService.deletePolicy(id);
    return ok(res, result);
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

module.exports = router;