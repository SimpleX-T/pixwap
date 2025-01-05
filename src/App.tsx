import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import Header from "./c./components/ProtectedRoute
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EventCreate from "./pages/EventCreate";
import EventView from "./pages/EventView";
import UpgradeSubscription from "./pages/UpgradeSubscription";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
	},
	{
		path: "/register",
		element: <Register />,
	},
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/dashboard",
		element: (
			<ProtectedRoute>
				<Dashboard />
			</ProtectedRoute>
		),
	},
	{
		path: "/create-event",
		element: (
			<ProtectedRoute>
				<EventCreate />
			</ProtectedRoute>
		),
	},
	{
		path: "/upgrade",
		element: (
			<ProtectedRoute>
				<UpgradeSubscription />
			</ProtectedRoute>
		),
	},
	{
		path: "/event/:id",
		element: <EventView />,
	},
]);

function App() {
	return (
		<FirebaseProvider>
			<div className='min-h-screen bg-gray-100'>
				{/* <Header /> */}
				<main className='container mx-auto px-4 py-8'>
					<RouterProvider router={router} />
				</main>
			</div>
		</FirebaseProvider>
	);
}

export default App;
