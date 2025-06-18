
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
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: 'client' | 'provider') =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  // Services
  getServices: () => apiRequest('/api/services'),

  // Provider-Services
  getProviderServices: (provider_id: number) => 
    apiRequest(`/api/provider-services?provider_id=${provider_id}`),

  addProviderService: (provider_id: number, service_id: string) =>
    apiRequest('/api/provider-services', {
      method: 'POST',
      body: JSON.stringify({ provider_id, service_id }),
    }),

  removeProviderService: (id: string) =>
    apiRequest(`/api/provider-services/${id}`, {
      method: 'DELETE',
    }),

  // Bookings
  createBooking: (service_id: string, scheduled_time: string) =>
    apiRequest('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ service_id, scheduled_time }),
    }),

  // Provider
  toggleAvailability: (userId: number, is_available: boolean) =>
    apiRequest(`/api/users/${userId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ is_available }),
    }),
};
