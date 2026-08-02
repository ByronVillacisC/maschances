// src/modules/geo/geo.service.js

const COUNTRIES = [
  { code: 'EC', name: 'Ecuador', dialCode: '+593' },
  { code: 'CO', name: 'Colombia', dialCode: '+57' },
  { code: 'PE', name: 'Perú', dialCode: '+51' },
  { code: 'MX', name: 'México', dialCode: '+52' },
  { code: 'AR', name: 'Argentina', dialCode: '+54' },
  { code: 'CL', name: 'Chile', dialCode: '+56' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1' },
  { code: 'ES', name: 'España', dialCode: '+34' }
];

const STATES = {
  EC: [
    { code: 'P', name: 'Pichincha' },
    { code: 'G', name: 'Guayas' },
    { code: 'A', name: 'Azuay' },
    { code: 'M', name: 'Manabí' },
    { code: 'T', name: 'Tungurahua' }
  ],
  CO: [
    { code: 'CUN', name: 'Cundinamarca' },
    { code: 'ANT', name: 'Antioquia' },
    { code: 'VAC', name: 'Valle del Cauca' }
  ],
  MX: [
    { code: 'CDMX', name: 'Ciudad de México' },
    { code: 'JAL', name: 'Jalisco' },
    { code: 'NL', name: 'Nuevo León' }
  ],
  US: [
    { code: 'FL', name: 'Florida' },
    { code: 'TX', name: 'Texas' },
    { code: 'CA', name: 'California' },
    { code: 'NY', name: 'New York' }
  ]
};

const CURRENCIES = [
  { code: 'USD', name: 'Dólar estadounidense', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'COP', name: 'Peso colombiano', symbol: '$' },
  { code: 'PEN', name: 'Sol peruano', symbol: 'S/' },
  { code: 'MXN', name: 'Peso mexicano', symbol: '$' },
  { code: 'ARS', name: 'Peso argentino', symbol: '$' },
  { code: 'CLP', name: 'Peso chileno', symbol: '$' },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs.' },
  { code: 'PYG', name: 'Guaraní paraguayo', symbol: '₲' },
  { code: 'UYU', name: 'Peso uruguayo', symbol: '$U' }
];

function getCountries() {
  return { countries: COUNTRIES };
}

function getStatesByCountry(code) {
  const states = STATES[code.toUpperCase()];
  if (!states) throw { status: 404, message: 'País no encontrado o sin estados registrados' };
  return { country: code.toUpperCase(), states };
}

function getCurrencies() {
  return { currencies: CURRENCIES };
}

module.exports = { getCountries, getStatesByCountry, getCurrencies };