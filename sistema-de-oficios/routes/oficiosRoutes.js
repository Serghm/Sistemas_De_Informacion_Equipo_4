// Archivo: routes/oficiosRoutes.js

const express = require('express');
const router = express.Router();

const { 
  renderOficiosForm, 
  crearOficio, 
  verOficio 
} = require('../controllers/oficiosController');

const { protegerRuta } = require('../middleware/authMiddleware');
const noCache = require('../middleware/cacheMiddleware'); // Middleware anticache

// ===========================================
// Rutas principales del módulo de oficios
// ===========================================

// Ruta para mostrar el formulario principal de oficios
// Protegida: solo usuarios autenticados
router.get('/oficios', noCache, protegerRuta, renderOficiosForm);

// Ruta para crear un nuevo oficio
router.post('/guardar-oficio', noCache, protegerRuta, crearOficio);

// Ruta para ver un oficio específico por ID
router.get('/oficio/:id', noCache, protegerRuta, verOficio);

// ===========================================
// Exportar el enrutador
// ===========================================
module.exports = router;

