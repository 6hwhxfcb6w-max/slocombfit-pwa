import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrftlzhF91XUKyGD9IXlx-8m6Pibma4rs",
  authDomain: "slocombfit.firebaseapp.com",
  projectId: "slocombfit",
  storageBucket: "slocombfit.firebasestorage.app",
  messagingSenderId: "1058673816733",
  appId: "1:1058673816733:web:62cc724653efdb414e1074"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
