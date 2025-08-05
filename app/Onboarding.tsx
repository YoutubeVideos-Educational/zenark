import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Animated, ViewToken, Image, ScaledSize } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../Styles/GlobalColors';

// Dynamic responsive hook
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

// Create responsive styles function
const createResponsiveStyles = (width: number, height: number) => {
  const isSmallDevice = width < 350;
  const isMediumDevice = width >= 350 && width < 768;
  const isLargeDevice = width >= 768;
  const isTablet = width >= 768 && height >= 1024;
  
  const scaleFactor = Math.min(width / 375, height / 812);
  const fontScale = Math.min(scaleFactor, 1.2);
  
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    slide: {
      width,
      height,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: width * (isSmallDevice ? 0.04 : isMediumDevice ? 0.05 : 0.06),
      paddingTop: height * (isSmallDevice ? 0.12 : isMediumDevice ? 0.15 : 0.18),
      paddingBottom: height * (isSmallDevice ? 0.12 : isMediumDevice ? 0.15 : 0.18),
    },
    ctaSlide: {
      justifyContent: 'center',
      paddingTop: height * (isSmallDevice ? 0.08 : isMediumDevice ? 0.12 : 0.15),
    },
    imageContainer: {
      width: Math.min(width * (isSmallDevice ? 0.6 : isMediumDevice ? 0.7 : 0.5), isTablet ? 400 : 320),
      height: Math.min(width * (isSmallDevice ? 0.6 : isMediumDevice ? 0.7 : 0.5), isTablet ? 400 : 320),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: height * (isSmallDevice ? 0.03 : isMediumDevice ? 0.04 : 0.05),
    },
    image: {
      width: '100%',
      height: '100%',
    },
    ctaImage: {
      width: '100%',
      height: '100%',
    },
    title: {
      fontSize: isSmallDevice ? 18 * fontScale : isMediumDevice ? 24 * fontScale : isTablet ? 32 * fontScale : 28 * fontScale,
      fontWeight: '700',
      color: '#1F2937',
      textAlign: 'center',
      marginBottom: height * (isSmallDevice ? 0.015 : isMediumDevice ? 0.02 : 0.025),
      paddingHorizontal: width * (isSmallDevice ? 0.04 : isMediumDevice ? 0.05 : 0.06),
      lineHeight: isSmallDevice ? 22 * fontScale : isMediumDevice ? 28 * fontScale : isTablet ? 38 * fontScale : 34 * fontScale,
    },
    description: {
      fontSize: isSmallDevice ? 12 * fontScale : isMediumDevice ? 14 * fontScale : isTablet ? 18 * fontScale : 16 * fontScale,
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: isSmallDevice ? 16 * fontScale : isMediumDevice ? 20 * fontScale : isTablet ? 24 * fontScale : 22 * fontScale,
      paddingHorizontal: width * (isSmallDevice ? 0.06 : isMediumDevice ? 0.08 : 0.1),
      marginBottom: height * (isSmallDevice ? 0.02 : isMediumDevice ? 0.03 : 0.04),
    },
    pagination: {
      position: 'absolute',
      bottom: height * (isSmallDevice ? 0.04 : isMediumDevice ? 0.06 : 0.08),
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dot: {
      height: isSmallDevice ? 6 * scaleFactor : isMediumDevice ? 8 * scaleFactor : 10 * scaleFactor,
      borderRadius: isSmallDevice ? 3 * scaleFactor : isMediumDevice ? 4 * scaleFactor : 5 * scaleFactor,
      backgroundColor: '#A78BFA',
      marginHorizontal: width * (isSmallDevice ? 0.008 : isMediumDevice ? 0.01 : 0.012),
    },
    button: {
      width: width * (isSmallDevice ? 0.85 : isMediumDevice ? 0.8 : isTablet ? 0.6 : 0.75),
      maxWidth: isTablet ? 500 : 400,
      height: Math.max(height * (isSmallDevice ? 0.06 : isMediumDevice ? 0.07 : 0.08), 48),
      backgroundColor: '#8B5CF6',
      borderRadius: Math.min(width * 0.04, isTablet ? 20 : 16),
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: height * (isSmallDevice ? 0.01 : isMediumDevice ? 0.015 : 0.02),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: isSmallDevice ? 16 * fontScale : isMediumDevice ? 18 * fontScale : isTablet ? 22 * fontScale : 20 * fontScale,
      fontWeight: '700',
    },
    loginButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#8B5CF6',
      shadowOpacity: 0,
      elevation: 0,
    },
    loginButtonText: {
      color: '#8B5CF6',
    },
  });
};

interface Slide {
  key: string;
  title: string;
  description: string;
  image?: any;
}

const slides: Slide[] = [
  {
    key: '1',
    title: 'Track Your Mind Weekly',
    description: 'Take quick, interactive sessions — no booking needed. Just answer honestly, and we\'ll take care of the rest.',
    image: require('../assets/images/image1.png'),
  },
  {
    key: '2',
    title: 'Powered by Deep Learning',
    description: 'Our AI analyzes your answers to understand mood, stress, and emotional patterns — all tailored to you.',
    image: require('../assets/images/image2.png'),
  },
  {
    key: '3',
    title: 'Powered by Deep Learning',
    description: 'Our AI analyzes your answers to understand mood, stress, and emotional patterns — all tailored to you.',
    image: require('../assets/images/image3.png'),
  },
  {
    key: '4',
    title: 'Ready to Begin?',
    description: 'Create an account to save your progress or log in to continue your journey.',
  },
];

const OnboardingScreen = () => {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = useResponsiveDimensions();
  
  // Create dynamic styles based on current dimensions
  const dynamicStyles = createResponsiveStyles(width, height);
  
  // Responsive calculations for animations
  const isSmallDevice = width < 350;
  const isMediumDevice = width >= 350 && width < 768;
  const scaleFactor = Math.min(width / 375, height / 812);

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderItem = ({ item, index }: { item: Slide; index: number }) => {
    if (index === slides.length - 1) {
      return (
        <View style={[dynamicStyles.slide, dynamicStyles.ctaSlide]}>
          <View style={dynamicStyles.imageContainer}>
            <Image source={require('../assets/images/image1.png')} style={dynamicStyles.ctaImage} resizeMode="contain" />
          </View>
          <Text style={dynamicStyles.title}>{item.title}</Text>
          <Text style={dynamicStyles.description}>{item.description}</Text>
          <TouchableOpacity style={dynamicStyles.button} onPress={() => router.push('/(auth)/Signup')}>
            <Text style={dynamicStyles.buttonText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[dynamicStyles.button, dynamicStyles.loginButton]} onPress={() => router.push('/(auth)/Login')}>
            <Text style={[dynamicStyles.buttonText, dynamicStyles.loginButtonText]}>Login</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={dynamicStyles.slide}>
        <View style={dynamicStyles.imageContainer}>
          <Image source={item.image} style={dynamicStyles.image} resizeMode="contain" />
        </View>
        <Text style={dynamicStyles.title}>{item.title}</Text>
        <Text style={dynamicStyles.description}>{item.description}</Text>
      </View>
    );
  };



  return (
    <LinearGradient colors={['#E0D2FF', '#FFF8E1']} style={dynamicStyles.container}>
      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.key}
      />
      <View style={dynamicStyles.pagination}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [
              isSmallDevice ? 6 * scaleFactor : isMediumDevice ? 8 * scaleFactor : 10 * scaleFactor,
              isSmallDevice ? 12 * scaleFactor : isMediumDevice ? 16 * scaleFactor : 20 * scaleFactor,
              isSmallDevice ? 6 * scaleFactor : isMediumDevice ? 8 * scaleFactor : 10 * scaleFactor
            ],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return <Animated.View key={i.toString()} style={[dynamicStyles.dot, { width: dotWidth, opacity }]} />;
        })}
      </View>
    </LinearGradient>
  );
};

export default OnboardingScreen;

