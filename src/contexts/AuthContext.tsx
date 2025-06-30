import React, { createContext, useContext, useEffect, useState } from 'react';
// User type from Supabase is replaced by a simpler custom type or one from apiClient
// import { User } from '@supabase/supabase-js';
// import { supabase } from '../lib/supabase';
import { adminLogin, adminLogout, AdminUser, getAdminUsers } from '../lib/apiClient'; // Import new auth functions

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
          // Mock: if we have a token, we try to fetch user data (e.g., admin users list to see if token works)
          // This is not a direct user validation, but a way to check if token is still valid for some resources.
          // A dedicated endpoint like GET /api/admin/auth/me would be better.
          const adminUsers = await getAdminUsers(); // This uses the token from apiClient's fetchApi
          // If the above call succeeds, it means the token is (likely) still valid for fetching protected resources.
          // We need to reconstruct the user object. The token itself doesn't contain all user details.
          // This is a limitation of not having a "me" endpoint.
          // For now, we'll set a placeholder user if token exists.
          // In a real scenario, you'd fetch the user's own data using the token.

          // Let's try to get the user from localStorage if we stored it before,
          // or we could fetch the user details based on the token.
          const storedUser = localStorage.getItem('adminUser');
          if (storedUser) {
            const parsedUser: AuthenticatedUser = JSON.parse(storedUser);
            setUser({...parsedUser, token});
            setIsAdmin(true); // Assuming anyone who can log in via adminLogin is an admin.
          } else {
            // If only token is there but no user info, it's partial.
            // For simplicity, we might clear the token if user info is missing.
            // Or, rely on a "get current user" endpoint.
            // For now, if no storedUser, we can't fully re-authenticate without a "me" endpoint.
            localStorage.removeItem('adminAuthToken'); // Clean up if inconsistent
          }

        } catch (error) {
          console.warn("Auto-login with token failed or no specific user data available:", error);
          localStorage.removeItem('adminAuthToken'); // Token might be invalid
          localStorage.removeItem('adminUser');
        }
      }
      setLoading(false);
    };
    attemptAutoLogin();
  }, []);


  // checkAdminStatus is no longer directly called on Supabase auth change.
  // Instead, our adminLogin will determine if the user is an admin.
  // If the app structure changes to allow non-admin logins, this needs revisiting.
  // For now, if `adminLogin` is successful, we assume isAdmin is true.

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: loggedInUser, token } = await adminLogin({ email, password });
      const authenticatedUser: AuthenticatedUser = { ...loggedInUser, token };
      setUser(authenticatedUser);
      setIsAdmin(true); // Assuming successful admin login means they are an admin
      localStorage.setItem('adminAuthToken', token); // Handled by apiClient, but good to be explicit
      localStorage.setItem('adminUser', JSON.stringify(loggedInUser)); // Store user details
    } catch (error) {
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('adminAuthToken');
      localStorage.removeItem('adminUser');
      console.error("Sign in failed:", error);
      throw error; // Re-throw to be caught by LoginPage
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    // adminLogout from apiClient handles localStorage.removeItem('adminAuthToken')
    adminLogout();
    localStorage.removeItem('adminUser'); // Also clear stored user details
    setUser(null);
    setIsAdmin(false);
    // No backend call for signOut in the current apiClient, but could be added.
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