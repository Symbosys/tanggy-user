import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GlobalAlert from '../components/alert/GlobalAlert';
import { navigationRef } from './NavigationService';
import AddAddresses from '../screens/address/AddAddresses';
import EditAddress from '../screens/address/EditAddress';
import MyAddressesScreen from '../screens/address/Address';
import CompleteProfile from '../screens/auth/CompleteProfile';
import Login from '../screens/auth/Login';
import Otp from '../screens/auth/Otp';
import CartScreen from '../screens/cart/Cart';
import EliteMembershipScreen from '../screens/elite-membership/EliteMember';
import PrivacyPolicyScreen from '../screens/legal/PrivacyPolicy';
import TermsAndConditionsScreen from '../screens/legal/TermsAndConditions';
import SelectYourLocation from '../screens/location/Location';
import AllOrdersScreen from '../screens/order/AllOrders';
import ChatScreen from '../screens/order/Chat';
import OrderDetailsScreen from '../screens/order/OrderDetails';
import OrderConfirmationScreen from '../screens/order/OrderPlaced';
import OrderTracking from '../screens/order/Tracking';
import Splash from '../screens/others/Splash';
import PaymentButton from '../screens/payment/PaymentCallback';
import PaymentMethodScreen from '../screens/payment/PaymentMethod';
import ProductDetailsScreen from '../screens/productsDetails/ProductDetails';
import UpdateProfile from '../screens/profile/UpdateProfile';
import CategoryResults from '../screens/results/CategoryResults';
import AISupportAssistantScreen from '../screens/support/AiAssistant';
import HelpSupportScreen from '../screens/support/HelpAndSupport';
import MyTicketsScreen from '../screens/support/Issues/MyTickets';
import ReportProblemScreen from '../screens/support/Issues/ReportIssue';
import TicketDetailsScreen from '../screens/support/Issues/TicketDetails';
import TrackOrder from '../screens/support/TrackOrder';
import MyWalletScreen from '../screens/wallet/Wallet';
import { RootStackParamList } from '../types/type';
import BottomTab from './Bottom';
import { deeplink } from './deeplink';
import AboutUs from '../screens/legal/About';
import RefundAndReturnPolicy from '../screens/legal/ReturnRefundPolicy';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigation() {
  return (
    <NavigationContainer ref={navigationRef} linking={deeplink}>
      <Stack.Navigator
        initialRouteName='Wallet'

        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Otp" component={Otp} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfile} />
        <Stack.Screen name='select_your_location' component={SelectYourLocation} options={{ headerShown: true }} />

        <Stack.Screen name='EliteMembership' component={EliteMembershipScreen} />

        <Stack.Screen name="BottomTab" component={BottomTab} />
        <Stack.Screen name='ProductDetails' component={ProductDetailsScreen} />
        <Stack.Screen name='Cart' component={CartScreen} />

        <Stack.Screen name='CategoryResults' component={CategoryResults} />

        <Stack.Screen name='Address' component={MyAddressesScreen} />
        <Stack.Screen name='AddAddress' component={AddAddresses} />
        <Stack.Screen name='EditAddress' component={EditAddress} />

        {/* Order  */}
        <Stack.Screen name='PaymentCallback' component={PaymentButton} />
        <Stack.Screen name='PaymentMethod' component={PaymentMethodScreen} />
        <Stack.Screen name='OrderPlaced' component={OrderConfirmationScreen} />
        <Stack.Screen name='OrderTracking' component={OrderTracking} />
        <Stack.Screen name='ChatWithDelivery' component={ChatScreen} />
        <Stack.Screen name='OrderDetails' component={OrderDetailsScreen} />

        {/* User Profile  */}
        <Stack.Screen name='MyOrders' component={AllOrdersScreen} />
        <Stack.Screen name='Wallet' component={MyWalletScreen} />
        <Stack.Screen name='UpdateProfile' component={UpdateProfile} />


        {/* Legal Screen  */}
        <Stack.Screen name='About' component={AboutUs} />
        <Stack.Screen name='TermsAndConditions' component={TermsAndConditionsScreen} />
        <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicyScreen} />
        <Stack.Screen name='RefundPolicy' component={RefundAndReturnPolicy} />


        {/* Help And Support */}
        <Stack.Screen name='HelpSupport' component={HelpSupportScreen} />
        <Stack.Screen name='HowToTrackOrder' component={TrackOrder} />
        <Stack.Screen name='ReportIssue' component={ReportProblemScreen} />
        <Stack.Screen name='MyTickets' component={MyTicketsScreen} />
        <Stack.Screen name='TicketDetails' component={TicketDetailsScreen} />
        <Stack.Screen name='AiAssistant' component={AISupportAssistantScreen} />
      </Stack.Navigator>

      <GlobalAlert />
    </NavigationContainer>
  );
}
