import { NavigationProp } from "@react-navigation/native";

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Otp: { mobile: string };
  select_your_location: undefined;
  BottomTab: undefined;
  Cart: undefined;
  Cart2: undefined;

  AddAddress: undefined;
  Address: undefined;

  OrderPlaced: undefined;
  OrderTracking: undefined;
  ChatWithDelivery: undefined;
  OrderDetails: undefined;
  AllOrders: undefined;
};


export type AppNavigation = {
    navigation: NavigationProp<RootStackParamList>;
}