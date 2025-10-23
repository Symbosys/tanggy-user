import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { AppNavigation } from '../../types/type';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = ({navigation}: AppNavigation) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout(); 
    navigation.navigate('Login'); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Amit Kumar</Text>
            <Text style={styles.userContact}>
              6202999356 | amitkumardss068@gmail.com
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Minta Infiniti Banner */}
        <View style={styles.infinitiBanner}>
          <View style={styles.infinitiContent}>
            <Text style={styles.infinitiLogo}>Minta</Text>
            <Text style={styles.infinitiLogoSub}>Infiniti ∞</Text>
            <View style={styles.infinitiOffer}>
              <Text style={styles.offerText}>Upto 5% Cashback &</Text>
              <Text style={styles.offerText}>Free Delivery on All Orders!</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.exploreButton}>
            <Text style={styles.exploreText}>Explore</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#FFD700" />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {/* Rewards */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons name="gift-outline" size={24} color="#666" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Rewards</Text>
              <Text style={styles.menuSubtitle}>
                Complete milestones and win exciting rewards
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          {/* Orders */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons name="shopping-outline" size={24} color="#666" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Orders</Text>
              <Text style={styles.menuSubtitle}>Orders placed: 0</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          {/* Addresses */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Address")}
          >
            <View style={styles.menuIcon}>
              <MaterialIcons name="location-on" size={24} color="#666" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Addresses</Text>
              <Text style={styles.menuSubtitle}>1 saved address</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          {/* Minta Wallet */}
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <MaterialCommunityIcons name="wallet-outline" size={24} color="#666" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Minta Wallet</Text>
              <Text style={styles.menuSubtitle}>Cash+: ₹0.0 | Cash: ₹0.0</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuIcon}>
              <MaterialIcons name="logout" size={24} color="#666" />
            </View>
            <Text style={styles.zoneTitle}>Logout</Text>
            <MaterialIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>App Version - 8.55.0 (327)</Text>
          <Text style={styles.bundleText}>Bundle - 1.0.41</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  userContact: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  editButton: {
    fontSize: 16,
    color: '#E91E63',
    fontWeight: '600',
  },
  infinitiBanner: {
    backgroundColor: '#6A1B5C',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infinitiContent: {
    flex: 1,
  },
  infinitiLogo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    fontStyle: 'italic',
  },
  infinitiLogoSub: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    fontStyle: 'italic',
    marginTop: -4,
  },
  infinitiOffer: {
    marginTop: 4,
  },
  offerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exploreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginRight: 4,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  zoneTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  bundleText: {
    fontSize: 14,
    color: '#999',
  },
});

export default ProfileScreen;
