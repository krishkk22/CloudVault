import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Log environment variables (without sensitive values)
console.log('Firebase environment variables loaded:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? '***' : 'undefined',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'undefined',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'undefined',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'undefined',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || 'undefined',
  appId: process.env.REACT_APP_FIREBASE_APP_ID ? '***' : 'undefined'
});

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  const app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
  
  auth = getAuth(app);
  console.log('Firebase Auth initialized');
  
  db = getFirestore(app);
  console.log('Firebase Firestore initialized');
  
  storage = getStorage(app);
  console.log('Firebase Storage initialized');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { auth, db, storage }; 