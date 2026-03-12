import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, Platform, StyleSheet, Text, Linking, Image, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import CategoryScreen from '../screens/tabs/Category';
import Discount from '../screens/tabs/Discount';
import HomeScreen from '../screens/tabs/Home';
import { COLORS } from '../theme/theme';

const Tab = createBottomTabNavigator();

const BottomTab = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hiding default bar to use the custom UI overlay
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Discount" component={Discount} />
        <Tab.Screen name="Category" component={CategoryScreen} />
      </Tab.Navigator>

      {/* CUSTOM UI OVERLAY */}
      <View style={styles.floatingContainer} pointerEvents="box-none">

        {/* Main Floating Pill (Home, Discount, Category) */}
        <View style={styles.mainPill}>
          <TabItem name="Home" icon="home" />
          <TabItem name="Discount" isLottie />
          <TabItem name="Category" icon="category" />
        </View>

        {/* Separate Entity (Restro) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.restroEntity}
          onPress={() => Linking.openURL('https://mintarestro.com')}
        >
          <Image
            source={require('../assets/logo/logo.jpeg')}
            style={styles.restroImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper component to keep your exact icon logic
const TabItem = ({ name, icon, isLottie }: any) => {
  // Use navigation hook to check active state
  // In a real app, you'd use useNavigationState to get 'focused'
  const focused = false; // Logic placeholder

  return (
    <TouchableOpacity style={styles.iconContainer}>
      {isLottie ? (
        <LottieView
          source={require('../assets/lottie/Discount.json')}
          autoPlay
          loop
          style={{ width: 80, height: 80 }}
        />
      ) : (
        <>
          <MaterialIcons name={icon} size={28} color={focused ? COLORS.primary : COLORS.muted} />
          <Text style={[styles.tabLabel, { color: focused ? COLORS.primary : COLORS.muted }]}>{name}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    zIndex: 100,
  },
  mainPill: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 35,
    height: 70,
    flex: 1,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  restroEntity: {
    backgroundColor: "#004AAD",
    width: 100,
    height: 70,
    borderTopLeftRadius: 35,
    borderBottomLeftRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopStartRadius: 40,
    borderBottomStartRadius: 40,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  restroImage: {
    width: 100, // Kept your original size
    height: 50,  // Kept your original size
    resizeMode: 'contain',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default BottomTab;