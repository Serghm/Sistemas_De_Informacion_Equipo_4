const express = require('express');
const router = express.Router();
const { renderOficiosForm, crearOficio, verOficio } = require('../controllers/oficiosController');
const { protegerRuta } = require('../middleware/authMiddleware');
const noCache = require('../middleware/cacheMiddleware'); // importa el anticache

// Aplica los guardianes a las rutas que lo necesitan
router.get('/', noCache, protegerRuta, renderOficiosForm);
router.post('/guardar-oficio', noCache, protegerRuta, crearOficio);
router.get('/oficio/:id', noCache, protegerRuta, verOficio);

module.exports = router;