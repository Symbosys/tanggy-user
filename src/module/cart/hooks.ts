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
import { useEliteMembership } from '../../api/hooks/elite_membership';

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
  
  // Elite Membership Check
  const { data: eliteData } = useEliteMembership();
  const isElite = eliteData?.data?.status === 'ACTIVE';

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
  const deliveryFee = isElite ? 0 : standardDeliveryFee;

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
    isElite,
    standardDeliveryFee,
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
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { cartItems } = useCartStore();
  const { addresses } = useAddressStore();
  const { selectedPaymentMethod } = usePaymentStore();
  const { showAlert } = useAlertStore();
  const { 
    selectedAddressId, 
    setShowAddressModal, 
    setShowCheckoutPopup 
  } = useCartUIStore();
  const { total } = useCartCalculations();

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
        // Direct order placement for Cash on Delivery
        navigation.navigate('OrderPlaced');
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
  }, [setShowCheckoutPopup, total, navigation, selectedPaymentMethod]);

  return {
    handleCheckout,
    handleConfirmPayment,
  };
};
