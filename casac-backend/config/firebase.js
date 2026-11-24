const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const fileName = (process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'firebase-service-account.json').replace(/^(\.\/|\.\\)/, '');
const serviceAccountPath = path.resolve(process.cwd(), fileName);

try {
  const serviceAccount = require(serviceAccountPath);

  initializeApp({
    credential: cert(serviceAccount)
  });

  console.log('Firebase Admin inicializado correctamente');
} catch (error) {
  console.error('\n❌ ERROR CON EL ARCHIVO DE CREDENCIALES:');
  console.error(`Ruta intentada: ${serviceAccountPath}`);
  console.error(error.message);
  process.exit(1);
}

const auth = getAuth();

module.exports = { auth };