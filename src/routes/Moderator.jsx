import { Navigate, useLocation } from "react-router-dom";
import useAdmin from "../hooks/useAdmin";
import useAuth from "../hooks/useAuth";

function ModeratorRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isModerator, isLoading: adminLoading, error } = useAdmin();
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-600 dark:text-red-400 max-w-md p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Permission Error</h3>
          <p>Unable to verify your permissions. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  // Allow access if user is authenticated and a moderator or admin
  if (user && isModerator) {
    return children;
  }

  // Redirect unauthorized users
  return <Navigate to="/" state={{ from: location }} replace />;
}

export default ModeratorRoute;