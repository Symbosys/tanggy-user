import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/type';
import { COLORS } from "../../theme/theme";

const { width, height } = Dimensions.get('window');

const Splash = ({
  navigation,
}: {
  navigation: NavigationProp<RootStackParamList>;
}) => {
  const letters = ['M', 'i', 'n', 't', 'a'];

  const letterAnims = letters.map(() => useRef(new Animated.Value(0)).current);
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const letterAnimations = letters.map((_, index) => {
      return Animated.timing(letterAnims[index], {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        easing: Easing.out(Easing.bounce),
        useNativeDriver: true,
      });
    });

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.6,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.2,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const scaleAnimation = Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.elastic(1)),
      useNativeDriver: true,
    });

    Animated.sequence([
      Animated.parallel([
        scaleAnimation,
        Animated.stagger(100, letterAnimations),
      ]),
      glowAnimation,
    ]).start();

    const timeout = setTimeout(() => {
      navigation.navigate('BottomTab');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowOverlay, { opacity: glowOpacity }]} />

      {/* Animated Cursive Logo Text */}
      <Animated.View
        style={[
          styles.textRow,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        {letters.map((char, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.letter,
              {
                opacity: letterAnims[index],
                transform: [
                  {
                    translateY: letterAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                  {
                    rotate: letterAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['10deg', '0deg'],
                    }),
                  },
                ],
              },
            ]}>
            {char}
          </Animated.Text>
        ))}
      </Animated.View>

      <Text style={styles.tagline}>Fresh Chicken, Delivered Fast!</Text>

      <View style={styles.decorativeCircle} />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary, // #f9eae9 (soft pink)
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Kept as is (neutral effect)
  },
  textRow: {
    flexDirection: 'row',
    marginBottom: 20,
    zIndex: 2,
  },
  letter: {
    fontSize: 60,
    fontWeight: '700',
    color: COLORS.highlight, // #ff9fa3 (coral/peach)
    marginHorizontal: 6,
    fontFamily: 'cursive',
    textShadowColor: 'rgba(255, 159, 163, 0.7)', // Derived from COLORS.highlight
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 20,
    color: COLORS.textSecondary, // #4a4a4a (secondary text)
    fontWeight: '600',
    marginBottom: 40,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.3)', // Kept as is (standard shadow)
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Kept as is (neutral effect)
    bottom: 100,
    opacity: 0.6,
  },
});