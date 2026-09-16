import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useEliteMembership } from '../../api/hooks/elite_membership';
import { useProfile } from '../../api/hooks/useProfile';
import { useAuth } from '../../context/AuthContext';
import { useAddressStore } from '../../store/address';
import { COLORS } from '../../theme/theme';
import { AppNavigation } from '../../types/type';
import { getInitials } from '../../utils/utils';

// ── Menu item type ──
type MenuItem = {
  icon: string;
  iconFamily: 'material' | 'community';
  label: string;
  subtitle?: string;
  route: string;
  params?: any;
  color: string;
  bg: string;
};

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Manage',
    items: [
      {
        icon: 'location-on',
        iconFamily: 'material',
        label: 'My Addresses',
        subtitle: 'Saved delivery addresses',
        route: 'Address',
        color: COLORS.primary,
        bg: COLORS.primaryLight,
      },
      {
        icon: 'replay',
        iconFamily: 'material',
        label: 'My Refunds',
        subtitle: 'View cancellation refunds',
        route: 'Refunds',
        color: COLORS.success,
        bg: COLORS.secondary,
      },
      {
        icon: 'two-wheeler',
        iconFamily: 'material',
        label: 'How to Track Order',
        subtitle: 'Track your delivery live',
        route: 'HowToTrackOrder',
        color: COLORS.info,
        bg: COLORS.primaryLight,
      },
      {
        icon: 'info',
        iconFamily: 'material',
        label: 'About Us',
        subtitle: 'Know more about Tanggy',
        route: 'Docs',
        params: { type: 'ABOUT_US' },
        color: COLORS.info,
        bg: COLORS.secondary,
      },
    ],
  },
  {
    title: 'Legal',
    items: [
      {
        icon: 'description',
        iconFamily: 'material',
        label: 'Terms & Conditions',
        route: 'Docs',
        params: { type: 'TERMS_AND_CONDITIONS' },
        color: COLORS.textSecondary,
        bg: COLORS.background,
      },
      {
        icon: 'security',
        iconFamily: 'material',
        label: 'Privacy Policy',
        route: 'Docs',
        params: { type: 'PRIVACY_POLICY' },
        color: COLORS.textSecondary,
        bg: COLORS.background,
      },
      {
        icon: 'gavel',
        iconFamily: 'material',
        label: 'Return & Refund Policy',
        route: 'Docs',
        params: { type: 'REFUND_POLICY' },
        color: COLORS.textSecondary,
        bg: COLORS.background,
      },
    ],
  },
];

const ProfileScreen = ({ navigation }: AppNavigation) => {
  const { logout, isAuthenticated } = useAuth();
  const { data: user } = useProfile();
  const { addresses } = useAddressStore();
  const { data: eliteData } = useEliteMembership({ enabled: isAuthenticated });

  const userName = user?.name || 'New User';
  const userPhone = user?.mobile || '';
  const userEmail = user?.email || '';

  // ── Elite Membership Logic ──
  const membership = eliteData?.data;
  const getDaysRemaining = () => {
    if (!membership?.endDate) return 0;
    const endDate = new Date(membership.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };
  const expiryDays = getDaysRemaining();
  const isEliteMember = membership?.status === 'ACTIVE' && expiryDays > 0;

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleLoginNavigation = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  // ── Helper: Render a single menu row ──
  const renderMenuItem = (item: MenuItem, isLast: boolean, index: number) => (
    <TouchableOpacity
      key={`${item.route}-${index}`}
      activeOpacity={0.65}
      style={[styles.menuRow, !isLast && styles.menuRowBorder]}
      onPress={() => navigation.navigate(item.route as any, item.params)}
    >
      <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
        {item.iconFamily === 'community' ? (
          <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
        ) : (
          <MaterialIcons name={item.icon} size={20} color={item.color} />
        )}
      </View>
      <View style={styles.menuTextBlock}>
        <Text style={styles.menuLabel}>{item.label}</Text>
        {item.subtitle && <Text style={styles.menuSub}>{item.subtitle}</Text>}
      </View>
      <MaterialIcons name="chevron-right" size={20} color={COLORS.muted} />
    </TouchableOpacity>
  );

  // ═══════════════════════════════════════
  // 1. GUEST UI
  // ═══════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        {/* Top Bar with Logo */}
        <View style={styles.topHeader}>
          <Image
            source={require('../../assets/logo/LOGO.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.guestWrap}>
          <View style={styles.guestIconRing}>
            <MaterialCommunityIcons
              name="chef-hat"
              size={52}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.guestTitle}>Your Fresh Journey Awaits</Text>
          <Text style={styles.guestSub}>
            Sign in to track orders, save addresses, and unlock exclusive deals on
            delicious meals and fresh groceries.
          </Text>

          <View style={styles.guestPerks}>
            {[
              { icon: 'local-offer', text: 'Exclusive Deals' },
              { icon: 'history', text: 'Order History' },
              { icon: 'location-on', text: 'Saved Addresses' },
            ].map((p, i) => (
              <View key={i} style={styles.guestPerkItem}>
                <View style={styles.guestPerkDot}>
                  <MaterialIcons name={p.icon} size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.guestPerkText}>{p.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLoginNavigation}
            style={styles.guestBtn}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.guestBtnGrad}
            >
              <Text style={styles.guestBtnText}>Login / Sign Up</Text>
              <MaterialIcons name="arrow-forward" size={18} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ═══════════════════════════════════════
  // 2. AUTHENTICATED UI
  // ═══════════════════════════════════════
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Top Header with Logo & Settings ── */}
        <View style={styles.topHeader}>
          <Image
            source={require('../../assets/logo/LOGO.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.settingsBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('UpdateProfile')}
          >
            <MaterialIcons name="settings" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Profile Header Card ── */}
        <View style={styles.profileCardWrapper}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.highlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCardGrad}
          >
            {/* Subtle background decoration */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.profileCardContent}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>{getInitials(userName)}</Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {userName}
                </Text>
                {userPhone ? (
                  <Text style={styles.profilePhone}>{userPhone}</Text>
                ) : null}
                {userEmail ? (
                  <Text style={styles.profileEmail} numberOfLines={1}>
                    {userEmail}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.editProfileBtn}
                onPress={() => navigation.navigate('UpdateProfile')}
              >
                <MaterialIcons name="edit" size={13} color={COLORS.textPrimary} />
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* ── 3 Quick Action Cards ── */}
        <View style={styles.quickGrid}>
          {[
            {
              icon: 'shopping-bag',
              label: 'My Orders',
              subtitle: 'View your order history',
              route: 'MyOrders',
              color: COLORS.primary,
              bg: COLORS.primaryLight,
            },
            {
              icon: 'account-balance-wallet',
              label: 'My Wallet',
              subtitle: 'View balance & transactions',
              route: 'Wallet',
              color: COLORS.success,
              bg: COLORS.secondary,
            },
            {
              icon: 'headset-mic',
              label: 'Support',
              subtitle: 'Get help & contact us',
              route: 'AiAssistant',
              color: COLORS.info,
              bg: COLORS.primaryLight,
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.route}
              activeOpacity={0.75}
              style={styles.quickCard}
              onPress={() => navigation.navigate(item.route as any)}
            >
              <View style={styles.quickCardTop}>
                <View
                  style={[
                    styles.quickCardIconWrap,
                    { backgroundColor: item.bg },
                  ]}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={item.color}
                  />
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={16}
                  color={COLORS.muted}
                />
              </View>

              <Text style={styles.quickCardTitle}>{item.label}</Text>
              <Text style={styles.quickCardSub}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Menu Sections ── */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) =>
                renderMenuItem(item, idx === section.items.length - 1, idx)
              )}
            </View>
          </View>
        ))}

        {/* ── Logout Button ── */}
        <View style={styles.logoutWrapper}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.logoutBtn}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={18} color={COLORS.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════
//   STYLES
// ═══════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerLogo: {
    width: 140,
    height: 42,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Profile Card ──
  profileCardWrapper: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
  },
  profileCardGrad: {
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.highlight,
  },
  decorCircle1: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.5,
  },
  decorCircle2: {
    position: 'absolute',
    right: 40,
    bottom: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.4,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  profilePhone: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  profileEmail: {
    fontSize: 11.5,
    color: COLORS.muted,
    marginTop: 1,
    fontWeight: '500',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  editProfileText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // ── Quick Cards Grid ──
  quickGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },
  quickCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
    minHeight: 105,
  },
  quickCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickCardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  quickCardSub: {
    fontSize: 10,
    color: COLORS.muted,
    lineHeight: 13,
    fontWeight: '500',
  },

  // ── Menu Sections ──
  sectionWrap: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginLeft: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextBlock: {
    flex: 1,
    marginLeft: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  menuSub: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
    fontWeight: '500',
  },

  // ── Logout ──
  logoutWrapper: {
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 24,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.highlight,
    borderRadius: 16,
    height: 48,
    gap: 8,
  },
  logoutText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.error,
  },

  // ── Guest ──
  guestWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  guestIconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  guestSub: {
    fontSize: 13.5,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 26,
    paddingHorizontal: 8,
  },
  guestPerks: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  guestPerkItem: {
    alignItems: 'center',
    gap: 6,
  },
  guestPerkDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestPerkText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  guestBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  guestBtnGrad: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  guestBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
});

export default ProfileScreen;
