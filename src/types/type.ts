import { NavigationProp } from "@react-navigation/native";
import { Product } from "./product.type";

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
  MyOrders: undefined;

  ProductDetails: { product: Product };
  CategoryResults: undefined;

  // User Profile
  Wallet: undefined;

  // Legal screen
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;
};


export type AppNavigation = {
    navigation: NavigationProp<RootStackParamList>;
}