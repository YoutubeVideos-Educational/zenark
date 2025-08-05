import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../Styles/GlobalColors';
import { apiService } from '../services/apiService';
import { LinearGradient } from 'expo-linear-gradient';

const getQuestions = (name: string) => [
  {
    question: 'Before we vibe — what should we call you? 👋',
    subtext: 'Could be your name, your nickname, or your secret alter ego from the multiverse. Whatever feels comfy — this is your space.',
    placeholder: 'Enter your name...',
    type: 'text',
  },
  {
    question: name ? `What about you, ${name}? If your brain was a playlist today, what would it be called? 🎶` : 'If your brain was a playlist today, what would it be called? 🎶',
    subtext: 'Think album titles like: “Lo-Fi Overthinking”',
    placeholder: 'Playlist name...',
    type: 'text',
  },
  {
    question: 'Which emoji has been carrying your mental state lately? 🤔',
    subtext: '(Or just type yours. No wrong answer, promise.)',
    placeholder: 'Enter your emoji...',
    type: 'text',
  },
  {
    question: 'What’s one thing that kept you semi-sane this week? ✨',
    subtext: 'A meme that wrecked you (in a good way)? A song? A snack? Someone who actually texted back?',
    placeholder: 'Tell us what it was...',
    type: 'text',
  },
  {
    question: name ? `Be honest, ${name}, how’s your sleep game lately? 😴` : 'Be honest, how’s your sleep game lately? 😴',
    subtext: 'Select the option that best describes your sleep.',
    type: 'options',
    options: ['Less than 4 hours', '4-6 hours', '7-9 hours', '10+ hours'],
  },
];

const WelcomeScreen = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [userName, setUserName] = useState('');
  const [textInputValue, setTextInputValue] = useState('');

  const questions = getQuestions(userName);
  const currentQuestion = questions[currentQuestionIndex];

  const handleWelcomeComplete = async () => {
    try {
      const isAuth = await apiService.isAuthenticated();
      
      if (isAuth) {
        router.replace('/Questionnaire' as any);
      } else {
        Alert.alert(
          'Authentication Required',
          'Please log in to access questionnaires.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.replace('/(auth)/Login' as any) }
          ]
        );
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      Alert.alert(
        'Error',
        'Unable to verify authentication. Please try logging in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/Login' as any) }]
      );
    }
  };

  const handleNextQuestion = (answer: string) => {
    if (currentQuestionIndex === 0) {
      setUserName(answer.trim());
    }
    setAnswers([...answers, answer]);
    setTextInputValue('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // After completing welcome questions, check auth and navigate to questionnaire
      handleWelcomeComplete();
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'options':
        return (
          <View style={styles.optionsContainer}>
            {currentQuestion.options && currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionButton}
                onPress={() => handleNextQuestion(option)}
              >
                <Text style={styles.optionButtonText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'text':
      default:
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder={currentQuestion.placeholder}
              placeholderTextColor={'#6b7280'}
              value={textInputValue}
              onChangeText={setTextInputValue}
              onSubmitEditing={(e) => handleNextQuestion(e.nativeEvent.text)}
            />
            <TouchableOpacity style={styles.button} onPress={() => handleNextQuestion(textInputValue)}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      enabled={true}
    >
      <LinearGradient
        colors={['#E0D2FF', '#FFF8E1']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={true}
            decelerationRate="fast"
            scrollEventThrottle={16}
          >
            <View style={styles.card}>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
              {currentQuestion.subtext ? <Text style={styles.subtext}>{currentQuestion.subtext}</Text> : null}
              {renderQuestion()}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Colors.whiteColor,
    borderRadius: 20,
    padding: 32,
    shadowColor: Colors.blackColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  subtext: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#D1D5DB',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.primaryDotColor,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDotColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonText: {
    color: Colors.whiteColor,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 12,
  },
  optionButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
