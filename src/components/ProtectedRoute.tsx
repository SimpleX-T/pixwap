import { useFirebase } from "@/contexts/FirebaseContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { currentUser } = useFirebase();

	if (!currentUser) {
		return (
			<Navigate
				to='/login'
				replace
			/>
		);
	}

	return <>{children}</>;
}

export default ProtectedRoute;
