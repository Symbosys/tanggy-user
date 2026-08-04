import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  ToastAndroid,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../types/type';
import { ErrorMessage } from '../../utils/utils';
import { PROFILE_INCOMPLETE_KEY } from './CompleteProfile';

const { width } = Dimensions.get('window');

interface OTPVerificationScreenProps {
  navigation: NavigationProp<RootStackParamList>;
  route: { params?: { mobile?: string } };
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '']);
  const [timer, setTimer] = useState<number>(60);
  const [loading, _setLoading] = useState<boolean>(false);
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const phoneNumber = route?.params?.mobile || '+91 7091291644';

  const { login } = useAuth()


  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleResendSMS = async () => {
    setTimer(60);
    setOtp(['', '', '', '']);
    try {
      const res = await api.post('/auth/user/request-otp', { mobile: phoneNumber });
      if (res.data.success) {
        ToastAndroid.show('OTP resent successfully', ToastAndroid.SHORT);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        ToastAndroid.show(
          error.response?.data.message || 'Failed to resend OTP',
          ToastAndroid.LONG,
        );
      } else {
        ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
      }
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      ToastAndroid.show('Please enter full OTP', ToastAndroid.SHORT);
      return;
    }
    setVerifyLoading(true);
    try {
      const res = await api.post('/auth/user/verify-otp', {
        otp: otpCode,
        mobile: phoneNumber,
      });
      if (res.data.success) {
        ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
        await login(res.data?.token, res.data?.user?.id);

        const user = res.data?.user;
        const isProfileIncomplete = !user?.name?.trim() || !user?.email?.trim();

        if (isProfileIncomplete) {
          await AsyncStorage.setItem(PROFILE_INCOMPLETE_KEY, 'true');
          navigation.reset({
            index: 0,
            routes: [{ name: 'CompleteProfile' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'BottomTab' }],
          });
        }
      }
    } catch (error) {
      ErrorMessage(error as AxiosError | Error)
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8719C6" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Minta Fresh</Text>
        </View>
        <Text style={styles.tagline}>Quick & Fresh</Text>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.otpTopContainer}>
              <Text style={styles.otpSubtitle}>We've sent a verification code to</Text>
              <Text style={styles.otpPhoneText}>{phoneNumber}</Text>
            </View>

            {/* OTP Input Boxes */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <View key={index} style={styles.otpBox}>
                  <TextInput
                    ref={ref => {
                      inputRefs.current[index] = ref;
                    }}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={value => handleOtpChange(value, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                </View>
              ))}
            </View>

            <Text style={styles.resendText}>Resend OTP in {timer}</Text>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (otp.join('').length < 4 || verifyLoading) &&
                styles.verifyButtonDisabled,
              ]}
              onPress={handleVerify}
              disabled={otp.join('').length < 4 || verifyLoading}>
              <Text
                style={[
                  styles.verifyButtonText,
                  (otp.join('').length < 4 || verifyLoading) &&
                  styles.verifyButtonTextDisabled,
                ]}>
                {verifyLoading ? 'Verifying...' : 'Verify'}
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, timer > 0 && styles.buttonDisabled]}
                  disabled={timer > 0 || loading}
                  onPress={handleResendSMS}>
                  <Text
                    style={[
                      styles.buttonText,
                      timer > 0 && styles.buttonTextDisabled,
                    ]}>
                    Get via SMS
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8719C6',
  },
  header: {
    backgroundColor: '#8719C6',
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: 'white',
    fontStyle: 'italic',
    textShadowColor: '#8B008B',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 0,
  },
  bySwiggy: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: -8,
  },
  tagline: {
    fontSize: 18,
    color: '#ffff',
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#f9eae9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  otpTopContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
    fontWeight: '400',
  },
  otpPhoneText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  otpBox: {
    width: 60,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '400',
    color: '#374151',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
  },
  resendText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 30,
  },
  verifyButton: {
    backgroundColor: '#8719C6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  verifyButtonTextDisabled: {
    color: '#A0A0A0',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: {
    flex: 1,
    backgroundColor: '#8719C6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextDisabled: {
    color: '#A0A0A0',
  },
});

export default OTPVerificationScreen;