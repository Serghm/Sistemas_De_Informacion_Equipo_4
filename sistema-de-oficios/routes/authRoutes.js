const express = require('express');
const router = express.Router();
const { 
    renderLoginPage, 
    renderRegisterPage, 
    loginUser, 
    registerUser,
    logoutUser,
    renderUsersPanel,
    resetPasswordAdmin 
} = require('../controllers/authController');
const { protegerAdmin } = require('../middleware/authMiddleware');
const noCache = require('../middleware/cacheMiddleware'); // esto importa el anticache

// Rutas públicas 
router.get('/login', renderLoginPage);
router.post('/login', loginUser);
router.get('/logout', logoutUser);


router.get('/register', renderRegisterPage);
router.post('/register', registerUser);

router.get('/usuarios', noCache, protegerAdmin, renderUsersPanel);
// Ruta para que el admin restablezca la contraseña de un usuario
router.post('/admin/reset-password/:id', noCache, protegerAdmin, resetPasswordAdmin);


module.exports = router;