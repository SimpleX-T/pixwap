import { useAuth } from "@/hooks/useAuth";
import React, { useState } from "react";
import { FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useFirebase } from "@/contexts/FirebaseContext";

type LoginFormData = {
	email: string;
	password: string;
};

const Login: React.FC = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState("");
	const { signIn } = useAuth();
	const navigate = useNavigate();
	const { currentUser } = useFirebase();
	console.log(currentUser);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>();

	const onSubmit = async (data: LoginFormData) => {
		const { email, password } = data;

		try {
			setIsLoading(true);
			await signIn(email, password);
			navigate("/dashboard");
		} catch (error) {
			setError(
				"Error during login. Please check your credentials and try again."
			);
			console.error("Login Error: ", error);
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

			<h2 className='text-2xl font-bold mb-4'>Login</h2>

			{error && <p className='text-red-500 mb-4'>{error}</p>}

			<form
				onSubmit={handleSubmit(onSubmit)}
				className='space-y-4'>
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
									"Please Provide a valid email address",
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
									"The password field must not be empty",
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
					className='w-full bg-blue-600 flex items-center justify-center text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'>
					{isLoading ? (
						<FaSpinner className='animate-spin' />
					) : (
						"Login"
					)}
				</button>
			</form>

			<div className='flex items-center gap-2 mt-4'>
				<p>
					New to <span className='font-semibold'>Pixwap</span> ?
				</p>
				<Link
					to='/register'
					className='underline font-medium'>
					Register
				</Link>
			</div>
		</div>
	);
};

export default Login;
