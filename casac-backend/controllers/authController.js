const { auth } = require('../config/firebase');

// 1. Registro de usuarios (Sign Up)
exports.registerUser = async (req, res) => {
  const { email, password, displayName } = req.body||{};

  if (!email || !password) {
    return res.status(400).json({ error: 'El email y la contraseña son requeridos' });
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: displayName || 'Inversor Casa C',
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

// 2. Inicio de sesión (Login) para obtener el ID Token (Bearer Token)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body||{};

  if (!email || !password) {
    return res.status(400).json({ error: 'El email y la contraseña son requeridos' });
  }

  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta configurar FIREBASE_WEB_API_KEY en el archivo .env' });
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({ error: data.error?.message || 'Credenciales inválidas' });
    }

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      uid: data.localId,
      email: data.email,
      idToken: data.idToken,
      expiresIn: data.expiresIn
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno al iniciar sesión' });
  }
};

// 3. Verificación de Token
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