import axios from 'axios';

/**
 * [WHAT] - This is our Frontend API Client.
 * [WHY] - It provides a single place to configure how our mobile app talks to our backend server.
 * [HOW] - It uses Axios to point to our server's IP address and port.
 */

// [IMPORTANT] - We read the URL from our .env file.
// [WHY] - This allows us to switch between 'localhost' (emulator) and a real IP (real device) easily.
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:5000/api'; 


const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// [WHAT] - A helper to add the user's login token to every request.
// [WHY] - Our backend routes are 'protected', so they need this token to know who the user is.
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;
