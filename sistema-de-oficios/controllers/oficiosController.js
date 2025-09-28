// Archivo: controllers/oficiosController.js (Corregido)
const path = require('path');
const crypto = require('crypto');
const db = require('../config/db');

const renderOficiosForm = (req, res) => {
    res.render('oficios', { usuario: req.session.usuario });
};

const crearOficio = async (req, res) => {
    const { destinatario, departamento, asunto, fecha } = req.body;
    try {
        const [rows] = await db.execute('SELECT MAX(consecutivo) as max_consecutivo FROM oficios');
        const nuevoConsecutivo = (rows[0].max_consecutivo || 0) + 1;
        const datosParaHash = `${nuevoConsecutivo}${destinatario}${fecha}${Date.now()}`;
        const folio = crypto.createHash('sha256').update(datosParaHash).digest('hex');

        const nuevoOficio = { 
            consecutivo: nuevoConsecutivo, 
            destinatario, 
            departamento, 
            asunto, 
            fecha, 
            folio 
        };

        // --- ¡CORRECCIÓN IMPORTANTE AQUÍ! ---
        // Antes usábamos 'INSERT INTO oficios SET ?', que es una sintaxis corta
        // que no es compatible con el método `execute` de mysql2.

        // Ahora, construimos la consulta SQL completa y pasamos los valores en un array,
        // que es la forma correcta y segura.
        const query = 'INSERT INTO oficios (consecutivo, destinatario, departamento, asunto, fecha, folio) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            nuevoOficio.consecutivo, 
            nuevoOficio.destinatario, 
            nuevoOficio.departamento, 
            nuevoOficio.asunto, 
            nuevoOficio.fecha, 
            nuevoOficio.folio
        ];

        await db.execute(query, values);

        res.redirect('/');
    } catch (error) {
        // Este console.error es el que nos ayudó a encontrar el problema.
        console.error('Error al guardar el oficio:', error);
        res.status(500).send("Error interno al guardar el oficio.");
    }
};

const verOficio = async (req, res) => {
    const idOficio = req.params.id;
    try {
        const query = 'SELECT consecutivo, destinatario, departamento, asunto, fecha, folio FROM oficios WHERE id = ?';
        const [results] = await db.execute(query, [idOficio]);
        if (results.length === 0) {
            return res.status(404).send('Oficio no encontrado');
        }
        res.render('oficio', { 
            oficio: results[0],
            usuario: req.session.usuario 
        });
    } catch (error) {
        console.error('Error al buscar el oficio:', error);
        res.status(500).send("Error interno al buscar el oficio.");
    }
};

module.exports = { renderOficiosForm, crearOficio, verOficio };