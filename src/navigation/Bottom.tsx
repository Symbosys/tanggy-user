import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Animated, Platform, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import MyAccountScreen from '../screens/tabs/Accounts';
import CategoryScreen from '../screens/tabs/Category';
import Discount from '../screens/tabs/Discount';
import HomeScreen from '../screens/tabs/Home';
import SearchScreen from '../screens/tabs/Search';
import { COLORS } from '../theme/theme';
import { AppNavigation } from '../types/type';

export type RootTabParamList = {
  Home: undefined;
  Category: undefined;
  Search: undefined;
  Profile: undefined;
  Discount: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const BottomTab = ({ navigation }: AppNavigation) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Tab.Navigator
      
        screenOptions={({ route }) => ({
          tabBarHideOnKeyboard: true,
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string = '';

            switch (route.name) {
              case 'Home':
                iconName = 'home';
                break;
              case 'Category':
                iconName = 'category';
                break;
              case 'Search':
                iconName = 'search';
                break;
              case 'Profile':
                iconName = 'person';
                break;
              case 'Discount':
                iconName = 'local-offer';
                break;
              default:
                iconName = 'circle';
            }

            return (
              <Animated.View
                style={[
                  styles.iconContainer,
                  { transform: [{ scale: focused ? 1.2 : 1 }] },
                ]}>
                <MaterialIcons name={iconName} size={size} color={color} />
              </Animated.View>
            );
          },
          tabBarLabel: ({ color }) => (
            <Text style={[styles.tabLabel, { color }]}>{route.name}</Text>
          ),
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.muted,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
        })}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Category" component={CategoryScreen} />
        <Tab.Screen name="Discount" component={Discount} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Profile" component={MyAccountScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 8,
    // ✅ Add safe bottom padding for iOS gesture area
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    height: Platform.OS === 'ios' ? 85 : 70,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderTopWidth: 0,
    position: 'absolute', // ✅ keeps it floating above gestures
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default BottomTab;
