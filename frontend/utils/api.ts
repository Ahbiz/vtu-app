import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:5000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory store for the authenticated user's email.
// Set alongside the JWT so any screen can read it without decoding the token.
let _userEmail = '';

export const setAuthToken = (token: string | null, email?: string) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (email) _userEmail = email;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    _userEmail = '';
  }
};

export const getUserEmail = (): string => _userEmail;

export default apiClient;
