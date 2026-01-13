import React from 'react';
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { AppNavigation } from '../../types/type';
import { useAddressStore } from '../../store/address';
import { useProfile } from '../../api/hooks/useProfile';
import { COLORS } from '../../theme/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { getInitials } from '../../utils/utils';

const ProfileScreen = ({ navigation }: AppNavigation) => {
    const { logout, isAuthenticated, hasSkippedLogin } = useAuth();
    const { addresses } = useAddressStore();
    const { data: user } = useProfile();

    const userName = user?.name || 'New User';
    const userPhone = user?.mobile || '';
    const userEmail = user?.email || '';
    const addressesCount = addresses?.length || 0;

    console.log({ user })

    const handleLogout = async () => {
        await logout();
        navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
        });
    };

    const handleLoginNavigation = async () => {
        await logout();
        navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
        });
    };

    // ---------------------------------------------------------
    // 1. GUEST UI (If !isAuthenticated)
    // ---------------------------------------------------------
    if (!isAuthenticated) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: '#FFF' }]}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.primary} />
                <View style={styles.guestContainer}>

                    {/* Aesthetic Icon */}
                    <View style={styles.guestIconWrapper}>
                        <View style={styles.guestIconCircle}>
                            <MaterialCommunityIcons name="chef-hat" size={60} color="#8719C6" />
                        </View>
                        <View style={styles.guestIconDecor} />
                    </View>

                    {/* Typography */}
                    <Text style={styles.guestTitle}>Unlock the Full Experience</Text>
                    <Text style={styles.guestSubtitle}>
                        Log in to track orders, save your favorite cuts, and enjoy exclusive member rewards.
                    </Text>

                    {/* Benefits List */}
                    <View style={styles.benefitContainer}>
                        <View style={styles.benefitItem}>
                            <MaterialIcons name="local-offer" size={24} color="#666" />
                            <Text style={styles.benefitText}>Exclusive Deals</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.benefitItem}>
                            <MaterialIcons name="history" size={24} color="#666" />
                            <Text style={styles.benefitText}>Order History</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.benefitItem}>
                            <MaterialIcons name="location-on" size={24} color="#666" />
                            <Text style={styles.benefitText}>Saved Addresses</Text>
                        </View>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        activeOpacity={0.8}
                        onPress={handleLoginNavigation}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, "#b58ff0"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.loginGradient}
                        >
                            <Text style={styles.loginButtonText}>Login / Sign Up</Text>
                            <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>

                </View>
            </SafeAreaView>
        );
    }

    // ---------------------------------------------------------
    // 2. AUTHENTICATED UI (Gradient Header & Grid)
    // ---------------------------------------------------------
    return (
        <ScrollView>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

                {/* Header Gradient Background */}
                <ImageBackground
                    source={{ uri: 'https://www.transparenttextures.com/patterns/subtle-zebra-3d.png' }}
                    style={styles.headerBackground}
                    imageStyle={styles.textureOverlay}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerGradient}>
                        <View style={styles.headerContent}>
                            <View style={styles.profileImageContainer}>
                                <Text style={styles.profileInitialsText}>
                                    {getInitials(userName)}
                                </Text>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{userName}</Text>
                                <Text style={styles.profilePhone}>{userPhone}</Text>
                                <Text style={styles.profileEmail}>{userEmail}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.editProfileButton}
                                onPress={() => navigation.navigate('UpdateProfile')}
                            >
                                <Text style={styles.editProfileText}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </ImageBackground>

                {/* Grid Cards */}
                <View style={styles.gridContainer}>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('MyOrders')}
                    >
                        <MaterialIcons name="receipt-long" size={24} color="#8719C6" />
                        <View style={styles.cardText}>
                            <Text style={styles.cardTitle}>My Orders</Text>
                            <Text style={styles.cardSubtitle}>0 Active</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('Wallet')}
                    >
                        <MaterialIcons name="account-balance-wallet" size={24} color="#8719C6" />
                        <View style={styles.cardText}>
                            <Text style={styles.cardTitle}>Wallet</Text>
                            <Text style={styles.cardSubtitle}>₹0.0</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('Address')}
                    >
                        <MaterialIcons name="location-on" size={24} color="#8719C6" />
                        <View style={styles.cardText}>
                            <Text style={styles.cardTitle}>Addresses</Text>
                            <Text style={styles.cardSubtitle}>{addressesCount} Saved</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Menu List */}
                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('HelpSupport')}
                    >
                        <View style={styles.menuItemContent}>
                            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(135, 25, 198, 0.1)' }]}>
                                <MaterialIcons name="support-agent" size={24} color="#8719C6" />
                            </View>
                            <Text style={styles.menuItemTitle}>Help & Support</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={28} color="#6b7280" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('HowToTrackOrder')}
                    >
                        <View style={styles.menuItemContent}>
                            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(135, 25, 198, 0.1)' }]}>
                                <MaterialIcons name="delivery-dining" size={24} color="#8719C6" />
                            </View>
                            <Text style={styles.menuItemTitle}>How to Track Order</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={28} color="#6b7280" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('TermsAndConditions')}
                    >
                        <View style={styles.menuItemContent}>
                            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(135, 25, 198, 0.1)' }]}>
                                <MaterialIcons name="description" size={24} color="#8719C6" />
                            </View>
                            <Text style={styles.menuItemTitle}>Terms & Conditions</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={28} color="#6b7280" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('PrivacyPolicy')}
                    >
                        <View style={styles.menuItemContent}>
                            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(135, 25, 198, 0.1)' }]}>
                                <MaterialIcons name="policy" size={24} color="#8719C6" />
                            </View>
                            <Text style={styles.menuItemTitle}>Privacy Policy</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={28} color="#6b7280" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItemBottom}
                        onPress={handleLogout}
                    >
                        <View style={styles.menuItemContent}>
                            <View style={styles.logoutIconContainer}>
                                <MaterialIcons name="logout" size={24} color="#ef4444" />
                            </View>
                            <Text style={styles.logoutTitle}>Logout</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={28} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={[styles.footer, { marginBottom: 70 }]}>
                    <Text style={styles.footerVersion}>Version 1.0.2</Text>
                    <Text style={styles.footerText}>Made with ❤️ in India</Text>
                </View>
            </SafeAreaView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    // --- GUEST UI STYLES ---
    guestContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        backgroundColor: '#FFF',
    },
    guestIconWrapper: {
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    guestIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(135, 25, 198, 0.08)', // Light Purple
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    guestIconDecor: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(135, 25, 198, 0.05)',
        top: 10,
        left: 10,
        zIndex: 1,
    },
    guestTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    guestSubtitle: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    benefitContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9F9F9',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 10,
        width: '100%',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    benefitItem: {
        alignItems: 'center',
        flex: 1,
    },
    benefitText: {
        fontSize: 11,
        color: '#555',
        marginTop: 8,
        fontWeight: '600',
        textAlign: 'center',
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: '#DDD',
    },
    loginButton: {
        width: '100%',
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    loginGradient: {
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 8,
    },

    // --- EXISTING AUTHENTICATED STYLES ---
    headerBackground: {
        width: '100%',
        height: 260,
        justifyContent: 'flex-end',
    },
    textureOverlay: {
        borderBottomLeftRadius: 48,
        borderBottomRightRadius: 48,
        opacity: 0.1,
    },
    headerGradient: {
        flex: 1,
        padding: 16,
        paddingBottom: 48,
        borderBottomLeftRadius: 48,
        borderBottomRightRadius: 48,
        justifyContent: 'flex-end',
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
        gap: 16,
    },
    profileImageContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInitialsText: {
        fontSize: 32,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 2,
    },
    profileInfo: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 22,
        fontWeight: '800',
        color: 'white',
        lineHeight: 26,
        letterSpacing: -0.33,
    },
    profilePhone: {
        fontSize: 16,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 24,
    },
    profileEmail: {
        fontSize: 14,
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: 20,
    },
    editProfileButton: {
        minWidth: 84,
        height: 36,
        backgroundColor: 'white',
        borderRadius: 9999,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editProfileText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.primary,
        lineHeight: 20,
        letterSpacing: 0.21,
    },
    gridContainer: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
    },
    card: {
        flex: 1,
        flexDirection: 'column',
        gap: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: 'white',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 1,
    },
    cardText: {
        flexDirection: 'column',
        gap: 4,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        lineHeight: 20,
    },
    cardSubtitle: {
        fontSize: 14,
        fontWeight: '400',
        color: '#64748b',
        lineHeight: 20,
    },
    menuContainer: {
        flexDirection: 'column',
        gap: 1,
        padding: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        minHeight: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 1,
    },
    menuItemBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        minHeight: 56,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 1,
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    menuItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        lineHeight: 24,
        flex: 1,
    },
    logoutTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ef4444',
        lineHeight: 24,
        flex: 1,
    },
    footer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: 32,
    },
    footerVersion: {
        fontSize: 14,
        fontWeight: '400',
        color: '#64748b',
        textAlign: 'center',
    },
    footerText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#9ca3af',
        textAlign: 'center',
    },
});

export default ProfileScreen;