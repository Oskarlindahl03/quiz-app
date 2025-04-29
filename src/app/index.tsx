import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    console.log('[Index] Auth state:', { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return null; // or a loading spinner
  }
  
  console.log('[Index] Redirecting to:', isAuthenticated ? '/(tabs)' : '/(auth)');
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)'} />;
}
