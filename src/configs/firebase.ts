import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZKV8D2w6kVzRWI20gAAXqz-XKTPlehgw",
  authDomain: "bondy-9da05.firebaseapp.com",
  projectId: "bondy-9da05",
  storageBucket: "bondy-9da05.firebasestorage.app",
  messagingSenderId: "41020965784",
  appId: "1:41020965784:web:7d84128d7c272dcd70a1ed",
  measurementId: "G-TS9CDTQ8RT",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
