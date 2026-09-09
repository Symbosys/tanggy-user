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
  ScrollView,
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
  }, [showPhoneModal]);

  const handleCloseModal = () => {
    Keyboard.dismiss();
    setShowPhoneModal(false);
  };

  const handleOpenModal = () => {
    setShowPhoneModal(true);
  };

  const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
  const isValidMobile = INDIAN_MOBILE_REGEX.test(phoneNumber);
  const isInvalidMobile =
    phoneNumber.length > 0 &&
    (!/^[6-9]/.test(phoneNumber) || (phoneNumber.length === 10 && !isValidMobile));

  const handlePhoneNumberChange = (text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    setPhoneNumber(numericOnly);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (isValidMobile) {
        const res = await api.post('/auth/user/request-otp', {
          mobile: phoneNumber,
        });
        if (res.data.success) {
          ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
          navigation.navigate('Otp', { mobile: phoneNumber });
        }
      } else {
        ToastAndroid.show('Please enter a valid mobile number.', ToastAndroid.SHORT);
      }
    } catch (error) {
      ErrorMessage(error as AxiosError | Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="#9235D0" />

      {/* FIXED: Added flex: 1 here so the top section can expand */}
      <View style={[{ paddingTop: insets.top, flex: 1 }]}>
        {/* Top full-bleed logo section – ignores safe area for max height */}
        <View style={styles.topSection}>
          <Image
            source={require('../../assets/logo/LOGO.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Bottom section starts right after */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleOpenModal}>
            <Text style={styles.primaryButtonText}>Log in with phone number</Text>
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By tapping, I accept the{' '}
              <Text
                style={styles.termsLink}
                onPress={() => navigation.navigate('TermsAndConditions')}
              >
                terms of service
              </Text>
              {' & '}
              <Text
                style={styles.termsLink}
                onPress={() => navigation.navigate('PrivacyPolicy')}
              >
                privacy policy
              </Text>
            </Text>
          </View>
        </View>

        {/* Modal */}
        <Modal
          visible={showPhoneModal}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={handleCloseModal}>
              <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]} />
            </TouchableWithoutFeedback>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <Animated.View
                style={[
                  styles.modalContent,
                  { transform: [{ translateY: slideAnim }] },
                ]}
              >
                <View
                  style={[
                    styles.modalHeader,
                    { paddingTop: insets.top + 20, paddingBottom: 30 },
                  ]}
                >
                  {/* <TouchableOpacity
                    onPress={async () => {
                      await skipLogin();
                      handleCloseModal();
                      navigation.reset({ index: 0, routes: [{ name: 'BottomTab' }] });
                    }}
                    style={[styles.skipButtonModal, { top: insets.top + 12 }]}
                  >
                    <Text style={styles.skipText}>Skip</Text>
                  </TouchableOpacity> */}

                  <Text style={styles.brandName}>Minta Fresh</Text>
                  <Text style={styles.brandTagline}>Great taste delivered at lowest rate</Text>
                </View>

                <View style={styles.modalBody}>
                  <View style={{ flex: 1, justifyContent: 'space-between' }}>
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
                            onChangeText={handlePhoneNumberChange}
                            placeholder=""
                            placeholderTextColor={COLORS.muted}
                          />
                          {phoneNumber.length > 0 && (
                            <TouchableOpacity onPress={() => setPhoneNumber('')}>
                              <Icon name="cancel" size={20} color={COLORS.muted} />
                            </TouchableOpacity>
                          )}
                        </View>
                        {isInvalidMobile && (
                          <Text style={styles.errorText}>
                            Please enter a valid mobile number.
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.modalFooter}>
                      <TouchableOpacity
                        style={[
                          styles.continueButton,
                          (!isValidMobile || loading) && styles.continueButtonDisabled,
                        ]}
                        onPress={handleLogin}
                        disabled={!isValidMobile || loading}
                      >
                        <Text
                          style={[
                            styles.continueButtonText,
                            !isValidMobile && styles.continueButtonTextDisabled,
                          ]}
                        >
                          {loading ? 'Continue...' : 'Continue'}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.modalTermsContainer}>
                        <Text style={styles.modalTermsText}>
                          I accept the{' '}
                          <Text
                            style={styles.modalTermsLink}
                            onPress={() => {
                              handleCloseModal();
                              navigation.navigate('TermsAndConditions');
                            }}
                          >
                            terms of service
                          </Text>
                          {' & '}
                          <Text
                            style={styles.modalTermsLink}
                            onPress={() => {
                              handleCloseModal();
                              navigation.navigate('PrivacyPolicy');
                            }}
                          >
                            privacy policy
                          </Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  topSection: {
    flex: 1,
    backgroundColor: "#fff",
    position: 'relative',           
  },

  logo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },

  bottomSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },

  // Modal styles (unchanged)
  modalContainer: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  skipButtonModal: {
    position: 'absolute',
    right: 16,
    backgroundColor: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  skipText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    fontStyle: 'italic',
    marginTop: 10,
  },
  brandTagline: {
    fontSize: 14,
    color: '#90EE90',
    marginTop: 8,
    fontWeight: '800',
  },
  modalBody: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  topContentWrapper: {},
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 24,
    lineHeight: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: -8,
    marginLeft: 16,
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
    zIndex: 1,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 4,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: { fontSize: 18, marginRight: 6 },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.textPrimary,
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    padding: 0,
    fontWeight: '500',
  },
  modalFooter: {
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.muted,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: COLORS.white,
    opacity: 0.7,
  },
  modalTermsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalTermsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalTermsLink: {
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;