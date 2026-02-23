import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { COLORS } from '../../theme/theme';
import { AppNavigation } from '../../types/type';

const { width, height } = Dimensions.get('window');

const OrderConfirmationScreen = ({ navigation }: AppNavigation) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setTimeout(() => {
      navigation.reset({
        index: 1,
        routes: [{ name: 'BottomTab' }, { name: 'OrderTracking' }],
      });
    }, 2000);
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/order/order-successfull.jpeg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.navigate('BottomTab')}
          >
            <Icon name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content */}
      <View style={styles.main}>
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../assets/lottie/Green_tick.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
        </View>

        {/* Success Content */}
        <View style={styles.contentCard}>
          <Text style={styles.title}>Order Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your order has been placed successfully.{'\n'}
            We're preparing it with love! 💜
          </Text>

          {/* Order Info Card */}
          <View style={styles.orderInfoCard}>
            <View style={styles.orderInfoRow}>
              <View style={styles.infoItem}>
                <Icon name="receipt" size={20} color={COLORS.primary} />
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Order ID</Text>
                  <Text style={styles.infoValue}>#ORD-58934</Text>
                </View>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoItem}>
                <Icon name="schedule" size={20} color={COLORS.success} />
                <View style={styles.infoTextGroup}>
                  <Text style={styles.infoLabel}>Delivery Time</Text>
                  <Text style={styles.infoValue}>25-35 mins</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Status Steps */}
          <View style={styles.statusContainer}>
            <View style={styles.statusStep}>
              <View style={[styles.statusDot, styles.statusDotActive]} />
              <Text style={styles.statusText}>Order Placed</Text>
            </View>
            <View style={styles.statusLine} />
            <View style={styles.statusStep}>
              <View style={styles.statusDot} />
              <Text style={styles.statusTextMuted}>Preparing</Text>
            </View>
            <View style={styles.statusLine} />
            <View style={styles.statusStep}>
              <View style={styles.statusDot} />
              <Text style={styles.statusTextMuted}>On the way</Text>
            </View>
            <View style={styles.statusLine} />
            <View style={styles.statusStep}>
              <View style={styles.statusDot} />
              <Text style={styles.statusTextMuted}>Delivered</Text>
            </View>
          </View>
        </View>
      </View>

      {/* CTA Buttons */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('OrderTracking')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={styles.primaryBtnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name="local-shipping" size={22} color={COLORS.white} />
            <Text style={styles.primaryBtnText}>Track My Order</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('BottomTab')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default OrderConfirmationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  headerSafe: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  lottie: {
    width: width * 0.55,
    height: width * 0.55,
    maxWidth: 220,
    maxHeight: 220,
  },
  contentCard: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: width > 400 ? 28 : 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: width > 400 ? 16 : 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  orderInfoCard: {
    width: '100%',
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  infoTextGroup: {
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '800',
    marginTop: 2,
  },
  infoDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  statusStep: {
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  statusDotActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  statusLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
    textAlign: 'center',
  },
  statusTextMuted: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.muted,
    textAlign: 'center',
  },
  ctaContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryBtnGrad: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFBFC',
  },
  secondaryBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
});
