
const mysql = require('mysql2/promise'); // Usamos la versión con promesas
require('dotenv').config(); // Carga las variables del archivo .env

// Creamos un "pool" de conexiones.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// funcion para verificar que la conexion funciona al iniciar la app
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

// Exportamos el pool para poder usarlo en otras partes de la aplicacion
module.exports = pool;