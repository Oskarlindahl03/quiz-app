import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile_screen/ProfileScreen';

// Define the parameter list for type safety
export type ProfileStackParamList = {
  ProfileMain: undefined;
  // Add additional screens here as needed
  // ProfileSettings: undefined;
  // ProfileEdit: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileScreenNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide the header since we have a custom one in ProfileScreen
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      {/* Add additional screens here as needed */}
    </Stack.Navigator>
  );
};

export default ProfileScreenNavigator; 