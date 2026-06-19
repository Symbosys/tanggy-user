import { useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../../store/cart';
import { useCartUIStore } from './store';
import { useAddressStore } from '../../store/address';
import { usePaymentStore } from '../../store/payment';
import { parseToDecimal, handlePayment as handlePaymentUtil } from '../../utils/utils';
import { useAlertStore } from '../../store/alert.store';
import { CartItem } from './types';
import { RootStackParamList } from '../../types/type';
import { NavigationProp } from '@react-navigation/native';
import PhonePePaymentSDK from 'react-native-phonepe-pg';
import { PHONEPE_CONFIG } from '../../constants/phonepay';
import { Alert } from 'react-native';
import api from '../../api/api';
import { usePlaceOrder } from '../../api/hooks/useOrder';
import { OrderSource, PaymentMethod } from '../../types/order.type';

export const useCartInitialization = () => {
  const { fetchCart, cartItems, loading } = useCartStore();
  const { fetchAddresses, addresses } = useAddressStore();
  const { selectedAddressId, setSelectedAddressId } = useCartUIStore();

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, [fetchCart, fetchAddresses]);

  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      const def = addresses.find((a: any) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId, setSelectedAddressId]);

  return { loading, cartItems };
};


export const useCartCalculations = () => {
  const { cartItems } = useCartStore();
  const { selectedTip } = useCartUIStore();
  
  const getSellingPrice = useCallback((item: CartItem | any): number => {
    return parseToDecimal(item?.product?.sellingPrice) || 0;
  }, []);

  // 1. Item Total
  const itemTotal = cartItems.reduce(
    (acc: number, item: any) => acc + getSellingPrice(item) * item.quantity,
    0
  );

  // 2. Delivery Fee (No GST on raw chicken products as per Indian govt)
  const standardDeliveryFee = 40;
  const deliveryFee = standardDeliveryFee;

  // 3. Platform Fee (No GST)
  const platformFee = 3;

  // 4. Packing Fee (No GST)
  const packingFee = 10;

  // 5. Tip Amount
  const tipAmount = selectedTip || 0;

  // 6. Surcharge
  const surcharge = 0;

  // 7. Discount
  const discountAmount = 0;

  // 8. Subtotal
  const subtotal = itemTotal; 
  
  // 9. Grand Total (No GST/Tax for raw chicken as per Indian govt)
  const total = 
    itemTotal + 
    deliveryFee + 
    platformFee + 
    packingFee + 
    tipAmount + 
    surcharge - 
    discountAmount;

  return {
    itemTotal,
    deliveryFee,
    platformFee,
    packingFee,
    tipAmount,
    surcharge,
    discountAmount,
    subtotal,
    total,
    getSellingPrice,
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
            await addToCart(String(item.productId), 0);
          },
        });
        return;
      }
      await addToCart(String(item.productId), newQuantity);
    },
    [addToCart, showAlert]
  );

  const increaseQty = useCallback(
    (item: CartItem | any) => {
      updateCartItem(item, item.quantity + 1);
    },
    [updateCartItem]
  );

  const decreaseQty = useCallback(
    (item: CartItem | any) => {
      if (item.quantity >= 1) {
        updateCartItem(item, item.quantity - 1);
      }
    },
    [updateCartItem]
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
  const navigation = useNavigation<NavigationProp<RootStackParamList >>();
  const { cartItems } = useCartStore();
  const { addresses } = useAddressStore();
  const { selectedPaymentMethod } = usePaymentStore();
  const { showAlert } = useAlertStore();
  const { 
    selectedAddressId, 
    setShowAddressModal, 
    setShowCheckoutPopup 
  } = useCartUIStore();
  const { total, tipAmount } = useCartCalculations();
  const { mutate: placeOrder, isPending: isPlacingOrder } = usePlaceOrder();

  const hasDefaultAddress = selectedAddressId
    ? addresses.find((addr: any) => addr.id === selectedAddressId)
    : addresses.find((addr: any) => addr.isDefault);

  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      showAlert({
        title: 'Empty Cart',
        message: 'Your cart is empty. Add some items to proceed.',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: () => { },
      });
      return;
    }
    if (!hasDefaultAddress) {
      showAlert({
        title: 'No Address',
        message: 'Please select a delivery address to proceed.',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: () => { },
      });
      setShowAddressModal(true);
      return;
    }
    if (!selectedPaymentMethod) {
      showAlert({
        title: 'Payment Method',
        message: 'Please select a payment method to proceed.',
        confirmText: 'Select',
        cancelText: 'Cancel',
        onConfirm: () => navigation.navigate('PaymentMethod'),
      });
      return;
    }
    setShowCheckoutPopup(true);
  }, [
    cartItems.length, 
    hasDefaultAddress, 
    selectedPaymentMethod, 
    showAlert, 
    navigation, 
    setShowAddressModal, 
    setShowCheckoutPopup
  ]);

  const handleConfirmPayment = useCallback(async () => {
    setShowCheckoutPopup(false);
    
    // Check payment method type
    if (selectedPaymentMethod?.type === 'cod') {
      // 🚀 Place order via backend for Cash on Delivery
      const orderData = {
        addressId: String(selectedAddressId || hasDefaultAddress?.id),
        items: cartItems.map((item: any) => ({
          productId: String(item.product.id),
          quantity: item.quantity,
          notes: item.notes || null,
        })),
        tipAmount: tipAmount,
        paymentMethod: PaymentMethod.COD,
        source: OrderSource.APP,
        notes: null,
      };

      placeOrder(orderData, {
        onSuccess: (res) => {
          if (res.success) {
            navigation.navigate('OrderPlaced', { orderId: String(res.data.id), orderNumber: res.data.orderNumber } as never);
          }
        },
      });
      return;
    } else if (selectedPaymentMethod?.id === 'phonepe') {
      // PhonePe Payment Logic
      try {
        // 1. Initialize SDK
        await PhonePePaymentSDK.init(
          PHONEPE_CONFIG.ENVIRONMENT,
          PHONEPE_CONFIG.MERCHANT_ID,
          PHONEPE_CONFIG.FLOW_ID,
          PHONEPE_CONFIG.ENABLE_LOGGING
        );

        // 2. Call Backend to Create Order
        // Note: Amount is in Paise (INR * 100)
        const response = await api.post('/order/phonepe/create-order', {
          amount: Math.round(1 * 100), // Convert to paise
          userId: 'user_minta_fresh', // Placeholder as used before
        });

        const result = response.data;
        const paymentData = result.data;

        if (!result.success || !paymentData || !paymentData.token) {
          throw new Error(result.message || 'Failed to get payment token');
        }

        // 3. Prepare payload for SDK
        const payload = {
          merchantId: PHONEPE_CONFIG.MERCHANT_ID,
          orderId: paymentData.merchantOrderId,
          token: paymentData.token,
          paymentMode: {
            type: 'PAY_PAGE',
          },
        };

        const requestBody = JSON.stringify(payload);

        // 4. Start PhonePe Payment
        const sdkResult = await PhonePePaymentSDK.startTransaction(
          requestBody,
          null
        );

        if (sdkResult?.status === 'SUCCESS') {
          // Verify on backend
          const verifyRes = await api.post('/order/phonepe/verify-payment', {
            merchantOrderId: paymentData.merchantOrderId,
          });
          const verifyStatus = verifyRes.data;
          if (verifyStatus.success) {
            navigation.navigate('OrderPlaced');
          } else {
            Alert.alert('Payment Verification Failed', 'Please contact support if amount was deducted.');
          }
        } else if (sdkResult?.status === 'FAILED') {
          Alert.alert('Payment Failed');
        } else if (sdkResult?.status === 'CANCELLED') {
          Alert.alert('Payment Cancelled');
        }
      } catch (error: any) {
        Alert.alert('Payment Error', error.message || 'Something went wrong');
      }
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
  };
};
