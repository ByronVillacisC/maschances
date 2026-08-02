// src/modules/reports/reports.routes.js
const router = require('express').Router();
const reportsService = require('./reports.service');
const { paginationSchema } = require('./reports.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { ok, error } = require('../../utils/response');

// GET /api/v1/reports/sales — admin/superadmin
router.get('/sales', authMiddleware, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const query = paginationSchema.parse(req.query);
    const result = await reportsService.getSalesReport(query);
    return ok(res, result);
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// GET /api/v1/reports/users — admin/superadmin
router.get('/users', authMiddleware, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const query = paginationSchema.parse(req.query);
    const result = await reportsService.getUsersReport(query);
    return ok(res, result);
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// GET /api/v1/reports/raffles — admin/superadmin
router.get('/raffles', authMiddleware, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const query = paginationSchema.parse(req.query);
    const result = await reportsService.getRafflesReport(query);
    return ok(res, result);
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// GET /api/v1/reports/audit — admin/superadmin
router.get('/audit', authMiddleware, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const query = paginationSchema.parse(req.query);
    const result = await reportsService.getAuditReport(query);
    return ok(res, result);
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

module.exports = router;