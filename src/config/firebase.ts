import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyDpM3BnB6bK06ynX5NvuXwTmWQJymTPbX4",
	authDomain: "pixwap-2025.firebaseapp.com",
	projectId: "pixwap-2025",
	storageBucket: "pixwap-2025.firebasestorage.app",
	messagingSenderId: "1043119187678",
	appId: "1:1043119187678:web:006b50e7ad4a1b2bfcc44f",
	measurementId: "G-HTTS51CKJC",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
