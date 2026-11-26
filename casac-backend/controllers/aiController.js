const { db } = require('../config/firebase');

exports.askAdvisor = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Debes enviar una pregunta o mensaje para el AI Advisor.' });
    }

    // 1. Leemos el perfil y contexto financiero del inversor desde Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const preferencias = userData.preferenciasInversion || {
      perfilRiesgo: 'Moderado',
      nivelRiesgo: '4/7',
      horizontePrincipal: '5-10 años',
      objetivo: 'Crecimiento'
    };

    // 2. Preparamos el contexto del sistema (Nexo Advisor de Casa C)
    const systemPrompt = `Eres Nexo Advisor, el asesor financiero inteligente de la plataforma Casa C.
Contexto del inversor:
- Nombre: ${userData.displayName || 'Inversor'}
- Patrimonio sincronizado: €${userData.patrimonioSincronizado || 0}
- Perfil de riesgo: ${preferencias.perfilRiesgo} (${preferencias.nivelRiesgo})
- Horizonte de inversión: ${preferencias.horizontePrincipal}
- Objetivo principal: ${preferencias.objetivo}
- Temas de interés: ${(preferencias.temasInteres || []).join(', ')}

Instrucciones:
- Responde en español de forma clara, ejecutiva y fundamentada en gestión de portafolios y diversificación.
- Adapta tus sugerencias al perfil de riesgo y horizonte del usuario.
- Incluye al final una breve nota aclarando que es una estimación orientativa y no constituye asesoría financiera regulada.`;

    let aiReply = '';

    // 3. Llamada a Groq API si está configurada la clave
    if (process.env.GROQ_API_KEY) {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.4,
          max_tokens: 900
        })
      });

      const groqData = await groqResponse.json();
      if (!groqResponse.ok) {
        throw new Error(groqData.error?.message || 'Error al consultar el motor de IA');
      }

      aiReply = groqData.choices[0].message.content;
    } else {
      // Respuesta de respaldo estructurada si aún no se agrega GROQ_API_KEY en .env
      aiReply = `Basado en tu perfil ${preferencias.perfilRiesgo} y horizonte de ${preferencias.horizontePrincipal}, una opción equilibrada sería diversificar tu exposición reduciendo concentración sectorial y asignando un porcentaje a renta fija de corta duración y activos defensivos. (Modo simulación: agrega GROQ_API_KEY en .env para activar el modelo en vivo).`;
    }

    // 4. Guardamos el intercambio en la subcolección 'ai_chats' del usuario en Firestore
    const chatEntry = {
      userMessage: message,
      advisorReply: aiReply,
      contextoUsado: preferencias,
      timestamp: new Date().toISOString()
    };

    await db.collection('users').doc(uid).collection('ai_chats').add(chatEntry);

    return res.status(200).json({
      advisor: 'Nexo Advisor',
      reply: aiReply,
      contextoCartera: preferencias,
      timestamp: chatEntry.timestamp
    });
  } catch (error) {
    console.error('Error en AI Advisor:', error);
    return res.status(500).json({ error: 'Error al procesar la consulta con el AI Advisor.' });
  }
};

// Obtener historial de conversaciones con el AI Advisor
exports.getAdvisorHistory = async (req, res) => {
  try {
    const uid = req.user.uid;
    const snapshot = await db
      .collection('users')
      .doc(uid)
      .collection('ai_chats')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json({ history });
  } catch (error) {
    console.error('Error al obtener historial de IA:', error);
    return res.status(500).json({ error: 'Error interno al obtener el historial.' });
  }
};