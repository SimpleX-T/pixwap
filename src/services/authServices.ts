import {
	signInWithEmailAndPassword,
	signOut as firebaseSignOut,
	updateProfile,
	createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { User } from "@/types";

export const signUp = async (
	email: string,
	password: string,
	displayName: string
): Promise<User> => {
	try {
		// Create the user in Firebase Authentication
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		const firebaseUser = userCredential.user;

		// Update the user's display name in Firebase Authentication
		await updateProfile(firebaseUser, { displayName });

		// Prepare the additional user data
		const userData: Omit<User, "id"> = {
			displayName,
			email,
			pfpUrl: "",
			subscription_status: "free",
			subscription_id: "",
		};

		// Store the additional user data in Firestore
		await setDoc(doc(db, "users", firebaseUser.uid), {
			...userData,
			createdAt: serverTimestamp(),
		});

		return {
			id: firebaseUser.uid,
			...userData,
		};
	} catch (error) {
		// Handle and rethrow errors for the UI to manage
		console.error("Error during sign-up:", error);
		throw error;
	}
};

export const signIn = async (email: string, password: string) => {
	try {
		// Sign the user in using Firebase Authentication
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		const firebaseUser = userCredential.user;

		// Fetch the additional user data from Firestore
		const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
		if (!userDoc.exists()) {
			throw new Error("User data not found in Firestore");
		}

		// Return the combined user data
		return userDoc.data() as User;
	} catch (error) {
		console.error("Error during sign-in:", error);
		throw error;
	}
};

export const signOut = async () => {
	await firebaseSignOut(auth);
};

export const getCurrentUser = async (): Promise<User | null> => {
	const user = auth.currentUser;
	if (!user) return null;

	const userDoc = await getDoc(doc(db, "users", user.uid));
	if (!userDoc.exists()) return null;

	return userDoc.data() as User;
};
