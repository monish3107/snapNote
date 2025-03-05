import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBQM_svd32loZldi8ucGpBzOP4iESc8bOU",
  authDomain: "snapnote-9386c.firebaseapp.com",
  projectId: "snapnote-9386c",
  storageBucket: "snapnote-9386c.firebasestorage.app",
  messagingSenderId: "913194201307",
  appId: "1:913194201307:web:ddceaa282f56643ed7dcfe",
  measurementId: "G-1GMX03NN4K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };