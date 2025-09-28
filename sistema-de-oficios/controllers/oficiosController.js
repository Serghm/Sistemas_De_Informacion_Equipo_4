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

        const query = 'INSERT INTO oficios (consecutivo, destinatario, departamento, asunto, fecha, folio) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [
            nuevoOficio.consecutivo, 
            nuevoOficio.destinatario, 
            nuevoOficio.departamento, 
            nuevoOficio.asunto, 
            nuevoOficio.fecha, 
            nuevoOficio.folio
        ];

        
        // Guardamos el resultado de la consulta en la variable 'result'.
        const [result] = await db.execute(query, values);

        // Redirigimos a la ruta para ver el oficio, usando el ID del registro que se inserto.
        res.redirect(`/oficio/${result.insertId}`);

    } catch (error) {
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
        res.render('verOficio', { 
            oficio: results[0],
            usuario: req.session.usuario 
        });
    } catch (error) {
        console.error('Error al buscar el oficio:', error);
        res.status(500).send("Error interno al buscar el oficio.");
    }
};

module.exports = { renderOficiosForm, crearOficio, verOficio };