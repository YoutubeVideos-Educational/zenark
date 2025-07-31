import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../Styles/GlobalColors';
import Slider from '@react-native-community/slider';
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
    subtext: 'Use the slider to tell us how many hours of sleep you get on average.',
    type: 'slider',
    min: 4,
    max: 12,
    initialValue: 8,
  },
];

const WelcomeScreen = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [userName, setUserName] = useState('');
  const [textInputValue, setTextInputValue] = useState('');

  const questions = getQuestions(userName);
  const currentQuestion = questions[currentQuestionIndex];

  const [sliderValue, setSliderValue] = useState(questions[4].initialValue || 8);

  

  useEffect(() => {
    if (currentQuestion.type === 'slider') {
      setSliderValue(currentQuestion.initialValue || 8);
    }
  }, [currentQuestionIndex, questions]);

  const handleNextQuestion = (answer: string) => {
    if (currentQuestionIndex === 0) {
      setUserName(answer.trim());
    }
    setAnswers([...answers, answer]);
    setTextInputValue('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      router.replace('/');
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'slider':
        return (
          <View style={styles.sliderContainer}>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={currentQuestion.min}
              maximumValue={currentQuestion.max}
              step={1}
              value={sliderValue}
              onValueChange={(newValue) => setSliderValue(newValue)}
              minimumTrackTintColor={Colors.primaryDotColor}
              maximumTrackTintColor="#ddd"
              thumbTintColor={Colors.primaryDotColor}
            />
            <Text style={styles.sliderValueText}>{sliderValue} hours</Text>
            <TouchableOpacity style={styles.button} onPress={() => handleNextQuestion(`${sliderValue} hours`)}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
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
    <LinearGradient
      colors={['#E0D2FF', '#FFF8E1']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.card}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          {currentQuestion.subtext ? <Text style={styles.subtext}>{currentQuestion.subtext}</Text> : null}
          {renderQuestion()}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  sliderValueText: {
    color: '#374151',
    fontSize: 18,
    marginTop: 10,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
