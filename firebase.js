// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Copia aquí la configuración que te dio Firebase en la consola
const firebaseConfig = {
  apiKey: "AIzaSyDRurUc9yi23JoVK_MxBLYNB4hdGX-RoAw",
  authDomain: "mus-tracker-shared.firebaseapp.com",
  projectId: "mus-tracker-shared",
  storageBucket: "mus-tracker-shared.appspot.com",
  messagingSenderId: "800679766998",
  appId: "1:800679766998:web:537f83fd5f89b6dfef1277",
  measurementId: "G-NH2BV442YT"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Obtén la referencia a Firestore
const db = getFirestore(app);

export { db };
