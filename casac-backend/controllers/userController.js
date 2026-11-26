const { db } = require('../config/firebase');

exports.getUserProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const initialProfile = {
        uid: uid,
        email: req.user.email || '',
        displayName: req.user.name || 'Inversor Casa C',
        telefono: '',
        residenciaFiscal: 'Colombia',
        idioma: 'Español',
        plan: 'Patrimonio',
        patrimonioSincronizado: 0,
        preferenciasInversion: {
          perfilRiesgo: 'Moderado',
          nivelRiesgo: '4/7',
          horizontePrincipal: '5-10 años',
          objetivo: 'Crecimiento',
          temasInteres: ['Tecnología', 'Sostenibilidad', 'Divisas']
        },
        notificaciones: {
          movimientosMercado: true,
          ideasAiAdvisor: true,
          resumenDiario: true,
          novedadesCasaC: false
        },
        createdAt: new Date().toISOString()
      };

      await userRef.set(initialProfile);
      return res.status(200).json(initialProfile);
    }

    return res.status(200).json(userDoc.data());
  } catch (error) {
    console.error('Error al obtener el perfil en Firestore:', error);
    return res.status(500).json({ error: 'Error interno del servidor al obtener el perfil.' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const {
      displayName,
      telefono,
      residenciaFiscal,
      idioma,
      preferenciasInversion,
      notificaciones
    } = req.body;

    const updatedFields = {
      ...(displayName !== undefined && { displayName }),
      ...(telefono !== undefined && { telefono }),
      ...(residenciaFiscal !== undefined && { residenciaFiscal }),
      ...(idioma !== undefined && { idioma }),
      ...(preferenciasInversion !== undefined && { preferenciasInversion }),
      ...(notificaciones !== undefined && { notificaciones }),
      updatedAt: new Date().toISOString()
    };

    await db.collection('users').doc(uid).set(updatedFields, { merge: true });

    return res.status(200).json({
      message: 'Perfil y preferencias actualizados correctamente',
      updatedFields
    });
  } catch (error) {
    console.error('Error al actualizar el perfil en Firestore:', error);
    return res.status(500).json({ error: 'Error interno del servidor al actualizar el perfil.' });
  }
};