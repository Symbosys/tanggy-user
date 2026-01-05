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

  // 2. GST on Item Total (assuming 5% is additive for now based on previous logic, or if included back-calc)
  // Previous logic: itemTotal * 0.05. Let's keep it.
  const gstOnItemTotal = itemTotal * 0.05;

  // 3. Delivery Fee
  const standardDeliveryFee = 40;
  const deliveryFee = isElite ? 0 : standardDeliveryFee;

  // 4. Platform Fee & GST
  const platformFee = 3; // Example small fee
  const gstOnPlatform = platformFee * 0.18;

  // 5. Packing Fee & GST
  const packingFee = 10;
  const gstOnPackingFee = packingFee * 0.18;

  // 6. Tip Amount
  const tipAmount = selectedTip || 0;

  // 7. Surcharge
  const surcharge = 0;

  // 8. Discount
  const discountAmount = 0;

  // 9. Total GST Tax Amount (Sum of all GST components)
  // Note: gstOnDeliveryFee is implicitly 18% of deliveryFee usually? 
  // Previous code had: (deliveryFee + packingFee) * 0.18. 
  // So let's add gstOnDelivery implicitly for the total calc.
  // The schema doesn't explicitly list `gstOnDeliveryFee` but standard usually has it.
  // The user prompt lists `deliveryFee` then `platformFee`+`gst`, `packingFee`+`gst`.
  // It didn't explicitly say `gstOnDeliveryFee` but it's legally required usually.
  // However, I will follow the user schema "like this according to my db".
  // The DB schema snippet HAS `deliveryFee` but NO `gstOnDeliveryFee` field shown in that small snippet?
  // Wait, let's look closely at the snippet:
  // deliveryFee Decimal ...
  // platformFee ... gstOnPlatform ...
  // packingFee ... gstOnPackingFee ...
  // It MISSES gstOnDeliveryFee in the snippet. This might mean delivery fee is inclusive or untaxed? 
  // or just omitted in the snippet.
  // BUT the previous code had `(deliveryFee + packingFee) * 0.18`.
  // I will assume delivery fee is taxable to be safe, but separate the variable.
  // Actually, let's stick to the generated fields in the return object so the UI can decide.
  
  // Let's assume GST on Delivery is standard 18%
  // User requested to remove GST on delivery fee
  const gstOnDeliveryFee = 0;

  const totalGstAmount = gstOnItemTotal + gstOnPlatform + gstOnPackingFee + gstOnDeliveryFee;

  // 10. Subtotal (Before Tax? Or Item total?)
  // User Prompt: "subtotal Decimal" at the end. 
  // Usually in apps "Subtotal" = Item Total. 
  // Let's alias itemTotal as subtotal for display if needed, but the DB field `subtotal` often stores the pre-tax total of items.
  const subtotal = itemTotal; 
  
  // 11. Paid Amount / Grand Total
  const total = 
    itemTotal + 
    gstOnItemTotal + 
    deliveryFee + gstOnDeliveryFee + // Including tax on delivery 
    platformFee + gstOnPlatform + 
    packingFee + gstOnPackingFee + 
    tipAmount + 
    surcharge - 
    discountAmount;

  return {
    itemTotal,
    gstOnItemTotal,
    deliveryFee,
    gstOnDeliveryFee, // Added for completeness even if not in snippet explicitly, it's needed for math
    platformFee,
    gstOnPlatform,
    packingFee,
    gstOnPackingFee,
    tipAmount,
    surcharge,
    discountAmount,
    totalGstAmount, // For the tax popup total
    subtotal,
    total,          // paidAmount
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
