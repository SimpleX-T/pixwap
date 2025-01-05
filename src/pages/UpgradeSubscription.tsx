import React from "react";
// import { useFirebase } from "../contexts/FirebaseContext";
// import { db } from "../config/firebase";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FaCrown } from "react-icons/fa";

// const generateSubscriptionId = () => {
// return Math.random().toString(36).substring(2, 8).toUpperCase();
// };

const UpgradeSubscription: React.FC = () => {
	// const { currentUser } = useFirebase();

	// const handleUpgrade = async () => {
	// 	if (!currentUser) return;

	// 	try {
	// 		// Here you would typically integrate with a payment processor
	// 		// For this example, we'll just update the user's subscription status
	// 		const userDoc = await getDoc(doc(db, "users", currentUser.id));
	// 		console.log(userDoc.data());
	// 		// await updateDoc(doc(db, "users", currentUser.id), {
	// 		// 	subscription_status: "premium",
	// 		// 	subscription_id: "premium_" + generateSubscriptionId(),
	// 		// });

	// 		// alert("Upgrade successful! You are now a premium user.");
	// 	} catch (error) {
	// 		console.error("Failed to upgrade subscription:", error);
	// 		alert("Failed to upgrade subscription. Please try again.");
	// 	}
	// };

	return (
		<div className='max-w-md mx-auto'>
			<h2 className='text-2xl font-bold mb-4'>Upgrade to Premium</h2>
			<div className='bg-white shadow-md rounded-lg p-6'>
				<h3 className='text-xl font-semibold mb-4 flex items-center'>
					<FaCrown className='text-yellow-500 mr-2' />
					Premium Benefits
				</h3>
				<ul className='list-disc list-inside mb-6'>
					<li>Create unlimited events</li>
					<li>Upload up to 50 images per event</li>
					<li>Increased storage capacity (10GB)</li>
					<li>Priority customer support</li>
				</ul>
				<button
					onClick={() => alert("Feature coming soon")}
					className='w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600'>
					Upgrade Now - $9.99/month
				</button>
			</div>
		</div>
	);
};

export default UpgradeSubscription;
