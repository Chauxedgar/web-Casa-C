const { auth } = require('../config/firebase');

// 1. Registro de usuarios (Sign Up)
exports.registerUser = async (req, res) => {
  const { email, password, displayName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'El email y la contraseña son requeridos' });
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || 'Usuario de Casa C',
    });

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      uid: userRecord.uid,
      email: userRecord.email
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Verificación de Token para Rutas Protegidas (Como "Login" o "Dashboard")
// El cliente se logueará en el frontend usando Firebase Client SDK, obtendrá un token y nos lo enviará para validar
exports.verifyUserToken = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    res.status(200).json({
      message: 'Token válido, acceso concedido',
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || ''
    });
  } catch (error) {
    console.error('Error al verificar el token:', error);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};