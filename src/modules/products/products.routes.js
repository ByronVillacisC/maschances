const express = require('express');
const router = express.Router();
const productsService = require('./products.service');
const { createProductSchema, updateProductSchema } = require('./products.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const { imageUpload, videoUpload } = require('../../middlewares/upload.middleware');
const { success, error } = require('../../utils/response');

// GET /api/v1/products - Productos públicos (stock > 0, activos) para que Owners elijan
router.get('/', async (req, res) => {
  try {
    const products = await productsService.getPublicProducts(req.query);
    return success(res, products);
  } catch (err) {
    return error(res, err.message || 'Error al obtener productos', err.status || 500);
  }
});

// GET /api/v1/products/:id - Detalle de producto público
router.get('/:id', async (req, res) => {
  try {
    const product = await productsService.getPublicProductById(req.params.id);
    return success(res, product);
  } catch (err) {
    return error(res, err.message || 'Error al obtener producto', err.status || 404);
  }
});

// POST /api/v1/products - Crear producto (solo provider)
router.post('/', authMiddleware, requireRole('provider'), async (req, res) => {
  try {
    const data = createProductSchema.parse(req.body);
    const product = await productsService.createProduct(req.user.id, data);
    return success(res, product, 'Producto creado', 201);
  } catch (err) {
    return error(res, err.message || 'Error al crear producto', err.status || 400);
  }
});

// GET /api/v1/products/my/list - Productos del proveedor autenticado
router.get('/my/list', authMiddleware, requireRole('provider'), async (req, res) => {
  try {
    const products = await productsService.getMyProducts(req.user.id, req.query);
    return success(res, products);
  } catch (err) {
    return error(res, err.message || 'Error al obtener mis productos', err.status || 500);
  }
});

// PUT /api/v1/products/:id - Actualizar producto (con validación de rifas activas)
router.put('/:id', authMiddleware, requireRole('provider'), async (req, res) => {
  try {
    const data = updateProductSchema.parse(req.body);
    const product = await productsService.updateProduct(req.user.id, req.params.id, data);
    return success(res, product);
  } catch (err) {
    return error(res, err.message || 'Error al actualizar producto', err.status || 400);
  }
});

// DELETE /api/v1/products/:id - Eliminar producto (con validación)
router.delete('/:id', authMiddleware, requireRole('provider'), async (req, res) => {
  try {
    const result = await productsService.deleteProduct(req.user.id, req.params.id);
    return success(res, result);
  } catch (err) {
    return error(res, err.message || 'Error al eliminar producto', err.status || 400);
  }
});

// POST /api/v1/products/:id/image - Subir imagen del producto
router.post('/:id/image', authMiddleware, requireRole('provider'), imageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) return error(res, 'Imagen requerida', 400);
    const result = await productsService.uploadProductImage(req.user.id, req.params.id, req.file);
    return success(res, result);
  } catch (err) {
    return error(res, err.message || 'Error al subir imagen', err.status || 400);
  }
});

// POST /api/v1/products/:id/video - Subir video del producto
router.post('/:id/video', authMiddleware, requireRole('provider'), videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) return error(res, 'Video requerido', 400);
    const result = await productsService.uploadProductVideo(req.user.id, req.params.id, req.file);
    return success(res, result);
  } catch (err) {
    return error(res, err.message || 'Error al subir video', err.status || 400);
  }
});

module.exports = router;