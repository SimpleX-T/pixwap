import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { User } from "../types";

type FirebaseContextType = {
	currentUser: User | null;
	loading: boolean;
	error: string | null;
};

const FirebaseContext = createContext<FirebaseContextType | undefined>(
	undefined
);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const storedUser = localStorage.getItem("currentUser");
	const [currentUser, setCurrentUser] = useState<User | null>(
		storedUser ? (JSON.parse(storedUser) as User) : null
	);

	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				try {
					setLoading(true);

					// Fetch user data from Firestore
					const userDocRef = doc(db, "users", firebaseUser.uid);
					const userDoc = await getDoc(userDocRef);

					if (userDoc.exists()) {
						setCurrentUser({
							id: firebaseUser.uid,
							...userDoc.data(),
						} as User);

						localStorage.setItem(
							"currentUser",
							JSON.stringify({
								id: firebaseUser.uid,
								...userDoc.data(),
							})
						);
					} else {
						console.error("User document not found in Firestore.");
						setCurrentUser(null);
						localStorage.removeItem("currentUser");
					}
				} catch (err) {
					console.error("Error fetching user data:", err);
					setError("Failed to fetch user data.");
					setCurrentUser(null);
					localStorage.removeItem("currentUser");
				} finally {
					setLoading(false);
				}
			} else {
				setCurrentUser(null);
				localStorage.removeItem("currentUser");
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, []);
	// console.log(currentUser);

	return (
		<FirebaseContext.Provider value={{ currentUser, loading, error }}>
			{children}
		</FirebaseContext.Provider>
	);
};

export const useFirebase = () => {
	const context = useContext(FirebaseContext);
	if (!context) {
		throw new Error("useFirebase must be used within a FirebaseProvider");
	}
	return context;
};
