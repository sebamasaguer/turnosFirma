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


  try {
    const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

    if (!response.ok) {
      let errorPayload;
      try {
        errorPayload = await response.json();
      } catch (e) {
        // If response.json() fails (e.g. not valid JSON, or empty for some errors)
        // or if the response was not JSON at all.
        console.error('API Error: Could not parse JSON from error response.', e);
        // We'll use the status text if available, or a generic message.
        throw new Error(`HTTP ${response.status}: ${response.statusText || 'Server error occurred'}`);
      }
      // Prefer server's 'error' or 'message' field, otherwise construct one.
      const errorMessage = errorPayload?.error || errorPayload?.message || `HTTP ${response.status}: An unspecified error occurred.`;
      console.error('API Error:', response.status, errorPayload);
      throw new Error(errorMessage);
    }

    // Handle 204 No Content specifically, as response.json() would fail.
    if (response.status === 204) {
      return null; // Or an appropriate representation for "no content"
    }

    return response.json(); // For 200 OK and other successful responses with a body

  } catch (error) {
    // This catch block handles:
    // 1. Network errors (fetch itself fails, e.g., server unreachable)
    // 2. Errors explicitly thrown from the !response.ok block (already Error objects)
    // 3. Errors from response.json() if the successful response body is not valid JSON (less common for 2xx)
    console.error('API call failed:', error);

    // Ensure we're always throwing an Error object
    if (error instanceof Error) {
      throw error;
    } else {
      // In case something else was thrown that wasn't an Error object
      throw new Error(String(error) || 'An unknown error occurred during the API call.');
    }
  }
}

// --- Appointments API ---
export interface GetAppointmentsParams {
  appointment_date?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'all'; // 'all' or undefined for no status filter
  sortBy?: 'created_at' | 'appointment_date' | 'user_name' | 'status';
  order?: 'ASC' | 'DESC';
}

export const getAppointments = (params?: GetAppointmentsParams): Promise<Appointment[]> => {
  let url = '/appointments';
  if (params) {
    const queryParams = new URLSearchParams();
    if (params.appointment_date) queryParams.append('appointment_date', params.appointment_date);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  return fetchApi(url);
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
