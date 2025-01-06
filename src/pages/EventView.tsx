import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import { db } from "../config/firebase";
import { arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";

import { Event, Image } from "../types";
import {
	Upload,
	Trash2,
	AlertCircle,
	ImageIcon,
	DownloadCloud,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DownloadRecord } from "@/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EventView = () => {
	const { id } = useParams<{ id: string }>();
	const { currentUser } = useFirebase();
	const [event, setEvent] = useState<Event | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isUploading, setIsUploading] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [selectedImages, setSelectedImages] = useState<File[]>([]);
	const [imageBlobs, setImageBlobs] = useState<
		{ url: string; name: string }[]
	>([]);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const MAX_IMAGES = currentUser?.subscription_status === "free" ? 10 : 30;
	const photoInputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		const fetchEvent = async () => {
			if (!id) return;
			try {
				const eventDoc = await getDoc(doc(db, "events", id));
				if (eventDoc.exists()) {
					setEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
				}
			} catch (err) {
				setError(`Failed to load event: ${err}`);
			} finally {
				setIsLoading(false);
			}
		};
		fetchEvent();
	}, [id]);

	const handlePhotoInputClick = () => {
		photoInputRef.current?.click();
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		const files = Array.from(e.target.files);
		setError("");

		if (selectedImages.length + files.length > MAX_IMAGES) {
			setError(`You can only upload up to ${MAX_IMAGES} images`);
			e.target.value = "";
			return;
		}

		const validFiles = files.filter((file) => {
			if (!ALLOWED_FILE_TYPES.includes(file.type)) {
				setError(`Invalid file type: ${file.name}`);
				return false;
			}
			if (file.size > MAX_FILE_SIZE) {
				setError(`File too large: ${file.name}`);
				return false;
			}
			return true;
		});

		setSelectedImages((prev) => [...prev, ...validFiles]);
		const newBlobUrls = validFiles.map((file) => ({
			url: URL.createObjectURL(file),
			name: file.name,
		}));
		setImageBlobs((prev) => [...prev, ...newBlobUrls]);
	};

	const handleUpload = async () => {
		if (!selectedImages.length || !currentUser || !id || !event) return;
		setIsUploading(true);
		setError(null);

		const totalImages: Omit<Image, "id">[] = [];

		for (const [index, file] of selectedImages.entries()) {
			try {
				const imageFormData = new FormData();
				imageFormData.append("file", file);
				imageFormData.append("upload_preset", "pixwap");

				const res = await fetch(
					`https://api.cloudinary.com/v1_1/dzwzpjlw8/image/upload`,
					{
						method: "POST",
						body: imageFormData,
					}
				);
				if (!res.ok) {
					throw new Error(`Failed to upload image ${file.name}`);
				}
				const data = await res.json();
				const imageData = {
					url: data.secure_url || "",
					event_id: id,
					created_at: new Date(),
				};
				totalImages.push(imageData);
				removeImage(index);
				setUploadProgress((prev) => prev + 1);
			} catch (err) {
				setError(`Failed to upload ${file.name}: ${err}`);
			}
		}

		console.log(totalImages);

		if (totalImages.length === 0) return alert("No images to upload");

		await updateDoc(doc(db, "events", id), {
			images: totalImages,
		});

		setIsUploading(false);
		setUploadProgress(0);
		setSelectedImages([]);
		setImageBlobs([]);
		alert("Upload Successful");
		window.location.reload();
	};

	const removeImage = (index: number) => {
		URL.revokeObjectURL(imageBlobs[index].url);
		setSelectedImages((prev) => prev.filter((_, i) => i !== index));
		setImageBlobs((prev) => prev.filter((_, i) => i !== index));
	};

	// Rest of your component remains the same until the return statement...

	return (
		<main className='container mx-auto px-4 py-8 space-y-8'>
			{error && (
				<Alert variant='destructive'>
					<AlertCircle className='h-4 w-4' />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<Card>
				<CardHeader>
					<CardTitle className='font-semibold text-lg'>
						{event?.title}
					</CardTitle>
					<CardDescription>{event?.description}</CardDescription>
				</CardHeader>
				<CardContent>
					{currentUser?.id === event?.user_id && (
						<div className='mb-8 space-y-4'>
							<div className='flex items-center justify-between'>
								<p className='text-sm text-muted-foreground'>
									{event?.images.length || 0} / {MAX_IMAGES}{" "}
									images uploaded
								</p>
								<div className='flex gap-2'>
									{selectedImages.length !== MAX_IMAGES && (
										<Button
											disabled={isUploading}
											onClick={handlePhotoInputClick}>
											<Upload className='h-4 w-4 mr-2' />
											Select Images
										</Button>
									)}
								</div>
								<Input
									type='file'
									className='hidden'
									onChange={handleImageSelect}
									accept={ALLOWED_FILE_TYPES.join(",")}
									disabled={isUploading}
									multiple
									ref={photoInputRef}
								/>
							</div>

							{isUploading && (
								<Progress
									value={uploadProgress}
									className='w-full'
								/>
							)}
						</div>
					)}

					{imageBlobs.length > 0 && (
						<div className='flex flex-wrap justify-around gap-4 mb-8 p-4 border rounded-lg bg-muted/50'>
							{imageBlobs.map((blob, index) => (
								<div
									key={index}
									className='relative w-24 h-24 group mb-5'>
									<img
										src={blob.url}
										alt={`Preview ${index + 1}`}
										className='w-full h-full object-cover rounded-md'
									/>
									<Button
										variant='destructive'
										size='icon'
										className='absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity'
										onClick={() => removeImage(index)}>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>
							))}
							{selectedImages.length > 0 && (
								<Button
									onClick={handleUpload}
									disabled={isUploading}
									variant='default'>
									{isUploading
										? "Uploading..."
										: "Upload Selected"}
								</Button>
							)}
						</div>
					)}

					{event?.images.length ? (
						<div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
							{event?.images.map((image, index) => (
								<Card
									key={index}
									className='group relative overflow-hidden'>
									<CardContent className='p-0'>
										<img
											src={image.url}
											alt='Event'
											className='w-full aspect-square object-cover cursor-pointer transition-transform group-hover:scale-105'
											onClick={() =>
												setSelectedImage(image.url)
											}
										/>
										{currentUser?.id === event.user_id && (
											<Button
												variant='destructive'
												size='icon'
												className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
												onClick={() =>
													handleImageDelete(image)
												}>
												<Trash2 className='h-4 w-4' />
											</Button>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<div className='text-center py-12'>
							<ImageIcon className='mx-auto h-12 w-12 text-muted-foreground' />
							<p className='mt-2 text-sm text-muted-foreground'>
								No images yet
							</p>
						</div>
					)}
				</CardContent>
			</Card>
			<ImagePreviewDialog
				selectedImage={selectedImage}
				onClose={() => setSelectedImage(null)}
				eventId={id || ""}
			/>
		</main>
	);
};

function ImagePreviewDialog({
	selectedImage,
	onClose,
	eventId,
}: {
	selectedImage: string | null;
	onClose: () => void;
	eventId: string;
}) {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [emailError, setEmailError] = useState<string | null>(null);

	const handleDownload = async () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setEmailError("Please enter a valid email");
			return;
		}

		setIsSubmitting(true);
		setEmailError(null);

		try {
			await updateDoc(doc(db, "events", eventId), {
				downloads: arrayUnion({
					user_email: email,
					download_date: new Date(),
				} as DownloadRecord),
			});

			const response = await fetch(`${selectedImage}`);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `image-${Date.now()}.jpg`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			setEmailError("Failed to process download");
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={!!selectedImage}
			onOpenChange={onClose}>
			<DialogContent className='max-w-xl rounded-lg w-full'>
				<DialogHeader>
					<DialogTitle>Image Preview</DialogTitle>
				</DialogHeader>
				{selectedImage && (
					<>
						<img
							src={selectedImage}
							alt='Preview'
							className='w-full h-auto rounded-lg'
						/>
						<div className='mt-4 space-y-4'>
							<Input
								type='email'
								placeholder='Enter your email to download'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className={emailError ? "border-red-500" : ""}
							/>
							{emailError && (
								<p className='text-sm text-red-500'>
									{emailError}
								</p>
							)}
							<Button
								onClick={handleDownload}
								disabled={isSubmitting}
								className='w-full'>
								<DownloadCloud className='h-4 w-4 mr-2' />
								{isSubmitting
									? "Processing..."
									: "Download Image"}
							</Button>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default EventView;
