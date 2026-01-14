import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import { useUpdateProfile } from '../../api/hooks/useProfile';
import { COLORS } from '../../theme/theme';
import { RootStackParamList } from '../../types/type';

export const PROFILE_INCOMPLETE_KEY = 'profile_incomplete';

interface CompleteProfileProps {
    navigation: NavigationProp<RootStackParamList>;
}

const CompleteProfile: React.FC<CompleteProfileProps> = ({ navigation }) => {
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

    const validateEmail = (emailValue: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailValue);
    };

    const validateForm = (): boolean => {
        const newErrors: { name?: string; email?: string } = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCompleteProfile = () => {
        if (!validateForm()) {
            return;
        }

        updateProfile(
            { name: name.trim(), email: email.trim() },
            {
                onSuccess: async () => {
                    await AsyncStorage.removeItem(PROFILE_INCOMPLETE_KEY);
                    ToastAndroid.show('Profile completed successfully!', ToastAndroid.SHORT);

                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'select_your_location' }],
                    });
                },
            }
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <LinearGradient
                colors={[COLORS.primary, '#b58ff0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.iconContainer}>
                        <Icon name="person-add" size={40} color={COLORS.white} />
                    </View>
                    <Text style={styles.headerTitle}>Complete Your Profile</Text>
                    <Text style={styles.headerSubtitle}>
                        Please provide your details to continue
                    </Text>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeText}>
                            Welcome to Minta Fresh! 🎉
                        </Text>
                        <Text style={styles.welcomeSubtext}>
                            We need a few more details to personalize your experience.
                        </Text>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <View style={[
                            styles.inputContainer,
                            errors.name && styles.inputError
                        ]}>
                            <Icon
                                name="person-outline"
                                size={22}
                                color={errors.name ? '#FF5252' : COLORS.textSecondary}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                                }}
                                placeholder="Enter your full name"
                                placeholderTextColor={COLORS.muted}
                                autoCapitalize="words"
                            />
                        </View>
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email Address *</Text>
                        <View style={[
                            styles.inputContainer,
                            errors.email && styles.inputError
                        ]}>
                            <Icon
                                name="mail-outline"
                                size={22}
                                color={errors.email ? '#FF5252' : COLORS.textSecondary}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                                }}
                                placeholder="Enter your email address"
                                placeholderTextColor={COLORS.muted}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitButton, isUpdating && styles.submitButtonDisabled]}
                        onPress={handleCompleteProfile}
                        disabled={isUpdating}
                    >
                        <LinearGradient
                            colors={isUpdating ? ['#ccc', '#ccc'] : [COLORS.primary, '#b58ff0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            {isUpdating ? (
                                <ActivityIndicator size="small" color={COLORS.white} />
                            ) : (
                                <>
                                    <Text style={styles.submitButtonText}>Complete Profile</Text>
                                    <Icon name="arrow-forward" size={20} color={COLORS.white} />
                                </>
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
    header: {
        paddingTop: 30,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingBottom: 10,
    },
    welcomeContainer: {
        backgroundColor: COLORS.secondary,
        borderRadius: 16,
        padding: 20,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: 'rgba(146, 53, 208, 0.1)',
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    welcomeSubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 56,
    },
    inputError: {
        borderColor: '#FF5252',
        backgroundColor: '#FFF5F5',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    errorText: {
        fontSize: 12,
        color: '#FF5252',
        marginTop: 6,
        marginLeft: 4,
    },
    footer: {
        padding: 24,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    submitButton: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 5,
    },
    submitButtonDisabled: {
        elevation: 0,
    },
    gradientButton: {
        flexDirection: 'row',
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '700',
    },
});

export default CompleteProfile;
