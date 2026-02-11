import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCabAI_5Mq1khIgfHSAClD0zyR111dYz5k",
  authDomain: "iptv-53039.firebaseapp.com",
  projectId: "iptv-53039",
  storageBucket: "iptv-53039.firebasestorage.app",
  messagingSenderId: "125547492852",
  appId: "1:125547492852:web:321239dd9474647ecab5a1",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
