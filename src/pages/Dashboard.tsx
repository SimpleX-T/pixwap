import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import { db } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Event } from "../types";
import {
	LogOut,
	Plus,
	Crown,
	Image as ImageIcon,
	Download,
	Share2,
	ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Dashboard: React.FC = () => {
	const { currentUser } = useFirebase();
	const { signOut } = useAuth();
	const navigate = useNavigate();
	const [events, setEvents] = useState<Event[]>([]);
	const [totalDownloads, setTotalDownloads] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				setIsLoading(true);
				if (currentUser) {
					const eventsQuery = query(
						collection(db, "events"),
						where("user_id", "==", currentUser.id)
					);
					const eventsSnapshot = await getDocs(eventsQuery);
					const eventsData = eventsSnapshot.docs.map(
						(doc) => ({ id: doc.id, ...doc.data() } as Event)
					);
					setEvents(eventsData);
					setTotalDownloads(
						eventsData.reduce(
							(acc, val) => val.downloads.length + acc,
							0
						)
					);
				}
			} catch (error) {
				console.error("Error fetching events:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchEvents();
	}, [currentUser]);

	const handleSignOut = async () => {
		try {
			await signOut();
			navigate("/login");
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	const getEventStats = () => {
		const maxEvents =
			currentUser?.subscription_status === "premium" ? "∞" : "7";
		return `${events.length}/${maxEvents}`;
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Header */}
			<header className='bg-white shadow'>
				<div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center'>
					<div className='flex items-center space-x-4'>
						<h1 className='text-2xl font-bold tracking-tight text-gray-900'>
							Your Events
						</h1>
						{currentUser?.subscription_status === "premium" && (
							<span className='inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20'>
								<Crown className='w-3 h-3 mr-1' />
								<span className='hidden md:inline-block'>
									Premium
								</span>
							</span>
						)}
					</div>

					<div className='flex items-center space-x-4'>
						<Link
							to='/create-event'
							className='inline-flex items-center md:px-4 p-2 md:py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
							<Plus className='w-4 h-4 md:mr-2' />
							<span className='hidden md:inline-block'>
								New Event
							</span>
						</Link>
						<button
							onClick={handleSignOut}
							className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
							<LogOut className='w-4 h-4 md:mr-2' />
							<span className='hidden md:inline-block'>
								Sign Out
							</span>
						</button>
					</div>
				</div>
			</header>

			<main className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8'>
				{/* Stats Section */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
					<div className='bg-white rounded-lg shadow p-6'>
						<div className='flex items-center justify-between'>
							<h3 className='text-sm font-medium text-gray-500'>
								Total Events
							</h3>
							<ImageIcon className='w-5 h-5 text-gray-400' />
						</div>
						<p className='mt-2 text-3xl font-semibold text-gray-900'>
							{getEventStats()}
						</p>
						{currentUser?.subscription_status === "free" && (
							<Link
								to='/upgrade'
								className='mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800'>
								Upgrade for unlimited events
								<ChevronRight className='w-4 h-4 ml-1' />
							</Link>
						)}
					</div>

					<div className='bg-white rounded-lg shadow p-6'>
						<div className='flex items-center justify-between'>
							<h3 className='text-sm font-medium text-gray-500'>
								Total Downloads
							</h3>
							<Download className='w-5 h-5 text-gray-400' />
						</div>
						<p className='mt-2 text-3xl font-semibold text-gray-900'>
							{totalDownloads}
						</p>
						<p className='mt-4 text-sm text-gray-500'>
							Across all events
						</p>
					</div>

					<div className='bg-white rounded-lg shadow p-6'>
						<div className='flex items-center justify-between'>
							<h3 className='text-sm font-medium text-gray-500'>
								Active Links
							</h3>
							<Share2 className='w-5 h-5 text-gray-400' />
						</div>
						<p className='mt-2 text-3xl font-semibold text-gray-900'>
							{events.length}
						</p>
						<p className='mt-4 text-sm text-gray-500'>
							Shareable event links
						</p>
					</div>
				</div>

				{/* Events Grid */}
				{isLoading ? (
					<div className='text-center py-12'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
					</div>
				) : events.length === 0 ? (
					<div className='text-center py-12 bg-white rounded-lg shadow'>
						<ImageIcon className='mx-auto h-12 w-12 text-gray-400' />
						<h3 className='mt-2 text-sm font-medium text-gray-900'>
							No events yet
						</h3>
						<p className='mt-1 text-sm text-gray-500'>
							Get started by creating your first event.
						</p>
						<div className='mt-6'>
							<Link
								to='/create-event'
								className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
								<Plus className='w-4 h-4 mr-2' />
								New Event
							</Link>
						</div>
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{events.map((event) => (
							<div
								key={event.id}
								className='bg-white rounded-lg shadow hover:shadow-md transition-shadow'>
								<div className='p-6'>
									<h4 className='text-lg font-semibold text-gray-900 mb-2'>
										{event.title}
									</h4>
									<p className='text-gray-600 text-sm mb-4 line-clamp-2'>
										{event.description}
									</p>
									<div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
										<span>
											Created{" "}
											{new Date(
												event.created_at
											).toLocaleDateString()}
										</span>
										<span>
											{event.images?.length || 0} photos
										</span>
									</div>
									<div className='flex items-center justify-between'>
										<Link
											to={`/event/${event.id}`}
											className='text-blue-600 hover:text-blue-800 font-medium text-sm'>
											View Details
										</Link>
										<button
											onClick={() =>
												navigator.clipboard.writeText(
													`${window.location.origin}/event/${event.id}`
												)
											}
											className='text-gray-500 hover:text-gray-700 text-sm flex items-center'>
											<Share2 className='w-4 h-4 mr-1' />
											Share
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</main>
		</div>
	);
};

export default Dashboard;
