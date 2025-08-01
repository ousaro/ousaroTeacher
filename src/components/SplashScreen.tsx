import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 3000,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations
    const startAnimations = () => {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Scale up animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 300,
        useNativeDriver: true,
      }).start();
    };

    startAnimations();

    // Auto finish after duration
    const timer = setTimeout(() => {
      onFinish?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish, duration]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Main content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* App title in English */}
          <Text style={styles.titleEn}>OusaroTeacher</Text>
          
          {/* App title in Japanese */}
          <Text style={styles.titleJp}>オウサロティーチャー</Text>
          
          {/* Loading indicator */}
          <View style={styles.loadingContainer}>
            {[...Array(3)].map((_, index) => (
              <LoadingDot key={index} delay={index * 0.5} />
            ))}
          </View>
        </Animated.View>

        {/* Version info */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </LinearGradient>
    </View>
  );
};

const LoadingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const timer = setTimeout(() => {
      createPulseAnimation().start();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [opacityAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.loadingDot,
        {
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleEn: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  titleJp: {
    fontSize: 24,
    fontWeight: '300',
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginHorizontal: 4,
  },
  version: {
    position: 'absolute',
    bottom: 50,
    fontSize: 12,
    color: '#94A3B8',
    opacity: 0.8,
  },
});

export default SplashScreen;
