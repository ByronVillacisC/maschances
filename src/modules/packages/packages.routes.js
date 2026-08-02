// src/modules/packages/packages.routes.js
const router = require('express').Router();
const packagesService = require('./packages.service');
const { createPackageSchema, updatePackageSchema } = require('./packages.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { imageUpload, videoUpload } = require('../../middlewares/upload.middleware');
const { ok, error } = require('../../utils/response');

// GET /api/v1/packages — público
router.get('/', async (req, res, next) => {
  try {
    const result = await packagesService.getPackages(req.query);
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// GET /api/v1/packages/:id — público
router.get('/:id', async (req, res, next) => {
  try {
    const pkg = await packagesService.getPackageById(req.params.id);
    return ok(res, { package: pkg });
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// POST /api/v1/packages — owner/admin/superadmin
router.post('/', authMiddleware, requireRole('owner', 'admin', 'superadmin'), async (req, res, next) => {
  try {
    const data = createPackageSchema.parse(req.body);
    const pkg = await packagesService.createPackage(req.user.id, data);
    return res.status(201).json({ success: true, data: { package: pkg } });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// PUT /api/v1/packages/:id — owner del recurso o admin
router.put('/:id', authMiddleware, requireRole('owner', 'admin', 'superadmin'), async (req, res, next) => {
  try {
    const data = updatePackageSchema.parse(req.body);
    const pkg = await packagesService.updatePackage(req.params.id, req.user.id, req.user.role, data);
    return ok(res, { package: pkg });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// DELETE /api/v1/packages/:id — owner del recurso o admin
router.delete('/:id', authMiddleware, requireRole('owner', 'admin', 'superadmin'), async (req, res, next) => {
  try {
    const result = await packagesService.deletePackage(req.params.id, req.user.id, req.user.role);
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// POST /api/v1/packages/:id/image — owner del recurso o admin
router.post('/:id/image', authMiddleware, requireRole('owner', 'admin', 'superadmin'),
  imageUpload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) return error(res, 'Imagen requerida', 400);
      const result = await packagesService.uploadPackageImage(req.params.id, req.user.id, req.user.role, req.file);
      return ok(res, result);
    } catch (err) {
      if (err.status) return error(res, err.message, err.status);
      next(err);
    }
  }
);

// POST /api/v1/packages/:id/video — owner del recurso o admin
router.post('/:id/video', authMiddleware, requireRole('owner', 'admin', 'superadmin'),
  videoUpload.single('video'),
  async (req, res, next) => {
    try {
      if (!req.file) return error(res, 'Video requerido', 400);
      const result = await packagesService.uploadPackageVideo(req.params.id, req.user.id, req.user.role, req.file);
      return ok(res, result);
    } catch (err) {
      if (err.status) return error(res, err.message, err.status);
      next(err);
    }
  }
);

module.exports = router;