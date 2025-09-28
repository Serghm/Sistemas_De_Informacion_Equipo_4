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
const noCache = require('../middleware/cacheMiddleware'); // esto importa el anticache

// Rutas públicas "no necesitan anti-cache"
router.get('/login', renderLoginPage);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

// Rutas de administrador "protegidas y con anti-cache"
router.get('/usuarios', noCache, protegerAdmin, renderUsersPanel);
router.get('/register', noCache, protegerAdmin, renderRegisterPage);
router.post('/register', noCache, protegerAdmin, registerUser);

module.exports = router;