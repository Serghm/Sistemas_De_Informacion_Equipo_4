const path = require('path');
const crypto = require('crypto');
const db = require('../config/db');


 // Renderiza el formulario principal de oficios
 
const renderOficiosForm = (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.redirect('/login');
        }
        const vista = path.join(__dirname, '../views/oficios.ejs');
        res.render('oficios', { usuario: req.session.usuario });

    } catch (error) {
        console.error('Error renderizando el formulario de oficios:', error);
        res.status(500).send('Error interno al cargar la página de oficios');
    }
};

// Crear un nuevo oficio en la base de datos
 
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
        return res.redirect(`/oficio/${result.insertId}`);

    } catch (error) {
        console.error('Error al guardar el oficio:', error);
        return res.status(500).send('Error interno al guardar el oficio.');
    }
};



 // Ver un oficio específico por ID
 
const verOficio = async (req, res) => {
    const idOficio = req.params.id;
    try {
        const query = `
            SELECT id, consecutivo, destinatario, departamento, asunto, fecha, folio
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



 //Muestra el panel de administracion con TODOS los oficios // AHORA INCLUYE LÓGICA DE BÚSQUEDA.
 
const renderAdminOficios = async (req, res) => {
    try {
        // Obtenemos el término de búsqueda desde la URL
        const busqueda = req.query.busqueda || "";

        let query;
        let params = []; 

        // Verificamos si el usuario está buscando algo
        if (busqueda.trim() !== '') {
            // SÍ HAY BÚSQUEDA: Preparamos el término para SQL LIKE
            const terminoLike = `%${busqueda.trim()}%`;
            
            //  Creamos la consulta SQL con WHERE y OR
              query = `
                SELECT id, consecutivo, destinatario, asunto, fecha 
                FROM oficios 
                WHERE 
                    consecutivo LIKE ? OR 
                    destinatario LIKE ? OR 
                    asunto LIKE ? OR 
                    departamento LIKE ? OR 
                    folio LIKE ?
                ORDER BY consecutivo DESC
            `;
            
            // Añadimos los parámetros (5 veces, una para cada '?')
            params = [terminoLike, terminoLike, terminoLike, terminoLike, terminoLike];
        
        } else {
            // no hay busqueda: Usamos la consulta original
            query = `
                SELECT id, consecutivo, destinatario, asunto, fecha 
                FROM oficios 
                ORDER BY consecutivo DESC
            `;
        }

        // Ejecutamos la consulta
        const [oficios] = await db.execute(query, params);
        
        // Renderizamos la vista
        res.render('adminOficios', { 
            oficios: oficios,
            usuario: req.session.usuario,
            // Pasamos el término de búsqueda a la vista
            busqueda: busqueda 
        });

    } catch (error) {
        console.error('Error al obtener la lista de oficios:', error);
        res.status(500).send('Error al cargar el panel de oficios.');
    }
};




 // Muestra el formulario para editar un oficio 
 
const renderEditarOficioForm = async (req, res) => {
    const idOficio = req.params.id;
    try {
        // Buscar el oficio por su ID
        const query = `
            SELECT id, consecutivo, destinatario, departamento, asunto, fecha, folio
            FROM oficios WHERE id = ?
        `;
        const [results] = await db.execute(query, [idOficio]);

        if (!results || results.length === 0) {
            return res.status(404).send('Oficio no encontrado');
        }

        const oficio = results[0];

        // Formatear la fecha para el input type="date"
        const fechaDB = new Date(oficio.fecha);
        const year = fechaDB.getUTCFullYear();
        const month = String(fechaDB.getUTCMonth() + 1).padStart(2, '0'); 
        const day = String(fechaDB.getUTCDate()).padStart(2, '0');
        oficio.fecha_formato = `${year}-${month}-${day}`;


        // Renderizar la nueva vista 'editarOficio.ejs'
        return res.render('editarOficio', { 
            oficio: oficio,
            usuario: req.session.usuario
        });

    } catch (error) {
        console.error('Error al buscar el oficio para editar:', error);
        return res.status(500).send('Error interno al buscar el oficio.');
    }
};



 // Actualiza el oficio en la base de datos 
 
const actualizarOficio = async (req, res) => {
    const idOficio = req.params.id;
    // Obtenemos los datos del formulario
    const { destinatario, departamento, asunto, fecha } = req.body;

    try {
        // Ejecutar la consulta UPDATE
        const query = `
            UPDATE oficios
            SET destinatario = ?, departamento = ?, asunto = ?, fecha = ?
            WHERE id = ?
        `;
        const values = [destinatario, departamento, asunto, fecha, idOficio];

        await db.execute(query, values);

        // Redirigir al panel de administrador
        return res.redirect('/admin/oficios');

    } catch (error) {
        console.error('Error al actualizar el oficio:', error);
        return res.status(500).send('Error interno al actualizar el oficio.');
    }
};


module.exports = { 
    renderOficiosForm, 
    crearOficio, 
    verOficio,
    renderAdminOficios,
    renderEditarOficioForm, 
    actualizarOficio      
};