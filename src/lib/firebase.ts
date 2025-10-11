
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
    getAuth, 
    Auth
} from 'firebase/auth';
import { 
    getFirestore, 
    Firestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
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

// Helper to get a single instance of Firestore
const getDb = () => {
    if (!db) {
        if (typeof window !== 'undefined') {
            app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            try {
                 db = initializeFirestore(app, {
                    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
                 });
            } catch (error) {
                // This can happen if the user has multiple tabs open and persistence is already enabled.
                // In this case, we can fall back to the regular getFirestore.
                console.warn("Could not initialize persistent cache with multi-tab support. Falling back.", error);
                db = getFirestore(app);
            }
        } else {
            // Server-side rendering
            app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            db = getFirestore(app);
        }
    }
    return db;
};


if (typeof window !== 'undefined') {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getDb();
} else {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
}


export { app, auth, db };
