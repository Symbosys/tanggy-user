import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useProfile, useUpdateProfile } from '../../api/hooks/useProfile';
import { COLORS } from '../../theme/theme';
import { User } from '../../types/user';
import { ErrorMessage } from '../../utils/utils';

const UpdateProfile = () => {
  const navigation = useNavigation();
  const { data: user, isLoading: isFetching } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdate = () => {
    if (!user) return;

    const updatedUser: User = {
      ...user,
      name,
      email,
    };

    updateProfile(updatedUser, {
      onSuccess: () => {
        navigation.goBack();
      },
      onError: (error) => ErrorMessage(error),
    });
  };

  if (isFetching) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back-ios" size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flexContainer}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Fields Section */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'name' && styles.inputFocused,
                ]}
              >
                <View style={styles.iconCircle}>
                  <Icon
                    name="person-outline"
                    size={18}
                    color={
                      focusedInput === 'name'
                        ? COLORS.primary
                        : COLORS.textSecondary
                    }
                  />
                </View>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.muted}
                  selectionColor={COLORS.primary}
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'email' && styles.inputFocused,
                ]}
              >
                <View style={styles.iconCircle}>
                  <Icon
                    name="mail-outline"
                    size={18}
                    color={
                      focusedInput === 'email'
                        ? COLORS.primary
                        : COLORS.textSecondary
                    }
                  />
                </View>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Enter your email address"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  selectionColor={COLORS.primary}
                />
              </View>
            </View>

            {/* Phone Number (Unedited / Read Only) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputContainer, styles.disabledInput]}>
                <View style={styles.iconCircle}>
                  <Icon
                    name="phone-android"
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </View>
                <TextInput
                  style={[styles.input, styles.disabledInputText]}
                  value={user?.mobile || ''}
                  placeholder="Phone number not set"
                  placeholderTextColor={COLORS.muted}
                  editable={false}
                />
                <View style={styles.verifiedPill}>
                  <Icon name="lock-outline" size={13} color={COLORS.muted} />
                  <Text style={styles.verifiedPillText}>Locked</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdate}
            disabled={isUpdating}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  flexContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerRightPlaceholder: {
    width: 38,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },

  // ── Form Section ──
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 50,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  disabledInput: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.border,
  },
  disabledInputText: {
    color: COLORS.textSecondary,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },

  // ── Footer ──
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  updateButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
});

export default UpdateProfile;
