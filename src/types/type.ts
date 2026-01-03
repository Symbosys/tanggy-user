import { NavigationProp } from "@react-navigation/native";
import { Product } from "./product.type";

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Otp: { mobile: string };
  select_your_location: undefined;

  EliteMembership: undefined;

  BottomTab: undefined;
  Cart: undefined;

  Search: undefined;
  
  Home: undefined;
  Category: undefined;
  Profile: undefined;
  Discount: undefined;

  AddAddress: undefined;
  Address: undefined;

  // Order
  OrderPlaced: undefined;
  OrderTracking: undefined;
  ChatWithDelivery: undefined;
  OrderDetails: undefined;
  MyOrders: undefined;

  // Payment
  PaymentCallback: undefined;
  PaymentMethod: undefined;

  ProductDetails: { product: Product };
  CategoryResults: { categoryId?: string; categoryName: string };

  // User Profile
  Wallet: undefined;
  UpdateProfile: undefined;

  // Legal screen
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;


  // Support
  HelpSupport: undefined;
  HowToTrackOrder: undefined;
  SupportHistory: undefined;
  ChatWithSupport: undefined;
  ReportIssue: undefined;
  AiAssistant: undefined;
};


export type AppNavigation = {
    navigation: NavigationProp<RootStackParamList>;
}