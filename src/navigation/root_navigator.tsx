import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Import navigators
import AuthNavigator from './auth_navigator';
import AppNavigator from './app_navigator';

// Import auth context
import { useAuth } from '../context/AuthContext';

// Define the parameter list for type safety
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('RootNavigator - isLoading:', isLoading);
  console.log('RootNavigator - isAuthenticated:', isAuthenticated);

  // Show loading indicator while checking authentication status
  if (isLoading) {
    console.log('RootNavigator - Showing loading indicator');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005bea" />
      </View>
    );
  }

  console.log('RootNavigator - Rendering navigator, isAuthenticated:', isAuthenticated);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="App" component={AppNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default RootNavigator; 