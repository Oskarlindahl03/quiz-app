import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import RootNavigator from './navigation/root_navigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App; 