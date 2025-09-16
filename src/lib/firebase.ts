
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAooE58pfmLlwtJYqVYtbBY-iweawgrWYY",
  authDomain: "eng-name-468403-f5.firebaseapp.com",
  projectId: "eng-name-468403-f5",
  storageBucket: "eng-name-468403-f5.firebasestorage.app",
  messagingSenderId: "20250015401",
  appId: "1:20250015401:web:0f872d6a105841d6e4dbb8"
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
