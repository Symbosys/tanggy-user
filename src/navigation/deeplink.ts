import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../types/type';

export const deeplink: LinkingOptions<RootStackParamList> = {
  prefixes: ['https://mintafresh.com', 'mintafresh://'],
  config: {
    screens: {
      Splash: 'splash',
      Login: 'login',
      Otp: 'otp',

      select_your_location: 'location',

      BottomTab: {
        screens: {
          Home: 'home',
          Discount: 'discount',
          Category: 'category',
        },
      },

      ProductDetails: 'product/:productId',
      Cart: 'cart',

      CategoryResults: 'category/:categoryId',

      Address: 'address',
      AddAddress: 'address/add',

      PaymentCallback: 'payment/callback',

      OrderPlaced: 'order/placed',
      OrderTracking: 'order/:orderId/track',
      OrderDetails: 'order/:orderId',

      ChatWithDelivery: 'order/:orderId/chat',

      Wallet: 'wallet',
      MyOrders: 'my-orders',

      TermsAndConditions: 'terms',
      PrivacyPolicy: 'privacy',
    },
  },
};
