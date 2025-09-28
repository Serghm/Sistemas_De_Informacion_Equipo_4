const path = require('path');
const bcrypt = require('bcrypt');
const db = require('../config/db');

/**
 * Muestra el panel de administración de usuarios.
 * Obtiene todos los usuarios de la base de datos y los muestra.
 */
const renderUsersPanel = async (req, res) => {
    try {
        // Hacemos una consulta a la BD para obtener los datos básicos de los usuarios
        const [usuarios] = await db.execute('SELECT id, nombre_usuario, nombre_completo, rol FROM usuarios ORDER BY id');
        
        // Renderizamos la nueva vista 'usuarios.ejs' y le pasamos los datos
        res.render('usuarios', { 
            usuarios: usuarios,
            usuario: req.session.usuario // Pasamos la información del usuario logueado para el header
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).send('Error al cargar el panel de usuarios.');
    }
};

const renderLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
};

const renderRegisterPage = (req, res) => {
    // Recuerda que el nombre de tu archivo es 'registrer.html'
    res.sendFile(path.join(__dirname, '..', 'public', 'registrer.html'));
};

const loginUser = async (req, res) => {
    const { nombre_usuario, contrasena } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE nombre_usuario = ?', [nombre_usuario]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const usuario = rows[0];
        const passwordMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta.' });
        }

        req.session.usuario = { id: usuario.id, nombre_usuario: usuario.nombre_usuario, rol: usuario.rol };
        
        res.status(200).json({ message: 'Login exitoso', redirectUrl: '/' });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const registerUser = async (req, res) => {
    const { nombre_usuario, contrasena, nombre_completo, rol } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const rolValido = rol === 'admin' ? 'admin' : 'usuario';
        const query = 'INSERT INTO usuarios (nombre_usuario, contrasena, nombre_completo, rol) VALUES (?, ?, ?, ?)';
        await db.execute(query, [nombre_usuario, hashedPassword, nombre_completo, rolValido]);
        
        // Después de registrar, lo ideal es redirigir al panel de usuarios
        res.redirect('/usuarios');

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al registrar.' });
    }
};

const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('No se pudo cerrar la sesión.');
        }
        res.redirect('/login');
    });
};

// Se añade la nueva función a la lista de lo que exporta el archivo
module.exports = { 
    renderLoginPage, 
    renderRegisterPage, 
    loginUser, 
    registerUser, 
    logoutUser, 
    renderUsersPanel 
};