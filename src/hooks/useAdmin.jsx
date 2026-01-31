import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from './useAxiosSecure';
import useAuth from './useAuth';

function useAdmin() {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const { 
    data: roleData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['admin', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      
      try {
        // Try multiple endpoints to get user role
        let userData = null;
        
        // First try: Get user by email
        try {
          const response = await axiosSecure.get(`/users/email/${user.email}`);
          if (response.data.success) {
            userData = response.data.data;
          }
        } catch (emailError) {
          console.log("Email endpoint failed, trying profile...");
        }
        
        // Second try: Get current user profile
        if (!userData) {
          try {
            const profileResponse = await axiosSecure.get('/users/profile');
            if (profileResponse.data.success) {
              userData = profileResponse.data.data;
            }
          } catch (profileError) {
            console.log("Profile endpoint failed");
          }
        }
        
        // Fallback: Use Firebase user data
        if (!userData && user) {
          userData = {
            role: 'user', // default role
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
            _id: user.uid
          };
        }
        
        return {
          success: true,
          data: userData
        };
      } catch (error) {
        console.error("Error fetching admin data:", error);
        
        // Ultimate fallback
        if (user) {
          return {
            success: true,
            data: {
              role: 'user',
              email: user.email,
              name: user.displayName,
              photoURL: user.photoURL,
              _id: user.uid
            }
          };
        }
        
        throw error;
      }
    },
    enabled: !!user?.email,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Check user role from backend response
  const userRole = roleData?.data?.role || user?.role || 'user';
  
  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator';
  const isSeller = userRole === 'seller';
  const isTeamMember = isAdmin || isModerator || isSeller;

  return {
    isAdmin,
    isModerator,
    isSeller,
    isTeamMember,
    isLoading,
    error,
    roleData: roleData?.data,
    refetch,
    userRole
  };
}

export default useAdmin;