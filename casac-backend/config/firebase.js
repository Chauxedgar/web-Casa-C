const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const dotenv = require('dotenv');

// 1. Cargamos las variables de entorno definidas en el archivo .env
dotenv.config();

// 2. Limpiamos el nombre del archivo por si incluye './' o '.\' y construimos la ruta absoluta
const fileName = (process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'firebase-service-account.json').replace(/^(\.\/|\.\\)/, '');
const serviceAccountPath = path.resolve(process.cwd(), fileName);

// 3. Inicializamos la app de Firebase Admin con las credenciales privadas
try {
  const serviceAccount = require(serviceAccountPath);

  initializeApp({
    credential: cert(serviceAccount)
  });

  console.log('✅ Firebase Admin y Firestore inicializados correctamente');
} catch (error) {
  console.error('\n❌ ERROR CRÍTICO AL INICIALIZAR FIREBASE:');
  console.error(`Ruta intentada: ${serviceAccountPath}`);
  console.error(error.message);
  process.exit(1); // Detiene el servidor si no hay conexión válida a Firebase
}

// 4. Instanciamos los servicios que usaremos en los controladores y middlewares
const auth = getAuth();
const db = getFirestore();

// 5. Exportamos ambos servicios
module.exports = { auth, db };