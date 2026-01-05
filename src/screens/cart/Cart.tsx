import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/theme';
import { AppNavigation } from '../../types/type';
import BottomCartPopup from '../../components/ui/popup/BottonCart';
import TaxBreakdownPopup from '../../components/cart/TaxBreakdownPopup';
import {
  cartStyles as styles,
  useCartInitialization,
  useCartCalculations,
  useCheckoutLogic,
  useCartUIStore,
  CartHeader,
  CartEmptyState,
  CartItemList,
  CartTipSection,
  CartAddressSection,
  CartBillDetails,
  CartFooter,
  AddressSelectionModal,
} from '../../components/cart';

const CartScreen = ({ navigation }: AppNavigation) => {

  // Initialization Logic
  const { loading, cartItems } = useCartInitialization();

  // Calculations
  const {
    gstOnItemTotal,
    gstOnDeliveryFee,
    gstOnPlatform,
    gstOnPackingFee,
    totalGstAmount,
    total
  } = useCartCalculations();

  // UI State
  const {
    showCheckoutPopup,
    setShowCheckoutPopup,
    showTaxPopup,
    setShowTaxPopup
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

      <TaxBreakdownPopup
        visible={showTaxPopup}
        onClose={() => setShowTaxPopup(false)}
        gstOnItemTotal={gstOnItemTotal}
        gstOnDeliveryFee={gstOnDeliveryFee}
        gstOnPlatform={gstOnPlatform}
        gstOnPackingFee={gstOnPackingFee}
        totalGstAmount={totalGstAmount}
      />
    </SafeAreaView>
  );
};

export default CartScreen;
