import { Colors } from '@/Styles/GlobalColors';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MentalHealthIllustration from './MentalHealthIllustration';
import { useRouter } from 'expo-router';

const Signup = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Animation refs
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  // Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Password regex: min 8 chars, upper, lower, number, special
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  useEffect(() => {
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (error || success) {
      feedbackAnim.setValue(0);
      Animated.timing(feedbackAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [error, success]);

  const handleSignup = () => {
    setError('');
    setSuccess('');
    setLoading(true);
    setTimeout(() => { // simulate network
      // Name validation
      if (!name || name.trim().length < 2) {
        setError('Please enter your full name (at least 2 characters).');
        setLoading(false);
        return;
      }
      // Email validation
      if (!email || !emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      // Password validation
      if (!passwordRegex.test(password)) {
        setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
        setLoading(false);
        return;
      }
      // Confirm password
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      // All good
      setSuccess('Signup successful! Welcome to Zenark.');
      setError('');
      setLoading(false);
    }, 900);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { opacity: cardOpacity }]}>  
        <MentalHealthIllustration style={styles.illustration} />
        <Text style={styles.heading}>Welcome to Zenark</Text>
        <Text style={styles.subheading}>Your safe space for mental wellness begins here. Sign up to start your journey.</Text>
        <Text style={styles.title}>Create your account</Text>
        <Animated.View style={{ opacity: feedbackAnim }}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}
        </Animated.View>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={Colors.blackColor + '99'}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.blackColor + '99'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.blackColor + '99'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.passwordHint}>Password must be at least 8 characters, with upper, lower, number, and special character.</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={Colors.blackColor + '99'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignup} activeOpacity={0.85} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.whiteColor} /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>
        <Text style={styles.footerText}>Already have an account? <Text style={styles.link} onPress={() => router.replace('/(auth)/Login')}>Login</Text></Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  illustration: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primaryDotColor,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  subheading: {
    fontSize: 15,
    color: Colors.blackColor,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryDotColor,
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
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 28,
    color: Colors.blackColor,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: Colors.primaryDotColor,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: Colors.whiteColor,
    color: Colors.blackColor,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.whiteColor,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  success: {
    color: '#2ecc71',
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  error: {
    color: '#e74c3c',
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  passwordHint: {
    color: Colors.primaryDotColor,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'left',
    alignSelf: 'flex-start',
    opacity: 0.7,
    marginLeft: 2,
  },
  footerText: {
    marginTop: 8,
    color: Colors.blackColor,
    fontSize: 14,
    textAlign: 'center',
  },
  link: {
    color: Colors.primaryDotColor,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default Signup;
