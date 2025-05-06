import axios from 'axios';
import { Platform } from 'react-native';

// Get the API URL based on platform and environment
const getApiUrl = () => {
  if (Platform.OS === 'web') {
    // Web uses relative URL
    return '/api';
  }
  
  // For Android emulator, use 10.0.2.2 (special IP that connects to host)
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/api';
  }
  
  // For iOS simulator or default fallback
  return 'http://localhost:3001/api';
};

// Create API client with appropriate URL
const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  timeoutErrorMessage: 'Request timed out. Please try again.',
});

// Log all requests for debugging
apiClient.interceptors.request.use(request => {
  console.log('API Request:', request.method.toUpperCase(), request.baseURL + request.url);
  return request;
});

// Log all responses for debugging
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received');
    }
    return Promise.reject(error);
  }
);

export default apiClient;