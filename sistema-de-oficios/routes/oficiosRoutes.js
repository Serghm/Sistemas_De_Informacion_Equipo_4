const express = require('express');
const router = express.Router();

const { 
  renderOficiosForm, 
  crearOficio, 
  verOficio,
  renderAdminOficios 
} = require('../controllers/oficiosController');

// Importacion de AMBOS middlewares de protección
const { protegerRuta, protegerAdmin } = require('../middleware/authMiddleware'); 
const noCache = require('../middleware/cacheMiddleware'); // Middleware anticache

// Ruta para mostrar el formulario principal de oficios
router.get('/oficios', noCache, protegerRuta, renderOficiosForm);

// Ruta para crear un nuevo oficio
router.post('/guardar-oficio', noCache, protegerRuta, crearOficio);

// Ruta para ver un oficio específico por ID
router.get('/oficio/:id', noCache, protegerRuta, verOficio);


// Ruta para que el admin vea TODOS los oficios
router.get('/admin/oficios', noCache, protegerAdmin, renderAdminOficios);


module.exports = router;
