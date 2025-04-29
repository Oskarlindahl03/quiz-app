import React from 'react';
// *** IMPORT THE CORRECT FUNCTION ***
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Import an icon library
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from 'react-native';

// Import your screen components (adjust paths as needed)
import HomeScreen from './HomeScreenNavigator';
// Use placeholders or real screens
import CreatePostScreen from './post_screen_navigator';
import ProfileScreenNavigator from './profile_screen_navigator';
import SearchScreenNavigator from './search_screen_navigator';

// Define ParamList for type safety (optional but good)
export type RootTabParamList = {
  Home: undefined;
  Quiz: undefined;
  Post: undefined;
  Profile: undefined;
  Search: undefined;
};

// *** CREATE THE NAVIGATOR INSTANCE ***
const Tab = createBottomTabNavigator<RootTabParamList>();

const AppNavigator = () => {
  return (
    // *** USE THE Tab.Navigator COMPONENT ***
    <Tab.Navigator
    id = {undefined}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle-outline'; // Default icon

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Post') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          }
          return <Text><Ionicons name={iconName} size={size} color={color} /></Text>;
        },
         // Optional: Customize colors
         tabBarActiveTintColor: 'tomato',
         tabBarInactiveTintColor: 'gray',
         // Optional: Hide header if you only want tabs
         headerShown: false,
      })}
    >
      {/* *** DEFINE SCREENS USING Tab.Screen *** */}
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreenNavigator} />
      <Tab.Screen name="Post" component={CreatePostScreen} />
      <Tab.Screen name="Profile" component={ProfileScreenNavigator} />
    </Tab.Navigator>
  );
};

export default AppNavigator; // Export the component