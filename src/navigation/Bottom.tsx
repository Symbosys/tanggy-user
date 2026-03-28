import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ProfileScreen from '../screens/tabs/Accounts';
import CategoryScreen from '../screens/tabs/Category';
import Discount from '../screens/tabs/Discount';
import HomeScreen from '../screens/tabs/Home';
import SearchScreen from '../screens/tabs/Search';
import { COLORS } from '../theme/theme';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, navigation }: any) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      () => setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (isKeyboardVisible) return null;

  return (
    <View style={styles.barContainer}>
      <TabItem name="Home" icon="home" focused={state.index === 0} navigation={navigation} />
      <TabItem name="Search" icon="search" focused={state.index === 1} navigation={navigation} />
      <TabItem name="Discount" isLottie focused={state.index === 2} navigation={navigation} />
      <TabItem name="Category" icon="category" focused={state.index === 3} navigation={navigation} />
      <TabItem name="Accounts" icon="person" focused={state.index === 4} navigation={navigation} />
    </View>
  );
};

const BottomTab = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Discount" component={Discount} />
        <Tab.Screen name="Category" component={CategoryScreen} />
        <Tab.Screen name="Accounts" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
};

// Helper component to keep your exact icon logic
const TabItem = ({ name, icon, isLottie, focused, navigation }: any) => {
  return (
    <TouchableOpacity
      style={styles.iconContainer}
      onPress={() => navigation.navigate(name)}
      activeOpacity={0.7}
    >
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
  barContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    height: Platform.OS === 'ios' ? 85 : 70,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    // Shadow/Elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
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