// src/modules/claims/claims.routes.js
const router = require('express').Router();
const claimsService = require('./claims.service');
const { createClaimSchema, updateClaimSchema, claimIdParamSchema } = require('./claims.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { ok, error } = require('../../utils/response');

// GET /api/v1/claims — admin/owner/user (según ownership)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await claimsService.getClaims(req.user.id, req.user.role, req.query);
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// GET /api/v1/claims/:id
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = claimIdParamSchema.parse(req.params);
    const claim = await claimsService.getClaimById(id, req.user.id, req.user.role);
    return ok(res, { claim });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// POST /api/v1/claims — user/owner
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const data = createClaimSchema.parse(req.body);
    const claim = await claimsService.createClaim(req.user.id, data);
    return res.status(201).json({ success: true, data: { claim } });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// PUT /api/v1/claims/:id — admin/superadmin
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = claimIdParamSchema.parse(req.params);
    const data = updateClaimSchema.parse(req.body);
    const claim = await claimsService.updateClaim(id, req.user.id, req.user.role, data);
    return ok(res, { claim });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

module.exports = router;