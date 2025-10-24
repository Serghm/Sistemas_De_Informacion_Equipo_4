const mysql = require('mysql2/promise');
// require('dotenv').config(); // <-- Comentado o eliminado

const pool = mysql.createPool({
    host: 'localhost',                // <-- Valor directo
    user: 'oficios_user3',           // <-- Valor directo
    password: '050880Susana',         // <-- Valor directo
    database: 'oficios_db',           // <-- Valor directo
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function checkConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('¡Conexión exitosa a la base de datos MariaDB!');
        connection.release();
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

checkConnection();

module.exports = pool;