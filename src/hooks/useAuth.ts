import {
	signIn,
	signUp,
	signOut,
	getCurrentUser,
} from "./../services/authServices";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase";
import { User } from "../types";

export const useAuth = () => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			try {
				if (firebaseUser) {
					const userData = await getCurrentUser();
					setUser(userData);
				} else {
					setUser(null);
				}
			} catch (error) {
				setError(
					error instanceof Error ? error.message : "An error occured"
				);
			} finally {
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, []);

	const handleSignUp = async (
		email: string,
		password: string,
		displayName: string
	) => {
		try {
			setError(null);
			const user = await signUp(email, password, displayName);
			setUser(user);
			return user;
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred during sign up"
			);
			throw err;
		}
	};

	const handleSignIn = async (email: string, password: string) => {
		try {
			setError(null);
			const user = await signIn(email, password);
			setUser(user);
			return user;
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred during sign in"
			);
			throw err;
		}
	};

	const handleSignOut = async () => {
		try {
			setError(null);
			await signOut();
			setUser(null);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred during sign out"
			);
			throw err;
		}
	};

	return {
		user,
		loading,
		error,
		signUp: handleSignUp,
		signIn: handleSignIn,
		signOut: handleSignOut,
	};
};
