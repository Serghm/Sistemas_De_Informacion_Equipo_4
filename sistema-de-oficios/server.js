// Archivo: server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const oficiosRoutes = require('./routes/oficiosRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        httpOnly: true,
        
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Primero las rutas para que tengan prioridad
app.use('/', oficiosRoutes);
app.use('/', authRoutes);

// Al final los archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});