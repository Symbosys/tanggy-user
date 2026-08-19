import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import {
  AddressSelectionModal,
  CartAddressSection,
  CartApplyOfferSection,
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
import { useCartStore } from '../../store/cart';

const CartScreen = ({ navigation }: AppNavigation) => {

  // Initialization Logic
  const { loading, cartItems } = useCartInitialization();
  const { fetchCart } = useCartStore();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [fetchCart])
  );

  // Calculations
  const {
    total,
    refetchWallet,
  } = useCartCalculations();

  // UI State
  const {
    showCheckoutPopup,
    setShowCheckoutPopup,
  } = useCartUIStore();

  // Checkout Logic
  const {
    handleCheckout,
    handleConfirmPayment,
    isPlacingOrder,
    noDeliveryPartnerAvailable,
    onlineDeliveryPartnersCount,
    refetchPartnerCount,
  } = useCheckoutLogic();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchCart(),
        refetchPartnerCount(),
        refetchWallet(),
      ]);
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchCart, refetchPartnerCount, refetchWallet]);

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        <CartHeader onBack={() => navigation.goBack()} />

        <CartItemList />

        <CartTipSection />

        <CartAddressSection />

        <CartApplyOfferSection />

        <CartBillDetails />

        {noDeliveryPartnerAvailable && (
          <View style={styles.noDeliveryBanner}>
            <MaterialIcons name="error-outline" size={22} color="#DC2626" />
            <Text style={styles.noDeliveryBannerText}>
              Online delivery partners in your area: {onlineDeliveryPartnersCount}. More than 1 required to place an order.
            </Text>
          </View>
        )}
      </ScrollView>

      <AddressSelectionModal
        onAddAddress={() => navigation.navigate('AddAddress')}
      />

      <BottomCartPopup
        visible={showCheckoutPopup}
        onClose={() => setShowCheckoutPopup(false)}
        onConfirm={handleConfirmPayment}
        price={total}
        loading={isPlacingOrder}
      />

      <CartFooter
        onCheckout={handleCheckout}
        onPaymentMethodPress={() => navigation.navigate('PaymentMethod')}
        noDeliveryPartnerAvailable={noDeliveryPartnerAvailable}
      />
    </SafeAreaView>
  );
};

export default CartScreen;
