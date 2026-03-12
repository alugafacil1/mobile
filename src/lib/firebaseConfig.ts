import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

/* const firebaseConfig = {
  apiKey: "AIzaSyBUzCbwbxkHqz25JcUfgYaNArLgASwD384",
  authDomain: "aluga-facil-app.firebaseapp.com",
  projectId: "aluga-facil-app",
  storageBucket: "aluga-facil-app.firebasestorage.app",
  messagingSenderId: "943938179786",
  appId: "1:943938179786:web:42c87e1f9f7d6550af9a33",
  measurementId: "G-D7W2WK3FCF"
}; */

const firebaseConfig = {
    apiKey: "AIzaSyCp-Sgb9brEeqVACda7aMbYYdYTBlrvZDg",
    authDomain: "chatalugafacil.firebaseapp.com",
    databaseURL: "https://chatalugafacil-default-rtdb.firebaseio.com/",
    projectId: "chatalugafacil",
    storageBucket: "chatalugafacil.firebasestorage.app",
    messagingSenderId: "572649283019",
    appId: "1:572649283019:web:2d46c7a5a2e18411116a4e"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getDatabase(app);
