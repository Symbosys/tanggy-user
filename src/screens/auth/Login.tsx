import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppNavigation } from '../../types/type';
import { useAuth } from '../../context/AuthContext';
import { ErrorMessage } from '../../utils/utils';
import { AxiosError } from 'axios';
import api from '../../api/api';
import { COLORS } from '../../theme/theme';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: AppNavigation) => {
  // 1. Get notch height to fix overlapping issues
  const insets = useSafeAreaInsets();

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const { skipLogin } = useAuth();

  useEffect(() => {
    if (showPhoneModal) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showPhoneModal, slideAnim, backdropAnim]);

  const handleCloseModal = () => {
    Keyboard.dismiss();
    setShowPhoneModal(false);
  };

  const handleOpenModal = () => {
    setShowPhoneModal(true);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (phoneNumber.length === 10) {
        const res = await api.post('/auth/user/request-otp', {
          mobile: phoneNumber,
        });
        if (res.data.success) {
          ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
          navigation.navigate('Otp', { mobile: phoneNumber });
        }
      } else {
        ToastAndroid.show('Please enter a valid 10-digit number', ToastAndroid.SHORT);
      }
    } catch (error) {
      ErrorMessage(error as AxiosError | Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.container}>
        {/* Main Screen Skip Button */}
        <TouchableOpacity
          onPress={async () => {
            await skipLogin();
            navigation.reset({ index: 0, routes: [{ name: 'select_your_location' }] });
          }}
          style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Top Section with Logo */}
        <View style={styles.topSection}>
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../assets/logo/LOGO.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.tagline}>Quick & fresh.</Text>
        </View>

        {/* Bottom White Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleOpenModal}>
            <Text style={styles.primaryButtonText}>Log in with phone number</Text>
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By tapping, I accept the{' '}
              <Text style={styles.termsLink}>terms of service</Text>
              {' & '}
              <Text style={styles.termsLink}>privacy policy</Text>
            </Text>
          </View>
        </View>

        {/* Phone Number Modal */}
        <Modal
          visible={showPhoneModal}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={handleCloseModal}>

          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={handleCloseModal}>
              <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
            </TouchableWithoutFeedback>

            <Animated.View
              style={[
                styles.modalContent,
                { transform: [{ translateY: slideAnim }] },
              ]}>

              {/* Header: Green part */}
              <View
                style={[
                  styles.modalHeader,
                  // DYNAMIC PADDING: Pushes content down below the notch
                  { paddingTop: insets.top + 20, paddingBottom: 30 }
                ]}
              >
                <TouchableOpacity
                  onPress={async () => {
                    await skipLogin();
                    handleCloseModal();
                    navigation.reset({ index: 0, routes: [{ name: 'select_your_location' }] });
                  }}
                  // DYNAMIC POSITION: Ensures button is never covered by status bar
                  style={[styles.skipButtonModal, { top: insets.top + 12 }]}>
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>

                <Text style={styles.brandName}>Minta Fresh</Text>
                <Text style={styles.brandTagline}>Great taste delivered at lowest rate</Text>
              </View>

              {/* White Body */}
              <View style={styles.modalBody}>
                {/* KEYBOARD HANDLING:
                   Only wraps the body. This ensures the Header stays pinned at the top 
                   while the bottom buttons move up with the keyboard.
                */}
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                  style={{ flex: 1 }}
                >
                  <View style={{ flex: 1, justifyContent: 'space-between' }}>

                    {/* TOP CONTENT: Input & Title */}
                    <View style={styles.topContentWrapper}>
                      <Text style={styles.modalTitle}>
                        Enter your mobile number to manage orders
                      </Text>

                      <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Mobile Number</Text>
                        <View style={styles.phoneInputWrapper}>
                          <View style={styles.countryCodeContainer}>
                            <Text style={styles.flagEmoji}>🇮🇳</Text>
                            <Text style={styles.countryCode}>+91</Text>
                            <Icon name="keyboard-arrow-down" size={20} color={COLORS.textPrimary} />
                          </View>
                          <View style={styles.divider} />
                          <TextInput
                            style={styles.phoneInput}
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder=""
                            placeholderTextColor={COLORS.muted}
                          />
                          {phoneNumber.length > 0 && (
                            <TouchableOpacity onPress={() => setPhoneNumber('')}>
                              <Icon name="cancel" size={20} color={COLORS.muted} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* BOTTOM CONTENT: Buttons */}
                    <View style={styles.modalFooter}>
                      <TouchableOpacity
                        style={[
                          styles.continueButton,
                          (phoneNumber.length < 10 || loading) && styles.continueButtonDisabled,
                        ]}
                        onPress={handleLogin}
                        disabled={phoneNumber.length < 10 || loading}>
                        <Text
                          style={[
                            styles.continueButtonText,
                            phoneNumber.length < 10 && styles.continueButtonTextDisabled,
                          ]}>
                          {loading ? 'Continue...' : 'Continue'}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.modalTermsContainer}>
                        <Text style={styles.modalTermsText}>
                          I accept the{' '}
                          <Text style={styles.modalTermsLink}>terms of service</Text>
                          {' & '}
                          <Text style={styles.modalTermsLink}>privacy policy</Text>
                        </Text>
                      </View>
                    </View>

                  </View>
                </KeyboardAvoidingView>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.secondary },
  container: { flex: 1, backgroundColor: COLORS.secondary },
  skipButton: {
    position: 'absolute', top: 10, right: 10, backgroundColor: COLORS.textPrimary,
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 25, zIndex: 10,
  },
  skipText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  topSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  tagline: { fontSize: 26, color: COLORS.textPrimary, fontWeight: '600', marginBottom: 40, textAlign: 'center' },
  illustrationContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width },
  illustration: { width: width * 0.8, height: height * 0.4 },
  bottomSection: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingTop: 50, paddingBottom: 40 },
  primaryButton: {
    backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 30,
    alignItems: 'center', marginBottom: 20,
    shadowColor: COLORS.textPrimary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  primaryButtonText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  termsContainer: { alignItems: 'center', paddingHorizontal: 20 },
  termsText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  termsLink: { color: COLORS.textSecondary, textDecorationLine: 'underline', fontWeight: '600' },

  // --- MODAL STYLES ---
  modalContainer: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },

  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%', // Takes full screen but respects safe areas
    backgroundColor: 'transparent',
  },

  modalHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    alignItems: 'center',
    // Padding Top/Bottom are handled dynamically in component style
  },
  skipButtonModal: {
    position: 'absolute',
    right: 16,
    backgroundColor: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
    // Top is handled dynamically in component style
  },
  brandName: { fontSize: 32, fontWeight: '800', color: COLORS.white, fontStyle: 'italic', marginTop: 10 },
  brandTagline: { fontSize: 14, color: '#90EE90', marginTop: 8, fontWeight: '800' },

  modalBody: {
    flex: 1, // Fills remaining space
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  topContentWrapper: {
    // Top content wrapper
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 24, lineHeight: 30 },
  inputContainer: { marginBottom: 20 },
  inputLabel: {
    fontSize: 12, fontWeight: '500', color: COLORS.textSecondary, marginBottom: -8,
    marginLeft: 16, backgroundColor: COLORS.white, paddingHorizontal: 6, alignSelf: 'flex-start', zIndex: 1,
  },
  phoneInputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.primary,
    borderRadius: 30, paddingHorizontal: 16, paddingVertical: 14, marginTop: 4,
  },
  countryCodeContainer: { flexDirection: 'row', alignItems: 'center' },
  flagEmoji: { fontSize: 18, marginRight: 6 },
  countryCode: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginRight: 2 },
  divider: { width: 1, height: 24, backgroundColor: COLORS.textPrimary, marginHorizontal: 12 },
  phoneInput: { flex: 1, fontSize: 16, color: COLORS.textPrimary, padding: 0, fontWeight: '500' },

  modalFooter: { paddingBottom: 20 },
  continueButton: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 30, alignItems: 'center', marginBottom: 16 },
  continueButtonDisabled: { backgroundColor: COLORS.muted },
  continueButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  continueButtonTextDisabled: { color: COLORS.white, opacity: 0.7 },
  modalTermsContainer: { alignItems: 'center', paddingHorizontal: 20 },
  modalTermsText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  modalTermsLink: { color: COLORS.textSecondary, textDecorationLine: 'underline', fontWeight: '600' },
});

export default LoginScreen;