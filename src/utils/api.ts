
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: 'client' | 'provider') =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  // Services
  getServices: () => apiRequest('/api/services'),

  // Bookings
  createBooking: (service_id: string, scheduled_time: string) =>
    apiRequest('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ service_id, scheduled_time }),
    }),

  getMyBookings: () => apiRequest('/bookings/me'),

  // Provider
  toggleAvailability: (is_available: boolean) =>
    apiRequest('/providers/availability', {
      method: 'PATCH',
      body: JSON.stringify({ is_available }),
    }),
};
