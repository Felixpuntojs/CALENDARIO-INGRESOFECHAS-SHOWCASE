const admin = require('firebase-admin');

// Las credenciales vienen de variables de entorno (secretas)
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  const { action, data } = JSON.parse(event.body);

  try {
    if (action === 'getEvents') {
      // Obtener eventos del mes
      const snapshot = await db.collection('events').get();
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return {
        statusCode: 200,
        body: JSON.stringify(events)
      };
    }

    if (action === 'addEvent') {
      // Agregar evento
      await db.collection('events').add({
        date: data.date,
        description: data.description,
        timestamp: new Date()
      });
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }

    if (action === 'deleteEvent') {
      // Eliminar evento
      await db.collection('events').doc(data.id).delete();
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Acción no reconocida' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
