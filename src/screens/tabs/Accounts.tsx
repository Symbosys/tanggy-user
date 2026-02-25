import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
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
  color: string;
  bg: string;
};

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Manage',
    items: [
      { icon: 'location-on', iconFamily: 'material', label: 'My Addresses', subtitle: 'Saved delivery addresses', route: 'Address', color: '#ea580c', bg: '#fff7ed' },
      { icon: 'delivery-dining', iconFamily: 'material', label: 'How to Track Order', subtitle: 'Track your delivery live', route: 'HowToTrackOrder', color: '#7c3aed', bg: '#f5f3ff' },
      { icon: 'info-outline', iconFamily: 'material', label: 'About Us', subtitle: 'Know more about Minta Fresh', route: 'About', color: '#0891b2', bg: '#ecfeff' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { icon: 'description', iconFamily: 'material', label: 'Terms & Conditions', route: 'TermsAndConditions', color: '#64748b', bg: '#f8fafc' },
      { icon: 'shield', iconFamily: 'material', label: 'Privacy Policy', route: 'PrivacyPolicy', color: '#64748b', bg: '#f8fafc' },
      { icon: 'gavel', iconFamily: 'material', label: 'Return & Refund Policy', route: 'RefundPolicy', color: '#64748b', bg: '#f8fafc' },
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
  const renderMenuItem = (item: MenuItem, isLast: boolean) => (
    <TouchableOpacity
      key={item.route}
      activeOpacity={0.6}
      style={[styles.menuRow, !isLast && styles.menuRowBorder]}
      onPress={() => navigation.navigate(item.route as any)}
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
      <MaterialIcons name="chevron-right" size={22} color="#cbd5e1" />
    </TouchableOpacity>
  );

  // ═══════════════════════════════════════
  // 1.  GUEST UI
  // ═══════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
        <View style={styles.guestWrap}>
          <View style={styles.guestIconRing}>
            <MaterialCommunityIcons name="chef-hat" size={56} color={COLORS.primary} />
          </View>
          <Text style={styles.guestTitle}>Your Fresh Journey Awaits</Text>
          <Text style={styles.guestSub}>
            Sign in to track orders, save addresses, and unlock exclusive deals on premium fresh products.
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

          <TouchableOpacity activeOpacity={0.85} onPress={handleLoginNavigation} style={styles.guestBtn}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.guestBtnGrad}
            >
              <Text style={styles.guestBtnText}>Login / Sign Up</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ═══════════════════════════════════════
  // 2.  AUTHENTICATED UI
  // ═══════════════════════════════════════
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Profile Header Card ── */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGrad}
        >
          <View style={styles.headerRow}>
            <View style={styles.avatarRing}>
              <Text style={styles.avatarText}>{getInitials(userName)}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName} numberOfLines={1}>{userName}</Text>
              {userPhone ? <Text style={styles.headerPhone}>{userPhone}</Text> : null}
              {userEmail ? <Text style={styles.headerEmail} numberOfLines={1}>{userEmail}</Text> : null}
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.editBtn}
              onPress={() => navigation.navigate('UpdateProfile')}
            >
              <MaterialIcons name="edit" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Elite Membership Section */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EliteMembership')}
            style={styles.eliteCard}
          >
            <View style={styles.eliteCardTop}>
              <View style={styles.eliteCrownWrap}>
                <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                {isEliteMember ? (
                  <>
                    <View style={styles.eliteActiveBadge}>
                      <View style={styles.eliteActiveDot} />
                      <Text style={styles.eliteActiveBadgeText}>ACTIVE</Text>
                    </View>
                    <Text style={styles.eliteCardTitle}>Elite Member</Text>
                    <Text style={styles.eliteCardSub}>
                      {expiryDays} {expiryDays === 1 ? 'day' : 'days'} remaining
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.eliteCardTitle}>Become an Elite Member</Text>
                    <Text style={styles.eliteCardSub}>
                      Free delivery, discounts & priority support
                    </Text>
                  </>
                )}
              </View>
              <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
            </View>

            <View style={styles.eliteBenefitsRow}>
              {[
                { icon: 'truck-delivery', text: 'Free Delivery' },
                { icon: 'brightness-percent', text: '10% Off' },
                { icon: 'headset', text: 'VIP Support' },
              ].map((b) => (
                <View key={b.text} style={styles.eliteBenefitItem}>
                  <MaterialCommunityIcons name={b.icon} size={15} color="#FFD700" />
                  <Text style={styles.eliteBenefitText}>{b.text}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Quick Actions Row ── */}
        <View style={styles.quickRow}>
          {[
            { icon: 'receipt-long', label: 'Orders', route: 'MyOrders', color: '#6366f1' },
            { icon: 'account-balance-wallet', label: 'Wallet', route: 'Wallet', color: '#0d9488' },
            { icon: 'headset-mic', label: 'Support', route: 'AiAssistant', color: '#2563eb' },
            { icon: 'star-outline', label: 'Elite', route: 'EliteMembership', color: '#d97706' },
          ].map((a) => (
            <TouchableOpacity
              key={a.route}
              activeOpacity={0.7}
              style={styles.quickItem}
              onPress={() => navigation.navigate(a.route as any)}
            >
              <View style={[styles.quickCircle, { backgroundColor: a.color + '12' }]}>
                <MaterialIcons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Menu Sections ── */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) =>
                renderMenuItem(item, idx === section.items.length - 1)
              )}
            </View>
          </View>
        ))}

        {/* ── Logout ── */}
        <View style={styles.sectionWrap}>
          <TouchableOpacity activeOpacity={0.6} style={styles.logoutBtn} onPress={handleLogout}>
            <View style={styles.logoutIconWrap}>
              <MaterialIcons name="logout" size={20} color="#ef4444" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
          <Text style={styles.footerMade}>Make in India</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════
//   STYLES
// ═══════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f8' },

  // ── Guest ──
  guestWrap: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  guestIconRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 10,
  },
  guestSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  guestPerks: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 36,
  },
  guestPerkItem: { alignItems: 'center', gap: 6 },
  guestPerkDot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary + '0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestPerkText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  guestBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  guestBtnGrad: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  guestBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  // ── Header ──
  headerGrad: {
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  headerInfo: { flex: 1, marginLeft: 14 },
  headerName: { fontSize: 19, fontWeight: '800', color: '#FFF' },
  headerPhone: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerEmail: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  // ── Elite Section (inside header) ──
  eliteCard: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.22)',
    padding: 16,
  },
  eliteCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eliteCrownWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,215,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  eliteActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,255,0,0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 3,
    gap: 4,
  },
  eliteActiveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#00ff00',
  },
  eliteActiveBadgeText: {
    color: '#00ff00',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  eliteCardTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  eliteCardSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  eliteBenefitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  eliteBenefitItem: {
    alignItems: 'center',
    gap: 3,
  },
  eliteBenefitText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '600',
  },

  // ── Quick Actions ──
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingVertical: 18,
  },
  quickItem: { alignItems: 'center', gap: 6 },
  quickCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 11, fontWeight: '600', color: '#475569' },

  // ── Sections ──
  sectionWrap: { paddingHorizontal: 16, marginBottom: 6 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 8,
  },

  // ── Menu rows ──
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextBlock: { flex: 1, marginLeft: 12 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  menuSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  // ── Logout ──
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  logoutIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#ef4444', marginLeft: 12 },

  // ── Footer ──
  footer: { alignItems: 'center', paddingVertical: 28, gap: 4 },
  footerVersion: { fontSize: 12, color: '#94a3b8' },
  footerMade: { fontSize: 12, fontWeight: '700', color: '#cbd5e1' },
});

export default ProfileScreen;
