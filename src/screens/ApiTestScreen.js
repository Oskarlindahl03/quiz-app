import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Button, 
  ScrollView, 
  ActivityIndicator,
  SafeAreaView,
  Platform
} from 'react-native';
import apiClient from '../services/api';

export default function ApiTestScreen() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const testApiConnection = async (endpoint) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log(`Testing API connection to: ${endpoint}`);
      const result = await apiClient.get(endpoint);
      console.log('API Response:', result.data);
      setResponse(result.data);
    } catch (err) {
      console.error('API Error:', err.message);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>API Connection Test</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Test Debug Endpoint" 
          onPress={() => testApiConnection('/debug')}
          disabled={loading}
        />
        
        <Button 
          title="Test Root Endpoint" 
          onPress={() => testApiConnection('/')}
          disabled={loading}
        />
        
        <Button 
          title="Test Quizzes Endpoint" 
          onPress={() => testApiConnection('/quizzes')}
          disabled={loading}
        />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Testing connection...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          
          <View style={styles.helpBox}>
            <Text style={styles.helpTitle}>Troubleshooting Tips:</Text>
            <Text>• Make sure the server is running on port 3001</Text>
            <Text>• Check that your device and server are on the same network</Text>
            <Text>• On Android emulator, use 10.0.2.2 instead of localhost</Text>
            <Text>• On iOS simulator, use localhost</Text>
            <Text>• On physical device, use your computer's IP address</Text>
          </View>
        </View>
      )}

      {response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>Response:</Text>
          <ScrollView style={styles.responseScroll}>
            <Text style={styles.responseText}>
              {JSON.stringify(response, null, 2)}
            </Text>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  errorContainer: {
    backgroundColor: '#ffeeee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#cc0000',
    marginBottom: 10,
  },
  errorText: {
    color: '#cc0000',
    marginBottom: 15,
  },
  helpBox: {
    backgroundColor: '#ffffee',
    padding: 10,
    borderRadius: 5,
  },
  helpTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  responseContainer: {
    flex: 1,
    backgroundColor: '#eeffee',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccffcc',
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  responseScroll: {
    flex: 1,
  },
  responseText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
}); 