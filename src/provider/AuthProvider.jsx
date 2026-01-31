import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth } from "../../firebase.init";
import useAxiosPublic from "../hooks/useAxiosPublic";

export const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const axiosPublic = useAxiosPublic();

  // Create user with Firebase
  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Login user with Firebase
  const loginUser = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Update user profile
  const updateUserProfile = (name, photo) => {
    if (auth.currentUser) {
      return updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photo,
      });
    }
    return Promise.reject("No user logged in");
  };

  // Sign out user
  const signOutUser = () => {
    setLoading(true);
    localStorage.removeItem("access-Token");
    setUsers([]);
    return signOut(auth);
  };

  // Get users from backend - UPDATED VERSION
  const getUsers = async () => {
    try {
      const token = localStorage.getItem("access-Token");
      if (!token) {
        console.log("No token available");
        setUsers([]);
        return;
      }

      const response = await axiosPublic.get("/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Users API Response:", response.data);
      
      // Handle different response formats
      if (response.data && response.data.success) {
        // New API response format with pagination
        const usersData = response.data.data || response.data.users || [];
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else if (Array.isArray(response.data)) {
        // Legacy format - direct array
        setUsers(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      // Set empty array on error
      setUsers([]);
    }
  };

  // Generate JWT token for Firebase user
  const generateJWTToken = async (firebaseUser) => {
    try {
      const response = await axiosPublic.post("/auth/jwt", {
        email: firebaseUser.email
      });
      
      if (response.data.success) {
        localStorage.setItem("access-Token", response.data.data.token);
        
        // Merge Firebase user with backend user data
        const backendUser = response.data.data.user;
        setUser({
          ...firebaseUser,
          ...backendUser,
          _id: backendUser._id || firebaseUser.uid,
          role: backendUser.role || 'user'
        });
        
        return response.data.data.token;
      }
    } catch (error) {
      console.error("Error generating JWT token:", error);
      // Create a fallback token for development
      const fallbackToken = 'dev-token-' + Date.now();
      localStorage.setItem("access-Token", fallbackToken);
      return fallbackToken;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Generate JWT token for the Firebase user
          const token = await generateJWTToken(firebaseUser);
          
          if (token) {
            // Fetch users list if user has admin/moderator role
            const currentUserRole = user?.role || 'user';
            if (currentUserRole === 'admin' || currentUserRole === 'moderator') {
              await getUsers();
            }
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
        }
      } else {
        // User signed out
        setUser(null);
        setUsers([]);
        localStorage.removeItem("access-Token");
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const authInfo = {
    users,
    createUser,
    loginUser,
    user,
    signOutUser,
    loading,
    updateUserProfile,
    getUsers,
    refreshUsers: getUsers // Alias for refresh
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;