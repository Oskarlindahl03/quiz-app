import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from '../screens/search_screen/SearchScreen';

// Define the parameter list for type safety
export type SearchStackParamList = {
  SearchMain: undefined;
  // Add additional screens here as needed
  // SearchResults: { query: string };
  // SearchFilters: undefined;
};

const Stack = createNativeStackNavigator<SearchStackParamList>();

const SearchScreenNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide the header since we have a custom one in SearchScreen
      }}
    >
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      {/* Add additional screens here as needed */}
    </Stack.Navigator>
  );
};

export default SearchScreenNavigator; 