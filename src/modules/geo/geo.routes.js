// src/modules/geo/geo.routes.js
const router = require('express').Router();
const geoService = require('./geo.service');
const { ok, error } = require('../../utils/response');

// GET /api/v1/geo/countries — público
router.get('/countries', (req, res) => {
  try {
    const result = geoService.getCountries();
    return ok(res, result);
  } catch (err) {
    return error(res, err.message || 'Error interno', err.status || 500);
  }
});

// GET /api/v1/geo/countries/:code/states — público
router.get('/countries/:code/states', (req, res) => {
  try {
    const result = geoService.getStatesByCountry(req.params.code);
    return ok(res, result);
  } catch (err) {
    return error(res, err.message || 'Error interno', err.status || 500);
  }
});

// GET /api/v1/geo/currencies — público
router.get('/currencies', (req, res) => {
  try {
    const result = geoService.getCurrencies();
    return ok(res, result);
  } catch (err) {
    return error(res, err.message || 'Error interno', err.status || 500);
  }
});

module.exports = router;