import React from "react";
import { Link } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import { FaUser, FaSignOutAlt } from "react-icons/fa";

const Header: React.FC = () => {
	const { currentUser } = useFirebase();

	return (
		<header className='bg-blue-600 text-white'>
			<div className='container mx-auto px-4 py-4 flex justify-between items-center'>
				<Link
					to='/'
					className='text-2xl font-bold'>
					ImageShare
				</Link>
				<nav>
					{currentUser ? (
						<div className='flex items-center space-x-4'>
							<Link
								to='/dashboard'
								className='flex items-center'>
								<FaUser className='mr-2' />
								{currentUser.displayName}
							</Link>
							<button className='flex items-center'>
								<FaSignOutAlt className='mr-2' />
								Logout
							</button>
						</div>
					) : (
						<div className='space-x-4'>
							<Link
								to='/login'
								className='hover:underline'>
								Login
							</Link>
							<Link
								to='/register'
								className='bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100'>
								Register
							</Link>
						</div>
					)}
				</nav>
			</div>
		</header>
	);
};

export default Header;
