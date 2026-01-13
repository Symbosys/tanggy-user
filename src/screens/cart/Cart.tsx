import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AddressSelectionModal,
  CartAddressSection,
  CartBillDetails,
  CartEmptyState,
  CartFooter,
  CartHeader,
  CartItemList,
  CartTipSection,
  cartStyles as styles,
  useCartCalculations,
  useCartInitialization,
  useCartUIStore,
  useCheckoutLogic,
} from '../../module/cart';
import BottomCartPopup from '../../components/ui/popup/BottonCart';
import { COLORS } from '../../theme/theme';
import { AppNavigation } from '../../types/type';

const CartScreen = ({ navigation }: AppNavigation) => {

  // Initialization Logic
  const { loading, cartItems } = useCartInitialization();

  // Calculations
  const {
    total
  } = useCartCalculations();

  // UI State
  const {
    showCheckoutPopup,
    setShowCheckoutPopup,
  } = useCartUIStore();

  // Checkout Logic
  const { handleCheckout, handleConfirmPayment } = useCheckoutLogic();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <CartEmptyState onStartShopping={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.main}
        contentContainerStyle={{ paddingBottom: 112 }}
        showsVerticalScrollIndicator={false}
      >
        <CartHeader onBack={() => navigation.goBack()} />

        <CartItemList />

        <CartTipSection />

        <CartAddressSection />

        <CartBillDetails />
      </ScrollView>

      <AddressSelectionModal
        onAddAddress={() => navigation.navigate('AddAddress')}
      />

      <BottomCartPopup
        visible={showCheckoutPopup}
        onClose={() => setShowCheckoutPopup(false)}
        onConfirm={handleConfirmPayment}
        price={total}
      />

      <CartFooter
        onCheckout={handleCheckout}
        onPaymentMethodPress={() => navigation.navigate('PaymentMethod')}
      />
    </SafeAreaView>
  );
};

export default CartScreen;
