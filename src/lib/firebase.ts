
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "fa-vision",
  "appId": "1:340465179002:web:f4c555150a25ea691d5ec3",
  "storageBucket": "fa-vision.firebasestorage.app",
  "apiKey": "AIzaSyBpEHk9J_35GMcHw38fjcHu7V4gG0-qNX8",
  "authDomain": "fa-vision.firebaseapp.com",
  "messagingSenderId": "340465179002"
};


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
