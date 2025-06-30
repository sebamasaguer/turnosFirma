import React, { createContext, useContext, useEffect, useState } from 'react';
// User type from Supabase is replaced by a simpler custom type or one from apiClient
// import { User } from '@supabase/supabase-js';
// import { supabase } from '../lib/supabase';
import { adminLogin, adminLogout, AdminUser, getCurrentAdminUser } from '../lib/apiClient'; // Updated import

// Define a simpler user type, or use AdminUser from apiClient if it fits
interface AuthenticatedUser extends AdminUser {
  // Supabase User object has more fields like 'aud', 'role', 'app_metadata', etc.
  // We'll use a simpler structure based on what our backend provides.
  // AdminUser from apiClient already has id, email, full_name.
  // We might add more fields if our backend's /admin/login returns them.
  token?: string; // Store the token with the user object or manage separately
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  isAdmin: boolean; // This might be inherent if only admins can log in
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // checkAdminStatus might be needed if non-admin users can also login to some part
  // For now, assuming login implies admin
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); // If login implies admin, this could be true when user is not null
  const [loading, setLoading] = useState(true);

  // Effect to check for an existing token on initial load
  useEffect(() => {
    const attemptAutoLogin = async () => {
      const token = localStorage.getItem('adminAuthToken');
      if (token) {
        // Here, you would typically validate the token with the backend.
        // For this example, we'll assume the token's presence means the user is logged in.
        // A better approach: have a '/admin/me' endpoint that returns user info based on token.
        try {
          // A token exists in localStorage. Attempt to fetch the user's data using it.
          try {
            const fetchedUser = await getCurrentAdminUser(); // Calls GET /api/admin/me
            if (fetchedUser) {
              setUser(fetchedUser as AuthenticatedUser); // Store the fetched user details
              setIsAdmin(true);
              // Optionally, update localStorage['adminUser'] if needed, though not strictly necessary
              // if /me is the source of truth on page load.
              localStorage.setItem('adminUser', JSON.stringify(fetchedUser));
            } else {
              // This case might not be hit if getCurrentAdminUser throws an error for non-OK responses
              throw new Error("Fetched user was null or undefined despite valid token response.");
            }
          } catch (error) {
            console.warn("Failed to fetch current user with stored token:", error);
            // If fetching user fails (e.g., token expired, server error), clear stored auth state.
            localStorage.removeItem('adminAuthToken');
            localStorage.removeItem('adminUser');
            setUser(null);
            setIsAdmin(false);
          }
        } else {
          // No token found in localStorage.
          setUser(null);
          setIsAdmin(false);
        }
      } catch (e) {
        // Catch any unexpected errors during the auto-login process
        console.error("Unexpected error during auto-login:", e);
        localStorage.removeItem('adminAuthToken');
        localStorage.removeItem('adminUser');
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    attemptAutoLogin();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: loggedInUser, token } = await adminLogin({ email, password });
      // Token is stored in localStorage by apiClient.adminLogin
      localStorage.setItem('adminUser', JSON.stringify(loggedInUser)); // Store user details
      setUser(loggedInUser as AuthenticatedUser);
      setIsAdmin(true);
    } catch (error) {
      localStorage.removeItem('adminAuthToken');
      localStorage.removeItem('adminUser');
      setUser(null);
      setIsAdmin(false);
      console.error("Sign in failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setLoading(true);
    adminLogout(); // Clears token from localStorage and adminUser from localStorage
    setUser(null);
    setIsAdmin(false);
    setLoading(false);
  };

  const value = {
    user,
    isAdmin,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}