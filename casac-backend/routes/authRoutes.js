const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para registrar un nuevo usuario
router.post('/register', authController.registerUser);

// Ruta para verificar que el usuario esté logueado (Se usa al iniciar sesión o acceder a datos privados)
router.post('/verify-token', authController.verifyUserToken);

module.exports = router;