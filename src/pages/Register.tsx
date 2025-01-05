import { useFirebase } from "@/contexts/FirebaseContext";
import { useAuth } from "@/hooks/useAuth";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaUser, FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";
import { Link, Navigate, useNavigate } from "react-router-dom";

type SignUpFormData = {
	email: string;
	password: string;
	displayName: string;
};

const Register: React.FC = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const { signUp } = useAuth();
	const { currentUser } = useFirebase();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpFormData>();

	const onSubmit = async (data: SignUpFormData) => {
		const { email, password, displayName } = data;
		try {
			setIsLoading(true);
			await signUp(email, password, displayName);
			alert("Signup Successful");
			navigate("/dashboard");
		} catch (error) {
			setError("Error during signup. Please try again.");
			console.error("Signup error: ", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='max-w-md mx-auto'>
			{currentUser && currentUser?.email !== "" && (
				<Navigate
					to='/dashboard'
					replace
				/>
			)}
			<h2 className='text-2xl font-bold mb-4'>Register</h2>
			{error && <p className='text-red-500 mb-4'>{error}</p>}

			<form
				onSubmit={handleSubmit(onSubmit)}
				className='space-y-4'>
				<div>
					<label
						htmlFor='displayName'
						className='block mb-1'>
						Display Name
					</label>
					<div className='relative'>
						<FaUser className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
						<input
							type='text'
							id='displayName'
							disabled={isLoading}
							{...register("displayName", {
								required:
									"Display name is needed to create your account",
							})}
							className='w-full pl-10 pr-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
						/>
					</div>
					{errors.displayName && (
						<span className='text-red-600 text-xs'>
							{errors.displayName.message}
						</span>
					)}
				</div>

				<div>
					<label
						htmlFor='email'
						className='block mb-1'>
						Email
					</label>
					<div className='relative'>
						<FaEnvelope className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
						<input
							type='email'
							id='email'
							disabled={isLoading}
							{...register("email", {
								required:
									"Please input a valid email address to continue this process",
							})}
							className='w-full pl-10 pr-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
						/>
					</div>
					{errors.email && (
						<span className='text-red-600 text-xs'>
							{errors.email.message}
						</span>
					)}
				</div>

				<div>
					<label
						htmlFor='password'
						className='block mb-1'>
						Password
					</label>
					<div className='relative'>
						<FaLock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
						<input
							type='password'
							id='password'
							disabled={isLoading}
							{...register("password", {
								required:
									"You need a password to secure your account",
							})}
							className='w-full pl-10 pr-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
						/>
					</div>
					{errors.password && (
						<span className='text-red-600 text-xs'>
							{errors.password.message}
						</span>
					)}
				</div>

				<button
					type='submit'
					disabled={isLoading}
					className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center disabled:cursor-not-allowed'>
					{isLoading ? (
						<FaSpinner className='animate-spin' />
					) : (
						"Register"
					)}
				</button>
			</form>

			<div className='flex items-center gap-2 mt-4 text-center'>
				<p>
					Already have a <span className='font-semibold'>Pixwap</span>{" "}
					account?
				</p>
				<Link
					to='/login'
					className='underline font-medium'>
					Signin
				</Link>
			</div>
		</div>
	);
};

export default Register;
