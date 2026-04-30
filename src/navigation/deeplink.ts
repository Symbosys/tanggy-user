import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../types/type';

export const deeplink: LinkingOptions<RootStackParamList> = {
  prefixes: ['https://mintafresh.com', 'mintafresh://'],
  config: {
    screens: {
      TestOrder: 'test-order',
      Splash: 'splash',
      Login: 'login',
      Otp: 'otp',
      CompleteProfile: 'complete-profile',

      select_your_location: 'location',
      SelectLocation: 'select-location',

      BottomTab: {
        screens: {
          Home: 'home',
          Discount: 'discount',
          Category: 'category',
          Search: 'search',
          Accounts: 'accounts',
        },
      },

      Profile: 'profile',
      Search: 'search-main',
      EliteMembership: 'elite-membership',

      ProductDetails: 'product/:productId',
      Cart: 'cart',

      CategoryResults: 'category/:categoryId',

      Address: 'address',
      AddAddress: 'address/add',
      EditAddress: 'address/edit/:id',

      PaymentCallback: 'payment/callback',
      PaymentMethod: 'payment/method',

      OrderPlaced: 'order/placed',
      OrderTracking: 'order/:orderId/track',
      OrderDetails: 'order/:orderId',

      ChatWithDelivery: 'order/:orderId/chat',

      Wallet: 'wallet',
      MyOrders: 'my-orders',
      UpdateProfile: 'profile/update',

      About: 'about',
      TermsAndConditions: 'terms',
      PrivacyPolicy: 'privacy',
      RefundPolicy: 'refund-policy',
      Docs: 'docs/:type',

      HelpSupport: 'help-support',
      HowToTrackOrder: 'track-order',
      ReportIssue: 'report-issue',
      MyTickets: 'my-tickets',
      TicketDetails: 'ticket/:ticketId',
      AiAssistant: 'ai-assistant',
    },
  },
};

