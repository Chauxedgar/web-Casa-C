const { auth } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Acceso denegado. No se proporcionó un token de autorización válido.'
      });
    }

    const idToken = authHeader.replace('Bearer ', '').trim();

    if (!idToken) {
      return res.status(401).json({
        error: 'Token de autorización vacío.'
      });
    }

    const decodedToken = await auth.verifyIdToken(idToken);

    req.user = decodedToken;
    next();

  } catch (error) {
    console.error('Error al verificar token en middleware:', error.message);

    return res.status(403).json({
      error: 'Token inválido o expirado. Por favor, inicia sesión nuevamente.'
    });
  }
};

module.exports = verifyToken;
