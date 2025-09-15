
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

// This function determines which config to use.
const getFirebaseConfig = () => {
  // If running on the server (during build or in a server component), 
  // and the server-side config is available, use it.
  if (typeof window === 'undefined' && process.env.FIREBASE_WEBAPP_CONFIG) {
    return JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
  }
  
  // Otherwise, we are on the client side. Use the public environment variables.
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };
};

const firebaseConfig = getFirebaseConfig();

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

// Habilitar la persistencia solo en el navegador
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('La persistencia de Firestore falló, probablemente por múltiples pestañas abiertas.');
    } else if (err.code == 'unimplemented') {
      console.warn('El navegador actual no soporta la persistencia de Firestore.');
    }
  });
}

export { app, db, auth };
