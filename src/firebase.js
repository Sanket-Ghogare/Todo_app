// Replace these with your actual Firebase config values
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5a1eic6u5veHV1pbpxwCyO6M7xI1yF9A",
  authDomain: "realtime-todo-app-ea9e4.firebaseapp.com",
  projectId: "realtime-todo-app-ea9e4",
  storageBucket: "realtime-todo-app-ea9e4.firebasestorage.app",
  messagingSenderId: "1075749248839",
  appId: "1:1075749248839:web:85fcb765e4938289e83662",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
