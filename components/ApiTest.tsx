import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { apiService } from '../services/apiService';

const ApiTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing connection...');
    
    try {
      // Test if we can reach the API (this will likely fail without auth, but that's expected)
      await apiService.getNextQuestionnaire();
      setResult('✅ API connection successful!');
    } catch (error: any) {
      if (error.status === 401) {
        setResult('✅ API reachable (401 - authentication required as expected)');
      } else {
        setResult(`❌ API Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    const isAuth = await apiService.isAuthenticated();
    Alert.alert('Auth Status', `Authenticated: ${isAuth}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Integration Test</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={testConnection}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test API Connection'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={testAuth}
      >
        <Text style={styles.buttonText}>Check Auth Status</Text>
      </TouchableOpacity>

      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#B67BD7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  resultText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ApiTest;
