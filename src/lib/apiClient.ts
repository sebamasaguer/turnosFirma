// src/lib/apiClient.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Define types based on your backend's expected request/response bodies
// These might be similar to your Supabase types but could diverge.

export type Appointment = {
  id: string; // Assuming UUIDs are strings
  user_name: string;
  user_email: string;
  user_phone: string;
  user_dni: string;
  appointment_date: string; // Consider Date objects if you parse them
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string; // Consider Date objects
};

export type AppointmentInsert = Omit<Appointment, 'id' | 'created_at' | 'status'> & {
  status?: 'pending' | 'confirmed' | 'cancelled';
};

export type AppointmentUpdate = Partial<Omit<Appointment, 'id' | 'created_at'>> & {
  id: string; // id is required for update path
};


export type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
};

// Helper function for making API requests
async function fetchApi(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('adminAuthToken');
  const headers: HeadersInit = { // Explicitly type headers
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network response was not ok and error response body could not be parsed' }));
    console.error('API Error:', response.status, errorData);
    throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
  }
  // For 204 No Content, response.json() will fail.
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

// --- Appointments API ---
export const getAppointments = (): Promise<Appointment[]> => {
  return fetchApi('/appointments');
};

export const createAppointment = (appointmentData: AppointmentInsert): Promise<Appointment> => {
  return fetchApi('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });
};

export const updateAppointment = (id: string, appointmentData: Partial<Omit<Appointment, 'id'|'created_at'>>): Promise<Appointment> => {
  return fetchApi(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(appointmentData),
  });
};

export const deleteAppointment = (id: string): Promise<{ message: string; deletedAppointment: Appointment } | null> => {
  return fetchApi(`/appointments/${id}`, {
    method: 'DELETE',
  });
};

// --- Admin API ---
// Mock login, replace with secure auth
export const adminLogin = async (credentials: { email: string; password: string }): Promise<{ message: string; user: AdminUser; token: string }> => {
  const response = await fetchApi('/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  // The backend now returns a real JWT.
  // Store the token upon successful login.
  if (response.token) {
    localStorage.setItem('adminAuthToken', response.token);
  }
  return response; // Contains { message, user, token }
};

export const adminLogout = () => {
  localStorage.removeItem('adminAuthToken');
  localStorage.removeItem('adminUser'); // Also clear stored user details if any
  // No backend call for logout in this setup, but could be added (e.g., to invalidate token server-side if using a blacklist).
};

// Protected admin routes will now automatically include the token via fetchApi
export const getAdminUsers = (): Promise<AdminUser[]> => {
  return fetchApi('/admin/users');
};

export const createAdminUser = (userData: Omit<AdminUser, 'id' | 'created_at'> & {password: string}): Promise<AdminUser> => {
    return fetchApi('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

export const updateAdminUser = (id: string, userData: Partial<Omit<AdminUser, 'id' | 'created_at'>>): Promise<AdminUser> => {
    return fetchApi(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
};

export const deleteAdminUser = (id: string): Promise<{ message: string; deletedUser: AdminUser } | null> => {
    return fetchApi(`/admin/users/${id}`, {
        method: 'DELETE',
    });
};

export const getCurrentAdminUser = (): Promise<AdminUser> => {
  return fetchApi('/admin/me');
};


// You would add more functions here for other admin-related API calls
// e.g., createAdminUser, updateAdminUser, deleteAdminUser, etc.
// Remember to handle authentication tokens for protected admin routes.
// The current admin routes on the backend do not yet enforce token authentication.
// The `authenticateAdmin` middleware is a placeholder.
// The `localStorage.setItem('adminAuthToken', response.token)` is for demonstration with the mock token.
// In a real app, ensure tokens are handled securely (e.g., HttpOnly cookies if possible, or secure storage).
