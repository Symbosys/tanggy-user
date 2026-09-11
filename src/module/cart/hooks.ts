import { useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../../store/cart';
import { useCartUIStore } from './store';
import { useAddressStore } from '../../store/address';
import { usePaymentStore } from '../../store/payment';
import {
  parseToDecimal,
  handlePayment as handlePaymentUtil,
  ErrorMessage,
} from '../../utils/utils';
import { useLocationStore } from '../../store/location';
import { useAlertStore } from '../../store/alert.store';
import { CartItem } from './types';
import { RootStackParamList } from '../../types/type';
import { NavigationProp } from '@react-navigation/native';
import PhonePePaymentSDK from 'react-native-phonepe-pg';
import { PHONEPE_CONFIG } from '../../constants/phonepay';
import { Alert } from 'react-native';
import { usePlaceOrder } from '../../api/hooks/useOrder';
import { useNearbyDeliveryPartnersCount } from '../../api/hooks/useProfile';
import { useUserWallet } from '../../api/hooks/useWallet';
import { OrderSource, PaymentMethod } from '../../types/order.type';
import { useModeStore } from '../../store/mode';
import api from '../../api/api';

export const useCartInitialization = () => {
  const { fetchCart, cartItems, loading } = useCartStore();
  const { fetchAddresses, addresses } = useAddressStore();
  const { selectedAddressId, setSelectedAddressId } = useCartUIStore();
  const { latitude, longitude } = useLocationStore();
  const selectedMode = useModeStore((s) => s.selectedMode);

  useEffect(() => {
    fetchCart(undefined, undefined, selectedMode?.id);
    fetchAddresses();
  }, [fetchCart, fetchAddresses, latitude, longitude, selectedMode?.id]);

  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      const def = addresses.find((a: any) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId, setSelectedAddressId]);

  return { loading, cartItems };
};

export const useCartCalculations = () => {
  const {
    cartItems,
    itemTotal: serverItemTotal,
    itemDiscountTotal: serverItemDiscountTotal,
    promoDiscountTotal: serverPromoDiscountTotal,
    discountTotal: serverDiscountTotal,
    cashbackTotal: serverCashbackTotal,
    finalItemTotal: serverFinalItemTotal,
    deliveryFee: serverDeliveryFee,
    platformFee: serverPlatformFee,
    gstOnPlatform: serverGstOnPlatform,
    packingFee: serverPackingFee,
    surcharge: serverSurcharge,
    appliedOffers,
    appliedPromoCode,
    promoCode,
  } = useCartStore();
  const { selectedTip } = useCartUIStore();
  const { data: walletData, refetch: refetchWallet } = useUserWallet();

  const walletBalance = parseToDecimal(walletData?.balance);

  const getSellingPrice = useCallback((item: CartItem | any): number => {
    return parseToDecimal(item?.product?.sellingPrice) || 0;
  }, []);

  const getDiscountedPrice = useCallback((item: CartItem | any): number => {
    if (item?.pricing?.finalPrice !== undefined) {
      return parseToDecimal(item.pricing.finalPrice);
    }
    return getSellingPrice(item);
  }, [getSellingPrice]);

  // 1. Item Total (Gross before discount)
  const itemTotal = serverItemTotal > 0
    ? serverItemTotal
    : cartItems.reduce((acc: number, item: any) => acc + getSellingPrice(item) * item.quantity, 0);

  // 2. Discounts
  const itemDiscountAmount = serverItemDiscountTotal || 0;
  const promoDiscountAmount = serverPromoDiscountTotal || 0;
  const discountAmount = serverDiscountTotal || (itemDiscountAmount + promoDiscountAmount);
  const cashbackAmount = serverCashbackTotal || 0;
  const finalItemTotal = serverFinalItemTotal > 0 ? serverFinalItemTotal : Math.max(0, itemTotal - discountAmount);

  // 3. Delivery Fee (Server-computed, 0 for Elite/Free delivery offers)
  const deliveryFee = serverDeliveryFee || 0;

  // 4. Platform Fee
  const platformFee = serverPlatformFee || (cartItems.length > 0 ? 10 : 0);

  // 5. GST on Platform Fee (18%)
  const gstOnPlatform = serverGstOnPlatform || (platformFee > 0 ? parseToDecimal(platformFee * 0.18) : 0);

  // 6. Packing Fee
  const packingFee = serverPackingFee || 0;

  // 7. Tip Amount
  const tipAmount = selectedTip || 0;

  // 8. Surcharge
  const surcharge = serverSurcharge || 0;

  // 9. Subtotal
  const subtotal = finalItemTotal;

  // 10. Grand Total
  const total = parseToDecimal(
    finalItemTotal +
    deliveryFee +
    platformFee +
    gstOnPlatform +
    packingFee +
    tipAmount +
    surcharge
  );

  // 11. Primary Wallet Deduction & Payable Total
  const walletDeduction = Math.min(walletBalance, total);
  const payableTotal = Math.max(0, parseToDecimal(total - walletDeduction));

  return {
    itemTotal,
    itemDiscountAmount,
    promoDiscountAmount,
    discountAmount,
    cashbackAmount,
    finalItemTotal,
    deliveryFee,
    platformFee,
    gstOnPlatform,
    packingFee,
    tipAmount,
    surcharge,
    subtotal,
    total,
    walletBalance,
    walletDeduction,
    payableTotal,
    appliedOffers,
    appliedPromoCode,
    promoCode,
    refetchWallet,
    getSellingPrice,
    getDiscountedPrice,
  };
};

export const useCartActions = () => {
  const { addToCart, clearCart } = useCartStore();
  const { showAlert } = useAlertStore();

  const updateCartItem = useCallback(
    async (item: CartItem | any, newQuantity: number) => {
      if (newQuantity === 0) {
        showAlert({
          title: 'Remove Item',
          message: 'Are you sure you want to remove this item from your cart?',
          confirmText: 'Remove',
          cancelText: 'Cancel',
          onConfirm: async () => {
            await addToCart(String(item.productId), 0, item.product);
          },
        });
        return;
      }
      await addToCart(String(item.productId), newQuantity, item.product);
    },
    [addToCart, showAlert],
  );

  const increaseQty = useCallback(
    (item: CartItem | any) => {
      updateCartItem(item, item.quantity + 1);
    },
    [updateCartItem],
  );

  const decreaseQty = useCallback(
    (item: CartItem | any) => {
      if (item.quantity >= 1) {
        updateCartItem(item, item.quantity - 1);
      }
    },
    [updateCartItem],
  );

  const handleClearCart = useCallback(() => {
    showAlert({
      title: 'Clear Cart',
      message: 'Are you sure you want to clear all items?',
      confirmText: 'Clear',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await clearCart();
      },
    });
  }, [clearCart, showAlert]);

  return {
    increaseQty,
    decreaseQty,
    handleClearCart,
    updateCartItem,
  };
};

export const useCheckoutLogic = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { cartItems } = useCartStore();
  const { addresses } = useAddressStore();
  const { selectedPaymentMethod } = usePaymentStore();
  const { showAlert } = useAlertStore();
  const { selectedAddressId, setShowAddressModal, setShowCheckoutPopup } =
    useCartUIStore();
  const { total, tipAmount, payableTotal } = useCartCalculations();
  const { mutate: placeOrder, isPending: isPlacingOrder } = usePlaceOrder();
  const { latitude, longitude } = useLocationStore();

  const {
    data: partnerCountData,
    isLoading: isPartnerCountLoading,
    refetch: refetchPartnerCount,
  } = useNearbyDeliveryPartnersCount({
    lat: latitude,
    lng: longitude,
  });

  const hasLocation =
    latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null;
  const onlineDeliveryPartnersCount =
    partnerCountData?.onlineDeliveryPartnersCount ?? 0;
  const noDeliveryPartnerAvailable =
    hasLocation && !isPartnerCountLoading && onlineDeliveryPartnersCount <= 1;

  const hasDefaultAddress = selectedAddressId
    ? addresses.find((addr: any) => addr.id === selectedAddressId)
    : addresses.find((addr: any) => addr.isDefault);

  const handleCheckout = useCallback(() => {
    if (noDeliveryPartnerAvailable) {
      showAlert({
        title: 'Delivery Partner Unavailable',
        message: `Currently only ${onlineDeliveryPartnersCount} online delivery partner(s) available in your area. More than 1 required to place an order.`,
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: () => {},
      });
      return;
    }
    if (cartItems.length === 0) {
      showAlert({
        title: 'Empty Cart',
        message: 'Your cart is empty. Add some items to proceed.',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: () => {},
      });
      return;
    }
    if (!hasDefaultAddress) {
      showAlert({
        title: 'No Address',
        message: 'Please select a delivery address to proceed.',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: () => {},
      });
      setShowAddressModal(true);
      return;
    }
    if (payableTotal > 0 && !selectedPaymentMethod) {
      showAlert({
        title: 'Payment Method',
        message: 'Please select a payment method to proceed for the remaining balance.',
        confirmText: 'Select',
        cancelText: 'Cancel',
        onConfirm: () => navigation.navigate('PaymentMethod'),
      });
      return;
    }
    setShowCheckoutPopup(true);
  }, [
    noDeliveryPartnerAvailable,
    cartItems.length,
    hasDefaultAddress,
    payableTotal,
    selectedPaymentMethod,
    showAlert,
    navigation,
    setShowAddressModal,
    setShowCheckoutPopup,
  ]);

  const handleConfirmPayment = useCallback(async () => {
    if (noDeliveryPartnerAvailable) {
      setShowCheckoutPopup(false);
      showAlert({
        title: 'Delivery Partner Unavailable',
        message: `Currently only ${onlineDeliveryPartnersCount} online delivery partner(s) available in your area. More than 1 required to place an order.`,
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: () => {},
      });
      return;
    }

    setShowCheckoutPopup(false);

    // Build order data (shared for all payment methods)
    const cartState = useCartStore.getState();
    const currentModeId = useModeStore.getState().selectedMode?.id;
    const orderData = {
      addressId: String(selectedAddressId || hasDefaultAddress?.id),
      modeId: currentModeId ? String(currentModeId) : undefined,
      items: cartItems.map((item: any) => ({
        productId: String(item.product.id),
        quantity: item.quantity,
        notes: item.notes || null,
      })),
      tipAmount: tipAmount,
      promoCode: cartState.appliedPromoCode || undefined,
      promoCodes: cartState.appliedPromoCodes?.length ? cartState.appliedPromoCodes : undefined,
      offerId: cartState.selectedOfferId || undefined,
      offerIds: cartState.selectedOfferIds?.length ? cartState.selectedOfferIds : undefined,
      notes: null,
      source: OrderSource.APP,
    };

    // Check if fully covered by wallet OR explicitly wallet selected
    if (payableTotal === 0 || selectedPaymentMethod?.type === 'wallet') {
      // 🚀 Place order via backend for Wallet Payment
      placeOrder(
        { ...orderData, paymentMethod: PaymentMethod.WALLET },
        {
          onSuccess: res => {
            if (res.success) {
              useCartStore.getState().clearCart();
              navigation.navigate('OrderPlaced', {
                orderId: String(res.data.id),
                orderNumber: res.data.orderNumber,
              } as never);
            }
          },
        },
      );
      return;
    } else if (selectedPaymentMethod?.type === 'cod') {
      // 🚀 Place order via backend for Cash on Delivery
      placeOrder(
        { ...orderData, paymentMethod: PaymentMethod.COD },
        {
          onSuccess: res => {
            if (res.success) {
              useCartStore.getState().clearCart();
              navigation.navigate('OrderPlaced', {
                orderId: String(res.data.id),
                orderNumber: res.data.orderNumber,
              } as never);
            }
          },
        },
      );
      return;
    } else if (selectedPaymentMethod?.id === 'phonepe') {
      // 📱 PhonePe Payment — unified flow via place-order
      try {
        // 1. Initialize PhonePe SDK
        await PhonePePaymentSDK.init(
          PHONEPE_CONFIG.ENVIRONMENT,
          PHONEPE_CONFIG.MERCHANT_ID,
          PHONEPE_CONFIG.FLOW_ID,
          PHONEPE_CONFIG.ENABLE_LOGGING,
        );

        // 2. Place order via backend (returns PhonePe token)
        const response = await api.post('/order/place-order', {
          ...orderData,
          paymentMethod: PaymentMethod.PHONEPE,
        });

        const result = response.data;

        if (!result.success) {
          throw new Error(result.message || 'Failed to create order');
        }

        const phonePeData = result.data?.phonePe;
        const order = result.data?.order;

        if (!phonePeData?.token) {
          throw new Error('Failed to get PhonePe payment token');
        }

        // 3. Prepare payload for SDK
        const payload = {
          merchantId: PHONEPE_CONFIG.MERCHANT_ID,
          orderId: phonePeData.merchantOrderId,
          token: phonePeData.token,
          paymentMode: {
            type: 'PAY_PAGE',
          },
        };

        const requestBody = JSON.stringify(payload);

        // 4. Start PhonePe Payment
        const sdkResult = await PhonePePaymentSDK.startTransaction(
          requestBody,
          null,
        );
        console.log({ sdkResult });

        if (sdkResult?.status === 'SUCCESS') {
          // 5. Verify payment on backend
          const verifyRes = await api.post('/order/phonepe/verify-payment', {
            merchantOrderId: phonePeData.merchantOrderId,
          });
          const verifyData = verifyRes.data;

          if (verifyData.success && verifyData.data?.success) {
            useCartStore.getState().clearCart();
            navigation.navigate('OrderPlaced', {
              orderId: String(order?.id),
              orderNumber: order?.orderNumber,
            } as never);
          } else {
            Alert.alert(
              'Payment Verification Failed',
              'Please contact support if amount was deducted.',
            );
          }
        } else if (sdkResult?.status === 'FAILED') {
          Alert.alert(
            'Payment Failed',
            'Your payment could not be processed. Please try again.',
          );
        } else if (sdkResult?.status === 'CANCELLED') {
          Alert.alert(
            'Payment Cancelled',
            'You cancelled the payment. Your order is saved — you can retry payment.',
          );
        }
      } catch (error: any) {
        ErrorMessage(error);
      }
    } else if (selectedPaymentMethod?.type === 'razorpay') {
      
    } else {
      // For UPI and others, use the payment handler
      const paymentInitiated = await handlePaymentUtil(total.toString());

      if (paymentInitiated) {
        // Wait a bit to ensure the payment app has time to open so the navigation doesn't feel simultaneous
        setTimeout(() => {
          navigation.navigate('OrderPlaced');
        }, 3000);
      }
    }
  }, [
    noDeliveryPartnerAvailable,
    showAlert,
    setShowCheckoutPopup,
    total,
    navigation,
    selectedPaymentMethod,
    selectedAddressId,
    hasDefaultAddress,
    cartItems,
    tipAmount,
    placeOrder,
  ]);

  return {
    handleCheckout,
    handleConfirmPayment,
    isPlacingOrder,
    noDeliveryPartnerAvailable,
    onlineDeliveryPartnersCount,
    isPartnerCountLoading,
    refetchPartnerCount,
  };
};
