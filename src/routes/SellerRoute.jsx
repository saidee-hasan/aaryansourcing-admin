import { Navigate, useLocation } from "react-router-dom";
import useAdmin from "../hooks/useAdmin";
import useAuth from "../hooks/useAuth";

function SellerRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isSeller, isModerator, isAdmin, isLoading: adminLoading, error } = useAdmin();
  const location = useLocation();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking seller permissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Seller route error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>Error checking permissions. Please try again.</p>
        </div>
      </div>
    );
  }

  if (user && (isSeller || isModerator || isAdmin)) {
    return children;
  }

  return <Navigate to="/" state={{ from: location }} replace />;
}

export default SellerRoute;