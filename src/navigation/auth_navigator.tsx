import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

// Import screens
import LoginScreen from '../screens/auth_screen/LoginScreen';
import SignUpScreen from '../screens/auth_screen/SignUpScreen';

// Import auth context
import { useAuth } from '../context/AuthContext';

// Define the parameter list for type safety
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  const { isLoading } = useAuth();

  // Show loading indicator while checking authentication status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#005bea" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 