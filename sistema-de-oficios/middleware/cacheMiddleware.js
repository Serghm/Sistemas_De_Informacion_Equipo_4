// Archivo: middleware/cacheMiddleware.js

/**
 * Este middleware añade encabezados a la respuesta para decirle al navegador
 * que no guarde esta página en la caché.
 */
function noCache(req, res, next) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

module.exports = noCache;