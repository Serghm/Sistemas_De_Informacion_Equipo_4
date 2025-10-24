// Archivo: controllers/oficiosController.js

const path = require('path');
const crypto = require('crypto');
const db = require('../config/db');

/**
 * Renderiza el formulario principal de oficios
 */
const renderOficiosForm = (req, res) => {
    try {
        // Verifica que haya sesión activa
        if (!req.session.usuario) {
            return res.redirect('/login');
        }

        // Verifica que la vista exista
        const vista = path.join(__dirname, '../views/oficios.ejs');
        res.render('oficios', { usuario: req.session.usuario });

    } catch (error) {
        console.error('Error renderizando el formulario de oficios:', error);
        res.status(500).send('Error interno al cargar la página de oficios');
    }
};

/**
 * Crear un nuevo oficio en la base de datos
 */
const crearOficio = async (req, res) => {
    const { destinatario, departamento, asunto, fecha } = req.body;
    try {
        const [rows] = await db.execute('SELECT MAX(consecutivo) as max_consecutivo FROM oficios');
        const nuevoConsecutivo = (rows[0].max_consecutivo || 0) + 1;
        const datosParaHash = `${nuevoConsecutivo}${destinatario}${fecha}${Date.now()}`;
        const folio = crypto.createHash('sha256').update(datosParaHash).digest('hex');

        const query = `
            INSERT INTO oficios (consecutivo, destinatario, departamento, asunto, fecha, folio)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [nuevoConsecutivo, destinatario, departamento, asunto, fecha, folio];

        const [result] = await db.execute(query, values);

        // Redirige a la vista de ver el oficio
        return res.redirect(`/oficio/${result.insertId}`);

    } catch (error) {
        console.error('Error al guardar el oficio:', error);
        return res.status(500).send('Error interno al guardar el oficio.');
    }
};

/**
 * Ver un oficio específico por ID
 */
const verOficio = async (req, res) => {
    const idOficio = req.params.id;
    try {
        const query = `
            SELECT consecutivo, destinatario, departamento, asunto, fecha, folio
            FROM oficios WHERE id = ?
        `;
        const [results] = await db.execute(query, [idOficio]);

        if (!results || results.length === 0) {
            return res.status(404).send('Oficio no encontrado');
        }

        return res.render('verOficio', { 
            oficio: results[0],
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error('Error al buscar el oficio:', error);
        return res.status(500).send('Error interno al buscar el oficio.');
    }
};

module.exports = { renderOficiosForm, crearOficio, verOficio };
