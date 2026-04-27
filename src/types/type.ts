import { NavigationProp } from "@react-navigation/native";
import { Product } from "./product.type";

export type RootStackParamList = {

  TestOrder: undefined;

  Splash: undefined;
  Login: undefined;
  Otp: { mobile: string };
  CompleteProfile: undefined;
  select_your_location: undefined;
  SelectLocation: undefined;

  EliteMembership: undefined;

  BottomTab: undefined;
  Cart: undefined;

  Search: undefined;
  
  Home: undefined;
  Category: undefined;
  Profile: undefined;
  Discount: undefined;

  AddAddress: undefined;
  EditAddress: { id: number };
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
  CategoryResults: { categoryId?: string; categoryName: string; search?: string };

  // User Profile
  Wallet: undefined;
  UpdateProfile: undefined;

  // Legal screen
  About: undefined;
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;
  RefundPolicy: undefined;
  Docs: { type: string };


  // Support
  HelpSupport: undefined;
  HowToTrackOrder: undefined;
  SupportHistory: undefined;
  ChatWithSupport: undefined;
  ReportIssue: undefined;
  AiAssistant: undefined;
  MyTickets: undefined;
  TicketDetails: { ticketId: string };
};

export type AppNavigation = {
    navigation: NavigationProp<RootStackParamList>;
    route?: any;
}