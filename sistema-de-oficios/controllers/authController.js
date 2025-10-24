const path = require('path');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const crypto = require('crypto'); 


//Muestra el panel de administracion de usuarios.(Obtiene todos los usuarios de la base de datos y los muestra.)
 
const renderUsersPanel = async (req, res) => {
    try {
        //consulta a la BD para obtener los datos basicos de los usuarios
        const [usuarios] = await db.execute('SELECT id, nombre_usuario, nombre_completo, rol FROM usuarios ORDER BY id');
        
        // Renderizamos 'usuarios.ejs' 
        res.render('usuarios', { 
            usuarios: usuarios,
            usuario: req.session.usuario, // Pasamos la informacion del usuario logueado para el header/nav
            // tempPasswordInfo: undefined // Aseguramos que no haya mensaje de contraseña
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
        
        // Despues de registrar, redirigir al panel de usuarios
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


//Restablece la contraseña de un usuario (Admin). (Responde a POST /admin/reset-password/:id)

const resetPasswordAdmin = async (req, res) => {
    const adminId = req.session.usuario.id;
    const userIdToReset = req.params.id;

    try {
        //Verificación de seguridad: Admin no puede resetear su propia cuenta
        if (Number(adminId) === Number(userIdToReset)) {
            console.warn(`Admin (ID: ${adminId}) intentó auto-restablecer su contraseña.`);
            // recargamos el panel
            return res.redirect('/usuarios');
        }

        //Generar contraseña temporal (ej. 8f1-a4c-2b9)
        const tempPassword = crypto.randomBytes(4).toString('hex').match(/.{1,3}/g).join('-');

        //Hashear la contraseña temporal
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        //Actualizar la contraseña en la BD y obtener el nombre de usuario
        const [userRows] = await db.execute('SELECT nombre_usuario FROM usuarios WHERE id = ?', [userIdToReset]);
        if (userRows.length === 0) {
            return res.status(404).send('Usuario a restablecer no encontrado.');
        }
        const userName = userRows[0].nombre_usuario;

        await db.execute('UPDATE usuarios SET contrasena = ? WHERE id = ?', [hashedPassword, userIdToReset]);

        // Volver a cargar la lista de usuarios para mostrar el panel actualizado
        const [usuarios] = await db.execute('SELECT id, nombre_usuario, nombre_completo, rol FROM usuarios ORDER BY id');

        // Renderizar el panel con el mensaje de éxito
        res.render('usuarios', {
            usuarios: usuarios,
            usuario: req.session.usuario,
            tempPasswordInfo: {
                pass: tempPassword,
                userName: userName
            }
        });

    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        res.status(500).send('Error interno al restablecer la contraseña.');
    }
};



module.exports = { 
    renderLoginPage, 
    renderRegisterPage, 
    loginUser, 
    registerUser, 
    logoutUser, 
    renderUsersPanel,
    resetPasswordAdmin 
};