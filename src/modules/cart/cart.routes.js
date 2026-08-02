// src/modules/cart/cart.routes.js
const router = require('express').Router();
const cartService = require('./cart.service');
const { addToCartSchema, updateCartItemSchema } = require('./cart.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { ok, error } = require('../../utils/response');

// GET /api/v1/cart — user
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await cartService.getCart(req.user.id);
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// POST /api/v1/cart — user
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const data = addToCartSchema.parse(req.body);
    const result = await cartService.addItem(req.user.id, data);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// PUT /api/v1/cart/:id — user
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const data = updateCartItemSchema.parse(req.body);
    const result = await cartService.updateItem(req.user.id, req.params.id, data);
    return ok(res, result);
  } catch (err) {
    if (err.errors) return error(res, err.errors, 422);
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

// DELETE /api/v1/cart/:id — user
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const result = await cartService.removeItem(req.user.id, req.params.id);
    return ok(res, result);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    next(err);
  }
});

module.exports = router;