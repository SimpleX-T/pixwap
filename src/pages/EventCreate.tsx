import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import { db } from "../config/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import {
	X,
	Upload,
	// Image as ImageIcon,
	AlertCircle,
	Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventFormData {
	title: string;
	description: string;
	bannerImage: File | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EventCreate: React.FC = () => {
	const navigate = useNavigate();
	const { currentUser } = useFirebase();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const [formData, setFormData] = useState<EventFormData>({
		title: "",
		description: "",
		bannerImage: null,
	});

	// Check if user has reached their event limit
	const checkEventLimit = async () => {
		if (!currentUser) return false;

		const eventsQuery = query(
			collection(db, "events"),
			where("user_id", "==", currentUser.id)
		);

		const eventsSnapshot = await getDocs(eventsQuery);
		const eventCount = eventsSnapshot.size;

		if (currentUser.subscription_status === "free" && eventCount >= 7) {
			setError(
				"You've reached the maximum number of events for a free account. Please upgrade to create more events."
			);
			return false;
		}

		return true;
	};

	const validateFile = (file: File): string | null => {
		if (!ALLOWED_FILE_TYPES.includes(file.type)) {
			return "Please upload a valid image file (JPEG, PNG, or WebP)";
		}
		if (file.size > MAX_FILE_SIZE) {
			return "File size must be less than 5MB";
		}
		return null;
	};

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) return;

			const fileError = validateFile(file);
			if (fileError) {
				setError(fileError);
				return;
			}

			setFormData((prev) => ({ ...prev, bannerImage: file }));
			setError(null);

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		},
		[]
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentUser) return;

		try {
			setIsLoading(true);
			setError(null);

			// Check event limit
			const canCreateEvent = await checkEventLimit();
			if (!canCreateEvent) {
				setIsLoading(false);
				return;
			}

			// Validate title
			if (formData.title.trim().length < 3) {
				setError("Event title must be at least 3 characters long");
				setIsLoading(false);
				return;
			}

			// Upload banner to Cloudinary
			let bannerImageUrl = "";
			if (formData.bannerImage) {
				const cloudinaryFormData = new FormData();
				cloudinaryFormData.append("file", formData.bannerImage);
				cloudinaryFormData.append("upload_preset", "pixwap"); // You'll need to set this

				const response = await fetch(
					`https://api.cloudinary.com/v1_1/dzwzpjlw8/image/upload`, // You'll need to set this
					{
						method: "POST",
						body: cloudinaryFormData,
					}
				);

				if (!response.ok) {
					throw new Error("Failed to upload image");
				}

				const data = await response.json();
				bannerImageUrl = data.secure_url;
			}

			// Create event in Firebase
			const eventRef = await addDoc(collection(db, "events"), {
				title: formData.title,
				description: formData.description,
				bannerImageUrl,
				created_at: new Date(),
				user_id: currentUser.id,
				images: [],
				downloads: 0,
				viewerEmails: [],
			});

			navigate(`/event/${eventRef.id}`);
		} catch (error) {
			console.error("Error creating event:", error);
			setError(
				error instanceof Error
					? error.message
					: "Failed to create event"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='max-w-3xl mx-auto px-4 py-8'>
			<div className='mb-8'>
				<h1 className='text-2xl font-bold text-gray-900'>
					Create New Event
				</h1>
				<p className='mt-2 text-sm text-gray-600'>
					Create a new event to start collecting and sharing photos
					with your friends.
				</p>
			</div>

			{error && (
				<Alert
					variant='destructive'
					className='mb-6'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<form
				onSubmit={handleSubmit}
				className='space-y-6'>
				<div className='space-y-2'>
					<label
						htmlFor='title'
						className='block text-sm font-medium text-gray-700'>
						Event Title
					</label>
					<input
						type='text'
						id='title'
						value={formData.title}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								title: e.target.value,
							}))
						}
						className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						required
						minLength={3}
						maxLength={100}
						disabled={isLoading}
					/>
				</div>

				<div className='space-y-2'>
					<label
						htmlFor='description'
						className='block text-sm font-medium text-gray-700'>
						Description
					</label>
					<textarea
						id='description'
						value={formData.description}
						onChange={(e) =>
							setFormData((prev) => ({
								...prev,
								description: e.target.value,
							}))
						}
						className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						rows={4}
						disabled={isLoading}
					/>
				</div>

				<div className='space-y-2'>
					<label className='block text-sm font-medium text-gray-700'>
						Banner Image
					</label>

					{imagePreview ? (
						<div className='relative rounded-lg overflow-hidden'>
							<img
								src={imagePreview}
								alt='Banner preview'
								className='w-full h-48 object-cover'
							/>
							<button
								type='button'
								onClick={() => {
									setImagePreview(null);
									setFormData((prev) => ({
										...prev,
										bannerImage: null,
									}));
								}}
								className='absolute top-2 right-2 p-1 bg-gray-900 bg-opacity-50 rounded-full text-white hover:bg-opacity-75'>
								<X className='w-4 h-4' />
							</button>
						</div>
					) : (
						<div className='flex justify-center items-center w-full'>
							<label className='w-full cursor-pointer'>
								<div className='flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50'>
									<div className='flex flex-col items-center justify-center pt-5 pb-6'>
										<Upload className='w-8 h-8 mb-4 text-gray-500' />
										<p className='mb-2 text-sm text-gray-500'>
											<span className='font-semibold'>
												Click to upload
											</span>{" "}
											or drag and drop
										</p>
										<p className='text-xs text-gray-500'>
											PNG, JPG or WebP (MAX. 5MB)
										</p>
									</div>
									<input
										type='file'
										className='hidden'
										onChange={handleFileChange}
										accept={ALLOWED_FILE_TYPES.join(",")}
										disabled={isLoading}
									/>
								</div>
							</label>
						</div>
					)}
				</div>

				<button
					type='submit'
					disabled={isLoading}
					className='w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'>
					{isLoading ? (
						<>
							<Loader2 className='w-4 h-4 mr-2 animate-spin' />
							Creating Event...
						</>
					) : (
						"Create Event"
					)}
				</button>
			</form>
		</div>
	);
};

export default EventCreate;
