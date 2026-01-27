// Authentication Context
import { createContext, useContext, useState, useEffect } from "react";
import {
  registerUser,
  loginUser,
  logoutUser,
  subscribeToAuthChanges,
  getUserProfile
} from "../firebase/authService";

const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user profile from Firestore
        const profileResult = await getUserProfile(firebaseUser.uid);
        if (profileResult.success) {
          setUserProfile(profileResult.profile);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register new user
  const register = async (email, password, displayName) => {
    setError(null);
    setLoading(true);
    
    const result = await registerUser(email, password, displayName);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  };

  // Login user
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    
    const result = await loginUser(email, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
    return result;
  };

  // Logout user
  const logout = async () => {
    setError(null);
    const result = await logoutUser();
    
    if (!result.success) {
      setError(result.error);
    }
    
    return result;
  };

  // Clear error
  const clearError = () => setError(null);

  const value = {
    user,
    userProfile,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
