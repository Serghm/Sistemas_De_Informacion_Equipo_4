// Archivo: routes/authRoutes.js (Versión Final)
const express = require('express');
const router = express.Router();
const { 
    renderLoginPage, 
    renderRegisterPage, 
    loginUser, 
    registerUser,
    logoutUser,
    renderUsersPanel
} = require('../controllers/authController');
const { protegerAdmin } = require('../middleware/authMiddleware');
const noCache = require('../middleware/cacheMiddleware'); // <-- 1. Importa el anti-caché

// Rutas públicas (no necesitan anti-caché)
router.get('/login', renderLoginPage);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

// Rutas de administrador (protegidas y con anti-caché)
router.get('/usuarios', noCache, protegerAdmin, renderUsersPanel);
router.get('/register', noCache, protegerAdmin, renderRegisterPage);
router.post('/register', noCache, protegerAdmin, registerUser);

module.exports = router;