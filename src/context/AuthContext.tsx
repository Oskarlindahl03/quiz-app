import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of our auth context
interface AuthContextData {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Define the User type
interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to clear stored auth data
  const clearStoredAuthData = async () => {
    try {
      console.log('[AuthContext] Clearing stored authentication data...');
      await AsyncStorage.removeItem('@QuizApp:user');
      await AsyncStorage.removeItem('@QuizApp:token');
      console.log('[AuthContext] Stored authentication data cleared');
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      console.error('[AuthContext] Error clearing stored auth data:', err);
    }
  };

  // Check if user is already logged in on app start
  useEffect(() => {
    const loadStoredUser = async () => {
      console.log('[AuthContext] Checking for stored user...');
      try {
        const storedUser = await AsyncStorage.getItem('@QuizApp:user');
        const storedToken = await AsyncStorage.getItem('@QuizApp:token');
        
        console.log('[AuthContext] Stored user:', storedUser);
        console.log('[AuthContext] Stored token:', storedToken);
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          console.log('[AuthContext] Setting authenticated user:', parsedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          console.log('[AuthContext] No stored user found, setting isAuthenticated to false');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('[AuthContext] Error loading stored user:', err);
        setError('Failed to load user data');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        console.log('[AuthContext] Finished loading user, setting isLoading to false');
        setIsLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('[AuthContext] login called with:', { email });
      // TODO: Replace with actual API call
      // This is a placeholder for the actual API call
      // const response = await api.post('/auth/login', { email, password });
      // const { user, token } = response.data;
      // For now, simulate a successful login
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: email,
      };
      const mockToken = 'mock-jwt-token';
      // Store user data and token
      await AsyncStorage.setItem('@QuizApp:user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('@QuizApp:token', mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);
      console.log('[AuthContext] login successful');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error('[AuthContext] login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function (renamed to signUp)
  const signUp = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('[AuthContext] signUp called with:', { username, email });
      // TODO: Replace with actual API call
      // This is a placeholder for the actual API call
      // const response = await api.post('/auth/signup', { username, email, password });
      // const { user, token } = response.data;
      // For now, simulate a successful signup
      const mockUser = {
        id: '1',
        username: username,
        email: email,
      };
      const mockToken = 'mock-jwt-token';
      // Store user data and token
      await AsyncStorage.setItem('@QuizApp:user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('@QuizApp:token', mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);
      console.log('[AuthContext] signUp successful');
    } catch (err) {
      setError('Signup failed. Please try again.');
      console.error('[AuthContext] signUp error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('[AuthContext] logout called');
      // Clear stored data
      await AsyncStorage.removeItem('@QuizApp:user');
      await AsyncStorage.removeItem('@QuizApp:token');
      setUser(null);
      setIsAuthenticated(false);
      console.log('[AuthContext] logout successful');
    } catch (err) {
      console.error('[AuthContext] Error during logout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        user,
        login,
        signUp,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 