import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyAddressesScreen from '../screens/address/Address';
import Login from '../screens/auth/Login';
import Otp from '../screens/auth/Otp';
import PrivacyPolicyScreen from '../screens/legal/PrivacyPolicy';
import TermsAndConditionsScreen from '../screens/legal/TermsAndConditions';
import SelectYourLocation from '../screens/location/Location';
import AddAddress from '../screens/location/Map';
import AllOrdersScreen from '../screens/order/AllOrders';
import ChatScreen from '../screens/order/Chat';
import OrderDetailsScreen from '../screens/order/OrderDetails';
import OrderConfirmationScreen from '../screens/order/OrderPlaced';
import OrderTracking from '../screens/order/Tracking';
import Splash from '../screens/others/Splash';
import ProductDetailsScreen from '../screens/productsDetails/ProductDetails';
import CategoryResults from '../screens/results/CategoryResults';
import MyWalletScreen from '../screens/wallet/Wallet';
import { RootStackParamList } from '../types/type';
import BottomTab from './Bottom';
import Cart from '../screens/cart/Cart';
import HelpSupportScreen from '../screens/support/HelpAndSupport';
import TrackOrder from '../screens/support/TrackOrder';
import AISupportAssistantScreen from '../screens/support/AiAssistant';
import ReportProblemScreen from '../screens/support/ReportIssue';
import CartScreen from '../screens/cart/TestCart';
import GlobalAlert from '../components/alert/LoginAlert';
import TestAddAddress from '../screens/address/TestAddress';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        // initialRouteName='AddAddress'
      
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Otp" component={Otp} />
        <Stack.Screen name='select_your_location' component={SelectYourLocation} options={{headerShown: true}} />
        <Stack.Screen name="BottomTab" component={BottomTab} />
        <Stack.Screen name='ProductDetails' component={ProductDetailsScreen} />
        <Stack.Screen name='Cart' component={CartScreen} />

        <Stack.Screen name='CategoryResults' component={CategoryResults} />

        <Stack.Screen name='Address' component={MyAddressesScreen} />
        <Stack.Screen name='AddAddress' component={TestAddAddress} />

        
        <Stack.Screen name='OrderPlaced' component={OrderConfirmationScreen} />
        <Stack.Screen name='OrderTracking' component={OrderTracking} />
        <Stack.Screen name='ChatWithDelivery' component={ChatScreen} />
        <Stack.Screen name='OrderDetails' component={OrderDetailsScreen} />

        {/* User Profile  */}
        <Stack.Screen name='MyOrders' component={AllOrdersScreen} />
        <Stack.Screen name='Wallet' component={MyWalletScreen} />


        {/* Legal Screen  */}
        <Stack.Screen name='TermsAndConditions' component={TermsAndConditionsScreen} />
        <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicyScreen} />


        {/* Help And Support */}
        <Stack.Screen name='HelpSupport' component={HelpSupportScreen} />
        <Stack.Screen name='HowToTrackOrder' component={TrackOrder} />
        <Stack.Screen name='ReportIssue' component={ReportProblemScreen} />
        <Stack.Screen name='AiAssistant' component={AISupportAssistantScreen} />
      </Stack.Navigator>

      <GlobalAlert />
    </NavigationContainer>
  );
}
