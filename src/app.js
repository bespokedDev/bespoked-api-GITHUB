// app.js (o index.js, según donde configures tu app Express)
const express = require('express');
const app = express();
const connectDB = require('./database/database');
const userRoutes = require('./routes/users.route');
const professorRoutes = require('./routes/professors.route');
const studentRoutes = require('./routes/students.route');
const planRoutes = require('./routes/plans.route');
const enrollmentRoutes = require('./routes/enrollments.route');
const payoutRoutes = require('./routes/payouts.route'); // ¡Añade esta línea!
const cors = require('cors');
require('dotenv').config();

// ¡FORZAR CARGA DEL MODELO PROFESSORTYPE TEMPRANO! (Mantener si sigue siendo necesario para profesores)
require('./models/ProfessorType');

// Middlewares
app.use(express.json());
app.use(cors());

// Conectar DB
connectDB();

// --- ¡NUEVA RUTA! Mensaje de Bienvenida en la Raíz ---
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is up and running! Keep moving forward!' });
});
// ----------------------------------------------------

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/professors', professorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payouts', payoutRoutes); // ¡Añade esta línea para las rutas de pagos!

module.exports = app;
