
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
    getAuth, 
    Auth
} from 'firebase/auth';
import { 
    getFirestore, 
    initializeFirestore,
    enableIndexedDbPersistence,
    Firestore
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAooE58pfmLlwtJYqVYtbBY-iweawgrWYY",
  authDomain: "eng-name-468403-f5.firebaseapp.com",
  projectId: "eng-name-468403-f5",
  storageBucket: "eng-name-468403-f5.appspot.com",
  messagingSenderId: "20250015401",
  appId: "1:20250015401:web:0f872d6a105841d6e4dbb8"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined' && !getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    enableIndexedDbPersistence(db)
      .catch((error) => {
        if ((error as any).code === 'failed-precondition') {
          console.warn('Firestore persistence failed: Multiple tabs open.');
        } else if ((error as any).code === 'unimplemented') {
          console.warn('Firestore persistence failed: Browser does not support it.');
        }
      });

} else if (getApps().length > 0) {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
} else {
    // For server-side rendering, initialize a temporary app
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
}

export { app, db, auth };

    