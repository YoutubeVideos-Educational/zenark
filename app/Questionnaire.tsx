import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Dimensions, ScaledSize, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../Styles/GlobalColors';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService, Questionnaire, Question, ApiError } from '../services/apiService';

// Responsive dimensions hook
const useResponsiveDimensions = () => {
  const [screenData, setScreenData] = useState<ScaledSize>(Dimensions.get('window'));
  
  useEffect(() => {
    const onChange = (result: { window: ScaledSize }) => {
      setScreenData(result.window);
    };
    
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);
  
  return screenData;
};

const QuestionnaireScreen = () => {
  const { width, height } = useResponsiveDimensions();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [textInputValue, setTextInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Device type detection
  const isSmallDevice = width < 350;
  const isMediumDevice = width >= 350 && width < 768;
  const isTablet = width >= 768;
  const isLandscape = width > height;
  
  // Dynamic styling based on device
  const styles = createResponsiveStyles(width, height, isSmallDevice, isMediumDevice, isTablet, isLandscape);


  useEffect(() => {
    checkAuthAndLoadQuestionnaire();
  }, []);

  const checkAuthAndLoadQuestionnaire = async () => {
    try {
      setCheckingAuth(true);
      const isAuth = await apiService.isAuthenticated();
      
      if (!isAuth) {
        Alert.alert(
          'Authentication Required',
          'Please log in to access questionnaires.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/Login' as any) }]
        );
        return;
      }
      
      await loadQuestionnaire();
    } catch (error) {
      console.error('Auth check failed:', error);
      router.replace('/(auth)/Login' as any);
    } finally {
      setCheckingAuth(false);
    }
  };

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching questionnaire...');
      
      const data = await apiService.getNextQuestionnaire();
      console.log('📥 Raw API Response:', data);
      console.log('📊 API Response Type:', typeof data);
      console.log('📋 API Response Keys:', data ? Object.keys(data) : 'null/undefined');
      
      if (data && data.questions) {
        console.log('✅ Questions found:', data.questions.length);
        console.log('📝 First question:', data.questions[0]);
      } else {
        console.log('❌ No questions in response');
      }
      
      setQuestionnaire(data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Failed to load questionnaire:', error);
      
      let errorMessage = 'Failed to load questionnaire';
      
      if (apiError.status === 401) {
        errorMessage = 'Authentication required. Please log in.';
        Alert.alert(
          'Session Expired',
          'Please log in again to continue.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/Login' as any) }]
        );
      } else if (apiError.status === 404) {
        errorMessage = 'No questionnaire available for this week. Please check back later or contact support if this seems incorrect.';
      } else if (apiError.status === 0) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = apiError.message || `Server error (${apiError.status})`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answerLabel: string) => {
    if (!questionnaire) return;

    const currentQuestion = questionnaire.questions[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQuestion.id]: answerLabel };
    setAnswers(newAnswers);

    try {
      setSubmitting(true);
      
      // For options questions, we need to send the value, not the label
      let answerToSubmit = answerLabel;
      if (currentQuestion.type === 'options' && currentQuestion.optionValues) {
        const selectedOption = currentQuestion.optionValues.find(opt => opt.label === answerLabel);
        if (selectedOption) {
          answerToSubmit = selectedOption.value.toString();
        }
      }
      
      // Submit the answer to the API
      await apiService.submitOrUpdateAnswer(
        currentQuestion.id,
        answerToSubmit,
        questionnaire.id
      );

      // Move to next question or complete questionnaire
      if (currentQuestionIndex < questionnaire.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTextInputValue('');
      } else {
        // Questionnaire completed - show completion page instead of alert
        setIsCompleted(true);
      }
    } catch (error) {
      const apiError = error as ApiError;
      Alert.alert(
        'Error',
        apiError.message || 'Failed to submit answer. Please try again.',
        [{ text: 'OK' }]
      );
      
      // If unauthorized, redirect to login
      if (apiError.status === 401) {
        router.replace('/(auth)/Login' as any);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = () => {
    if (!questionnaire || !questionnaire.questions || questionnaire.questions.length === 0) return null;
    if (currentQuestionIndex >= questionnaire.questions.length) return null;

    const currentQuestion = questionnaire.questions[currentQuestionIndex];

    switch (currentQuestion.type) {
      case 'options':
        return (
          <View style={styles.optionsContainer}>
            {currentQuestion.options && currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionButton}
                onPress={() => handleAnswer(option)}
                disabled={submitting}
              >
                <Text style={styles.optionButtonText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'scale':
        // For scale questions, create numbered options (1-10)
        const scaleOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
        return (
          <View style={styles.scaleContainer}>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel}>1 (Low)</Text>
              <Text style={styles.scaleLabel}>10 (High)</Text>
            </View>
            <View style={styles.scaleOptions}>
              {scaleOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.scaleButton}
                  onPress={() => handleAnswer(option)}
                  disabled={submitting}
                >
                  <Text style={styles.scaleButtonText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 'text':
      default:
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder={currentQuestion.placeholder || 'Enter your answer...'}
              placeholderTextColor={'#6b7280'}
              value={textInputValue}
              onChangeText={setTextInputValue}
              onSubmitEditing={(e) => handleAnswer(e.nativeEvent.text)}
              editable={!submitting}
            />
            <TouchableOpacity 
              style={[styles.button, submitting && styles.buttonDisabled]} 
              onPress={() => handleAnswer(textInputValue)}
              disabled={submitting || !textInputValue.trim()}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Next</Text>
              )}
            </TouchableOpacity>
          </>
        );
    }
  };

  if (loading || checkingAuth) {
    return (
      <LinearGradient colors={['#E0D2FF', '#FFF8E1']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryColor} />
            <Text style={styles.loadingText}>Loading this week's questionnaire...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error && !questionnaire) {
    const is404Error = error.includes('No questionnaire available for this week');
    
    return (
      <LinearGradient colors={['#E0D2FF', '#FFF8E1']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            {is404Error ? (
              <>
                <Text style={styles.noQuestionnaireTitle}>📅 No Questionnaire This Week</Text>
                <Text style={styles.noQuestionnaireText}>
                  There's no questionnaire assigned for this week yet. This could mean:
                </Text>
                <View style={styles.reasonsList}>
                  <Text style={styles.reasonItem}>• You've completed this week's questionnaire</Text>
                  <Text style={styles.reasonItem}>• The questionnaire hasn't been assigned yet</Text>
                  <Text style={styles.reasonItem}>• There might be a scheduling issue</Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.retryButton} onPress={checkAuthAndLoadQuestionnaire}>
                    <Text style={styles.retryButtonText}>Check Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.secondaryButton} 
                    onPress={() => router.replace('/' as any)}
                  >
                    <Text style={styles.secondaryButtonText}>Back to Home</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={checkAuthAndLoadQuestionnaire}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!questionnaire) {
    return (
      <LinearGradient colors={['#E0D2FF', '#FFF8E1']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.completedContainer}>
            <Text style={styles.completedTitle}>All Done! 🎉</Text>
            <Text style={styles.completedText}>
              You've completed all available questionnaires. Thank you for your participation!
            </Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => router.replace('/' as any)}
            >
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Safety checks to prevent crashes
  if (!questionnaire || !questionnaire.questions || questionnaire.questions.length === 0) {
    return (
      <LinearGradient colors={['#E0D2FF', '#FFF8E1']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No questionnaire data available</Text>
            <TouchableOpacity style={styles.retryButton} onPress={checkAuthAndLoadQuestionnaire}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Show completion page instead of alert
  if (isCompleted) {
    const handleRetake = () => {
      setIsCompleted(false);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTextInputValue('');
    };

    const handleBackHome = () => {
      router.replace('/' as any);
    };

    return (
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        enabled={true}
      >
        <LinearGradient colors={['#E0D2FF', '#FFF8E1']} style={styles.container}>
          <SafeAreaView style={styles.safeArea}>
            <ScrollView 
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={true}
              decelerationRate="fast"
              scrollEventThrottle={16}
            >
              <View style={styles.completionCard}>
                <Text style={styles.completionEmoji}>🎉</Text>
                <Text style={styles.completionTitle}>Questionnaire Complete!</Text>
                <Text style={styles.completionMessage}>
                  Thank you for completing the questionnaire. Your responses have been saved and will help us provide better support for your mental wellness journey.
                </Text>
                <Text style={styles.completionSubMessage}>
                  You can retake this questionnaire anytime or return to the home screen.
                </Text>
                
                <View style={styles.completionButtons}>
                  <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                    <Text style={styles.retakeButtonText}>Retake Questionnaire</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.homeButton} onPress={handleBackHome}>
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  const currentQuestion = questionnaire.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionnaire.questions.length) * 100;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      enabled={true}
    >
      <LinearGradient colors={['#E0D2FF', '#FFF8E1']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={true}
            decelerationRate="fast"
            scrollEventThrottle={16}
          >
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {currentQuestionIndex + 1} of {questionnaire.questions.length}
              </Text>
            </View>
            
            <View style={styles.card}>
              {/* Questionnaire title removed as requested */}
              {questionnaire.description && (
                <Text style={styles.questionnaireDescription}>{questionnaire.description}</Text>
              )}
              
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
              {currentQuestion.subtext && (
                <Text style={styles.subtext}>{currentQuestion.subtext}</Text>
              )}
              
              {renderQuestion()}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

// Create responsive styles function
const createResponsiveStyles = (
  width: number, 
  height: number, 
  isSmallDevice: boolean, 
  isMediumDevice: boolean, 
  isTablet: boolean, 
  isLandscape: boolean
) => {
  const scaleFactor = Math.min(width / 375, height / 812);
  const fontScale = Math.min(scaleFactor, 1.3);
  
  // Dynamic dimensions
  const horizontalPadding = isSmallDevice ? 16 : isMediumDevice ? 20 : isTablet ? 40 : 20;
  const cardPadding = isSmallDevice ? 20 : isMediumDevice ? 25 : isTablet ? 35 : 30;
  const cardMaxWidth = isTablet ? Math.min(width * 0.8, 600) : width - (horizontalPadding * 2);
  
  return StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: horizontalPadding,
    paddingTop: isLandscape ? 10 : 20,
  },
  progressContainer: {
    marginBottom: isSmallDevice ? 15 : 20,
    paddingTop: isSmallDevice ? 15 : 20,
    alignItems: 'center',
  },
  progressBar: {
    height: isSmallDevice ? 3 : 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: 8,
    width: '100%',
    maxWidth: cardMaxWidth,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primaryColor,
    borderRadius: 2,
  },
  progressText: {
    textAlign: 'center',
    color: Colors.blackColor,
    fontSize: (isSmallDevice ? 12 : 14) * fontScale,
    fontWeight: '500',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: isSmallDevice ? 16 : isTablet ? 24 : 20,
    padding: cardPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
    maxWidth: cardMaxWidth,
    alignSelf: 'center',
  },
  questionnaireTitle: {
    fontSize: (isSmallDevice ? 20 : isTablet ? 28 : 24) * fontScale,
    fontWeight: 'bold',
    color: Colors.blackColor,
    textAlign: 'center',
    marginBottom: isSmallDevice ? 6 : 8,
    lineHeight: (isSmallDevice ? 24 : isTablet ? 34 : 28) * fontScale,
  },
  questionnaireDescription: {
    fontSize: (isSmallDevice ? 14 : isTablet ? 18 : 16) * fontScale,
    color: Colors.blackColor + '80',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 16 : 20,
    lineHeight: (isSmallDevice ? 18 : isTablet ? 24 : 20) * fontScale,
    paddingHorizontal: isSmallDevice ? 0 : 10,
  },
  questionText: {
    fontSize: (isSmallDevice ? 20 : isTablet ? 28 : 24) * fontScale,
    fontWeight: '700',
    color: '#374151',
    marginBottom: isSmallDevice ? 10 : 12,
    textAlign: 'center',
    lineHeight: (isSmallDevice ? 26 : isTablet ? 36 : 32) * fontScale,
    paddingHorizontal: isSmallDevice ? 0 : 5,
  },
  subtext: {
    fontSize: (isSmallDevice ? 14 : isTablet ? 17 : 15) * fontScale,
    color: '#4b5563',
    marginBottom: isSmallDevice ? 24 : isTablet ? 35 : 30,
    textAlign: 'center',
    lineHeight: (isSmallDevice ? 20 : isTablet ? 24 : 22) * fontScale,
    paddingHorizontal: isSmallDevice ? 0 : 5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primaryColor + '40',
    borderRadius: isSmallDevice ? 10 : 12,
    padding: isSmallDevice ? 12 : isTablet ? 18 : 15,
    fontSize: (isSmallDevice ? 14 : isTablet ? 18 : 16) * fontScale,
    marginBottom: isSmallDevice ? 16 : 20,
    backgroundColor: '#fff',
    minHeight: isSmallDevice ? 44 : isTablet ? 52 : 48,
    textAlignVertical: 'center',
  },
  button: {
    backgroundColor: Colors.primaryColor,
    borderRadius: isSmallDevice ? 10 : 12,
    padding: isSmallDevice ? 12 : isTablet ? 18 : 15,
    alignItems: 'center',
    minHeight: isSmallDevice ? 44 : isTablet ? 52 : 48,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: (isSmallDevice ? 14 : isTablet ? 18 : 16) * fontScale,
    fontWeight: '600',
  },
  optionsContainer: {
    gap: isSmallDevice ? 10 : 12,
    flexDirection: 'column',
  },
  optionButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.primaryColor + '40',
    borderRadius: isSmallDevice ? 10 : 12,
    padding: isSmallDevice ? 12 : isTablet ? 18 : 15,
    alignItems: 'center',
    minHeight: isSmallDevice ? 44 : isTablet ? 52 : 48,
    justifyContent: 'center',
    width: '100%',
  },
  optionButtonText: {
    color: Colors.blackColor,
    fontSize: (isSmallDevice ? 14 : isTablet ? 18 : 16) * fontScale,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: (isSmallDevice ? 18 : isTablet ? 22 : 20) * fontScale,
  },
  scaleContainer: {
    alignItems: 'center',
    width: '100%',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: isSmallDevice ? 12 : 15,
    paddingHorizontal: isSmallDevice ? 5 : 10,
  },
  scaleLabel: {
    fontSize: (isSmallDevice ? 12 : 14) * fontScale,
    color: Colors.blackColor + '80',
    fontWeight: '500',
  },
  scaleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: isSmallDevice ? 6 : 8,
    paddingHorizontal: isSmallDevice ? 5 : 0,
  },
  scaleButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.primaryColor + '40',
    borderRadius: isSmallDevice ? 6 : 8,
    width: isSmallDevice ? 36 : isTablet ? 44 : 40,
    height: isSmallDevice ? 36 : isTablet ? 44 : 40,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: isSmallDevice ? 36 : 40,
  },
  scaleButtonText: {
    color: Colors.blackColor,
    fontSize: (isSmallDevice ? 14 : isTablet ? 18 : 16) * fontScale,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: isSmallDevice ? 12 : 15,
    fontSize: (isSmallDevice ? 14 : isTablet ? 18 : 16) * fontScale,
    color: Colors.blackColor,
    textAlign: 'center',
    paddingHorizontal: horizontalPadding,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalPadding,
  },
  errorText: {
    fontSize: (isSmallDevice ? 14 : isTablet ? 18 : 16) * fontScale,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 16 : 20,
    lineHeight: (isSmallDevice ? 18 : isTablet ? 24 : 20) * fontScale,
    paddingHorizontal: isSmallDevice ? 10 : 0,
  },
  retryButton: {
    backgroundColor: Colors.primaryColor,
    borderRadius: isSmallDevice ? 10 : 12,
    padding: isSmallDevice ? 12 : isTablet ? 18 : 15,
    paddingHorizontal: isSmallDevice ? 24 : isTablet ? 36 : 30,
    minHeight: isSmallDevice ? 44 : isTablet ? 52 : 48,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: (isSmallDevice ? 14 : isTablet ? 18 : 16) * fontScale,
    fontWeight: '600',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalPadding,
  },
  completedTitle: {
    fontSize: (isSmallDevice ? 24 : isTablet ? 32 : 28) * fontScale,
    fontWeight: 'bold',
    color: Colors.blackColor,
    textAlign: 'center',
    marginBottom: isSmallDevice ? 12 : 15,
    lineHeight: (isSmallDevice ? 28 : isTablet ? 38 : 32) * fontScale,
  },
  completedText: {
    fontSize: (isSmallDevice ? 14 : isTablet ? 18 : 16) * fontScale,
    color: Colors.blackColor + '80',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 24 : isTablet ? 36 : 30,
    lineHeight: (isSmallDevice ? 18 : isTablet ? 24 : 20) * fontScale,
    paddingHorizontal: isSmallDevice ? 10 : 0,
  },
  noQuestionnaireTitle: {
    fontSize: (isSmallDevice ? 20 : isTablet ? 26 : 22) * fontScale,
    fontWeight: 'bold',
    color: Colors.blackColor,
    textAlign: 'center',
    marginBottom: isSmallDevice ? 16 : 20,
    lineHeight: (isSmallDevice ? 24 : isTablet ? 30 : 26) * fontScale,
  },
  noQuestionnaireText: {
    fontSize: (isSmallDevice ? 14 : isTablet ? 18 : 16) * fontScale,
    color: Colors.blackColor + '80',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 16 : 20,
    lineHeight: (isSmallDevice ? 18 : isTablet ? 24 : 20) * fontScale,
    paddingHorizontal: isSmallDevice ? 10 : 0,
  },
  reasonsList: {
    marginBottom: isSmallDevice ? 20 : 24,
    paddingHorizontal: isSmallDevice ? 20 : 30,
  },
  reasonItem: {
    fontSize: (isSmallDevice ? 13 : isTablet ? 16 : 14) * fontScale,
    color: Colors.blackColor + '70',
    marginBottom: isSmallDevice ? 6 : 8,
    lineHeight: (isSmallDevice ? 16 : isTablet ? 20 : 18) * fontScale,
    textAlign: 'left',
  },
  actionButtons: {
    gap: isSmallDevice ? 12 : 16,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primaryColor,
    borderRadius: isSmallDevice ? 10 : 12,
    padding: isSmallDevice ? 12 : isTablet ? 18 : 15,
    paddingHorizontal: isSmallDevice ? 24 : isTablet ? 36 : 30,
    minHeight: isSmallDevice ? 44 : isTablet ? 52 : 48,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 200,
  },
  secondaryButtonText: {
    color: Colors.primaryColor,
    fontSize: (isSmallDevice ? 14 : isTablet ? 18 : 16) * fontScale,
    fontWeight: '600',
    textAlign: 'center',
  },
  completionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: isSmallDevice ? 16 : isTablet ? 24 : 20,
    padding: cardPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
    maxWidth: cardMaxWidth,
    alignSelf: 'center',
    alignItems: 'center',
  },
  completionEmoji: {
    fontSize: (isSmallDevice ? 48 : isTablet ? 64 : 56) * fontScale,
    marginBottom: isSmallDevice ? 16 : 20,
    textAlign: 'center',
  },
  completionTitle: {
    fontSize: (isSmallDevice ? 24 : isTablet ? 32 : 28) * fontScale,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 12 : 16,
    lineHeight: (isSmallDevice ? 28 : isTablet ? 38 : 32) * fontScale,
  },
  completionMessage: {
    fontSize: (isSmallDevice ? 15 : isTablet ? 18 : 16) * fontScale,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 12 : 16,
    lineHeight: (isSmallDevice ? 20 : isTablet ? 24 : 22) * fontScale,
    paddingHorizontal: isSmallDevice ? 0 : 10,
  },
  completionSubMessage: {
    fontSize: (isSmallDevice ? 14 : isTablet ? 16 : 15) * fontScale,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 24 : isTablet ? 32 : 28,
    lineHeight: (isSmallDevice ? 18 : isTablet ? 22 : 20) * fontScale,
    paddingHorizontal: isSmallDevice ? 0 : 5,
  },
  completionButtons: {
    width: '100%',
    gap: isSmallDevice ? 12 : 16,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: Colors.primaryColor,
    borderRadius: isSmallDevice ? 10 : 12,
    padding: isSmallDevice ? 12 : isTablet ? 18 : 15,
    alignItems: 'center',
    minHeight: isSmallDevice ? 44 : isTablet ? 52 : 48,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 280,
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: (isSmallDevice ? 14 : isTablet ? 18 : 16) * fontScale,
    fontWeight: '600',
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primaryColor,
    borderRadius: isSmallDevice ? 10 : 12,
    padding: isSmallDevice ? 12 : isTablet ? 18 : 15,
    alignItems: 'center',
    minHeight: isSmallDevice ? 44 : isTablet ? 52 : 48,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 280,
  },
  homeButtonText: {
    color: Colors.primaryColor,
    fontSize: (isSmallDevice ? 14 : isTablet ? 18 : 16) * fontScale,
    fontWeight: '600',
    textAlign: 'center',
  },
  });
};

export default QuestionnaireScreen;
