// Archivo: config/db.js
const mysql = require('mysql2/promise'); // Usamos la versión con promesas para código más limpio
require('dotenv').config(); // Carga las variables del archivo .env

// Creamos un "pool" de conexiones. Es más eficiente que "createConnection" para aplicaciones web.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para verificar que la conexión funciona al iniciar la app
async function checkConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('¡Conexión exitosa a la base de datos MariaDB!');
        connection.release(); // Devolvemos la conexión al pool
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

checkConnection();

// Exportamos el pool para poder usarlo en otras partes de la aplicación
module.exports = pool;