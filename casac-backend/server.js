const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Permite recibir JSON en las peticiones

// Rutas
app.use('/api/auth', authRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.send('Servidor de Casa C funcionando con Firebase Auth');
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de Casa C corriendo en http://localhost:${PORT}`);
});