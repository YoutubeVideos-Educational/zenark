import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { apiService } from '../services/apiService';

const QuestionnaireDebug = () => {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    try {
      const isAuth = await apiService.isAuthenticated();
      setResponse(`Authentication Status: ${isAuth}`);
    } catch (error: any) {
      setResponse(`Auth Error: ${error.message}`);
    }
  };

  const testQuestionnaire = async () => {
    setLoading(true);
    try {
      setResponse('🔄 Testing questionnaire API...');
      
      // First check auth
      const isAuth = await apiService.isAuthenticated();
      if (!isAuth) {
        setResponse('❌ Not authenticated! Please login first.');
        return;
      }
      
      setResponse('✅ Authenticated. Fetching questionnaire...');
      const data = await apiService.getNextQuestionnaire();
      
      let debugInfo = `📥 Raw Response: ${JSON.stringify(data, null, 2)}\n\n`;
      debugInfo += `📊 Type: ${typeof data}\n`;
      debugInfo += `📋 Keys: ${data ? Object.keys(data).join(', ') : 'none'}\n\n`;
      
      if (data) {
        if (data.questions) {
          debugInfo += `✅ Questions found: ${data.questions.length}\n`;
          debugInfo += `📝 Question types: ${data.questions.map(q => q.type).join(', ')}\n`;
        } else {
          debugInfo += `❌ No 'questions' property found\n`;
        }
        
        if (data.id) {
          debugInfo += `🆔 Questionnaire ID: ${data.id}\n`;
        }
        
        if (data.title) {
          debugInfo += `📄 Title: ${data.title}\n`;
        }
      } else {
        debugInfo += `❌ Response is null/undefined\n`;
      }
      
      setResponse(debugInfo);
    } catch (error: any) {
      let errorInfo = `❌ API Error:\n`;
      errorInfo += `Message: ${error.message}\n`;
      errorInfo += `Status: ${error.status}\n`;
      errorInfo += `Full Error: ${JSON.stringify(error, null, 2)}`;
      setResponse(errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const clearResponse = () => {
    setResponse('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Questionnaire API Debug</Text>
      
      <TouchableOpacity style={styles.button} onPress={testAuth}>
        <Text style={styles.buttonText}>Test Authentication</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={testQuestionnaire}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test Questionnaire API'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearButton} onPress={clearResponse}>
        <Text style={styles.clearButtonText}>Clear</Text>
      </TouchableOpacity>

      {response ? (
        <ScrollView style={styles.responseContainer}>
          <Text style={styles.responseText}>{response}</Text>
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#B67BD7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  responseContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    maxHeight: 400,
  },
  responseText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});

export default QuestionnaireDebug;
