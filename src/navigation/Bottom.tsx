import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CategoryScreen from '../screens/tabs/Category';
import HomeScreen from '../screens/tabs/Home';
import ProfileScreen from '../screens/tabs/Profile';
import SearchScreen from '../screens/tabs/Search';
import Discount from '../screens/tabs/Discount';
import { COLORS } from "../theme/theme";

export type RootTabParamList = {
  Home: undefined;
  Category: undefined;
  Search: undefined;
  Profile: undefined;
  Discount: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const BottomTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
            <Animated.View style={[styles.iconContainer, { transform: [{ scale: focused ? 1.2 : 1 }] }]}>
              <MaterialIcons name={iconName} size={size} color={color} />
            </Animated.View>
          );
        },
        tabBarLabel: ({ focused, color }) => (
          <Text style={[styles.tabLabel, { color }]}>{route.name}</Text>
        ),
        tabBarActiveTintColor: COLORS.primary, // #8719C6
        tabBarInactiveTintColor: COLORS.muted, // #888888
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Category" component={CategoryScreen} />
      <Tab.Screen name="Discount" component={Discount} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white, // #ffffff
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 8,
    paddingBottom: 10,
    height: 70,
    shadowColor: COLORS.textPrimary, // #222222
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderTopWidth: 0,
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