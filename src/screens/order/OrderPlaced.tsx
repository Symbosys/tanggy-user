import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { AppNavigation } from '../../types/type';
import LottieView from 'lottie-react-native';

const OrderConfirmationScreen = ({ navigation }: AppNavigation) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: COLORS.background,
          marginTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('BottomTab')}
        >
          <Icon name="close" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        {/* Success Icon */}
        <LottieView
          source={require('../../assets/lottie/Green_tick.json')}
          autoPlay
          loop={false}
          style={styles.lottie}
        />

        {/* Headline */}
        <Text style={styles.title}>Order Placed Successfully!</Text>

        {/* Body Text */}
        <Text style={styles.subtitle}>
          Thank you for your order! Your food is on its way.
        </Text>

        {/* Meta Info */}
        <Text style={styles.meta}>Order ID: #ORD-58934</Text>

        {/* Estimated Delivery */}
        <View style={styles.etaContainer}>
          <Icon name="timer" size={22} color={COLORS.primary} />
          <Text style={styles.etaText}>Estimated arrival: 25-35 mins</Text>
        </View>
      </View>

      {/* CTA Buttons */}
      <View
        style={[styles.ctaContainer, { paddingBottom: insets.bottom || 16 }]}
      >
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('OrderTracking')}
        >
          <Text style={styles.primaryButtonText}>Track Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('OrderDetails')}
        >
          <Text style={styles.secondaryButtonText}>View Order Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrderConfirmationScreen;

const AnimatedCheckmark = ({ size = 48, color = 'white' }) => {
  const stroke1Width = useRef(new Animated.Value(0)).current;
  const stroke2Width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Delay slightly
      Animated.delay(300),
      // Stroke 1
      Animated.timing(stroke1Width, {
        toValue: 18, // Length of short stroke
        duration: 200,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }),
      // Stroke 2
      Animated.timing(stroke2Width, {
        toValue: 36, // Length of long stroke
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();
  }, []);

  const thickness = 5;

  return (
    <View style={{ width: size, height: size }}>
      {/* Stroke 1: Down-Right */}
      {/* Position carefully calibrated for 48px size */}
      <View
        style={{
          position: 'absolute',
          left: 4,
          top: 27,
          width: 18,
          height: thickness,
          transform: [{ rotate: '45deg' }],
          justifyContent: 'center',
          alignItems: 'flex-start', // Grow from left
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            width: stroke1Width,
            backgroundColor: color,
            borderRadius: thickness / 2,
          }}
        />
      </View>

      {/* Stroke 2: Up-Right */}
      <View
        style={{
          position: 'absolute',
          left: 12,
          top: 22,
          width: 36,
          height: thickness,
          transform: [{ rotate: '-48deg' }], // Slight angle tweak
          justifyContent: 'center',
          alignItems: 'flex-start', // Grow from left
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            width: stroke2Width,
            backgroundColor: color,
            borderRadius: thickness / 2,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',
    marginTop: 20,
  },
  headerButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successOuter: {
    height: 128,
    width: 128,
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successMid: {
    height: 96,
    width: 96,
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successInner: {
    height: 80,
    width: 80,
    borderRadius: 999,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  lottie: {
    width: 250,
    height: 250,
  },
  meta: {
    color: '#888',
    fontSize: 13,
    marginBottom: 24,
    textAlign: 'center',
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary + '20',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  etaText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  ctaContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.primary + '50',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
});
