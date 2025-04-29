import axios from 'axios';
import Constants from 'expo-constants';

// Use your computer's IP address for mobile device access
const API_HOST = '192.168.0.28';
const API_PORT = 3000;

const debuggerHost = Constants.expoConfig?.hostUri;
const uri = debuggerHost?.split(':')[0];
export const apiBaseUrl = `http://${uri ?? API_HOST}:${API_PORT}/api`;

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
  },
  timeout: 30000, // 30 seconds timeout
  timeoutErrorMessage: 'Request timed out. Please try again.'
});

export default apiClient;