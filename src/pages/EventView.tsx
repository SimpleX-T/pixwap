import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import { db, storage } from "../config/firebase";
import {
	doc,
	getDoc,
	updateDoc,
	arrayUnion,
	arrayRemove,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Event, Image } from "../types";
import { Loader2, Upload, Trash2, AlertCircle, ImageIcon } from "lucide-react";
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

		let uploadedCount = 0;
		const totalFiles = selectedImages.length;

		for (const file of selectedImages) {
			try {
				const storageRef = ref(
					storage,
					`events/${id}/${file.name}-${Date.now()}`
				);
				const uploadTask = uploadBytesResumable(storageRef, file);

				await new Promise((resolve, reject) => {
					uploadTask.on(
						"state_changed",
						(snapshot) => {
							const fileProgress =
								snapshot.bytesTransferred / snapshot.totalBytes;
							const overallProgress =
								((uploadedCount + fileProgress) / totalFiles) *
								100;
							setUploadProgress(overallProgress);
						},
						reject,
						resolve
					);
				});

				const downloadURL = await getDownloadURL(
					uploadTask.snapshot.ref
				);
				const newImage: Image = {
					id: `${Date.now()}-${uploadedCount}`,
					url: downloadURL,
					created_at: new Date(),
					event_id: id,
				};

				await updateDoc(doc(db, "events", id), {
					images: arrayUnion(newImage),
				});

				setEvent((prev) =>
					prev
						? {
								...prev,
								images: [...prev.images, newImage],
						  }
						: null
				);

				uploadedCount++;
			} catch (err) {
				setError(`Failed to upload ${file.name}: ${err}`);
			}
		}

		setIsUploading(false);
		setUploadProgress(0);
		setSelectedImages([]);
		setImageBlobs([]);
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
					<CardTitle>{event?.title}</CardTitle>
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
									<Button
										disabled={isUploading}
										onClick={handlePhotoInputClick}>
										<Upload className='h-4 w-4 mr-2' />
										Select Images
									</Button>
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
						<div className='flex flex-wrap gap-4 mb-8 p-4 border rounded-lg bg-muted/50'>
							{imageBlobs.map((blob, index) => (
								<div
									key={index}
									className='relative w-24 h-24 group'>
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
						</div>
					)}

					{event?.images.length ? (
						<ImageGallery />
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

			<Dialog
				open={!!selectedImage}
				onOpenChange={() => setSelectedImage(null)}>
				<DialogContent className='max-w-4xl'>
					<DialogHeader>
						<DialogTitle>Image Preview</DialogTitle>
					</DialogHeader>
					{selectedImage && (
						<img
							src={selectedImage}
							alt='Preview'
							className='w-full h-auto rounded-lg'
						/>
					)}
				</DialogContent>
			</Dialog>
		</main>
	);
};

export default EventView;
