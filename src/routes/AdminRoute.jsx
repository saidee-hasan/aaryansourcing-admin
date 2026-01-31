import { Navigate, useLocation } from "react-router-dom";
import useAdmin from "../hooks/useAdmin";
import useAuth from "../hooks/useAuth";

function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading, error } = useAdmin();
  const location = useLocation();

  // Show loading state
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    console.error("Admin route error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-600 dark:text-red-400 max-w-md p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Permission Error</h3>
          <p>Unable to verify your permissions. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Allow access if user is authenticated and an admin
  if (user && isAdmin) {
    return children;
  }

  // Redirect unauthorized users to home with redirect back
  return <Navigate to="/" state={{ from: location }} replace />;
}

export default AdminRoute;