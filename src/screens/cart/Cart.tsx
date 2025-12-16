import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCartStore } from '../../store/cart';
import { useAddressStore } from '../../store/address';
import { parseToDecimal } from '../../utils/utils';
import { COLORS } from '../../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppNavigation } from '../../types/type';
import { useAlertStore } from '../../store/alert.store';

const Cart = ({ navigation }: AppNavigation) => {
  const { fetchCart, cartItems, addToCart, clearCart, totalItems, subtotal, loading } = useCartStore();
  const { fetchAddresses, addresses } = useAddressStore();
  const [showPriceBreakdown, setShowPriceBreakdown] = useState<boolean>(true);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const animatedHeight = useState(new Animated.Value(300))[0];

  const tipOptions = [0, 5, 10, 15, 20, 30];
  useEffect(() => {
    fetchCart();
    fetchAddresses();
    console.log('cartItems', cartItems);
  }, [fetchCart, fetchAddresses]);

  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      const def = addresses.find((a: any) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }
  const defaultAddress = selectedAddressId
    ? addresses.find((addr: any) => addr.id === selectedAddressId)
    : addresses.find((addr: any) => addr.isDefault);
  const hasDefaultAddress = !!defaultAddress;
  const getAddressTypeEmoji = (type: string): string => {
    switch (type.toUpperCase()) {
      case 'HOME':
        return '🏠';
      case 'WORK':
        return '🏢';
      case 'OTHER':
        return '📍';
      default:
        return '📍';
    }
  };
  const updateCartItem = async (item: any, newQuantity: number) => {
    if (newQuantity === 0) {
      Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await addToCart(String(item.productId), 0);
          },
        },
      ]);
      return;
    }
    await addToCart(String(item.productId), newQuantity);
  };
  const increaseQty = (item: any) => {
    updateCartItem(item, item.quantity + 1);
  };
  const decreaseQty = (item: any) => {
    if (item.quantity > 1) {
      updateCartItem(item, item.quantity - 1);
    }
  };
  const getSellingPrice = (item: any): number => {
    return parseToDecimal(item?.product?.sellingPrice?.d?.[0] || 0);
  };
  const itemTotal: number = cartItems.reduce(
    (acc: number, item: any) => acc + getSellingPrice(item) * item.quantity,
    0
  );
  const deliveryFee = 20;
  const gstCharges = 21.57;
  const calculateTotal = (): string => (itemTotal + deliveryFee + gstCharges + (selectedTip || 0)).toFixed(0);
  const togglePriceBreakdown = () => {
    const newShow = !showPriceBreakdown;
    setShowPriceBreakdown(newShow);
    Animated.timing(animatedHeight, {
      toValue: newShow ? 300 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add some items to proceed.');
      return;
    }
    if (!hasDefaultAddress) {
      Alert.alert('No Address', 'Please select a delivery address to proceed.');
      setShowAddressModal(true);
      return;
    }
    Alert.alert('Checkout', `Proceed to checkout for ₹${calculateTotal()}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Checkout', onPress: () => navigation.navigate('OrderPlaced') },
    ]);
  };
  const {showAlert} = useAlertStore()
  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    showAlert({
      title: 'Clear Carts',
      message: 'Are you sure you want to clear all itemsss?',
      confirmText: 'Clear',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await clearCart();
      },
    })
  };
  const handleSelectAddress = (addressId: number) => {
    setSelectedAddressId(addressId);
    setShowAddressModal(false);
  };
  const handleAddAddress = () => {
    navigation.navigate("AddAddress")
    setShowAddressModal(false);
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <View style={styles.cartIconContainer}>
            <Icon name="shopping-bag" size={18} color={COLORS.white} />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
            )}
          </View>
          <View>
            <Text style={styles.headerTitle}>My Cart</Text>
            <Text style={styles.headerSubtitle}>{totalItems} items</Text>
          </View>
        </View>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
            <Icon name="delete-outline" size={18} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <View style={styles.emptyCartIcon}>
              <Icon name="shopping-cart" size={48} color={COLORS.accent} />
            </View>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubText}>Add items to get started</Text>
          </View>
        ) : (
          cartItems.map((item, index) => (
            <View key={item.id} style={[styles.cartItemCard, { marginTop: index === 0 ? 12 : 8 }]}>
              <View style={styles.cartItemHeader}>
                <View style={styles.itemLeft}>
                  <View style={styles.productImageContainer}>
                    <Image
                      source={{
                        uri: 'https://via.placeholder.com/80x80/8719C6/FFFFFF?text=Product',
                      }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.product.name}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.discountedPrice}>₹{getSellingPrice(item)}</Text>
                    </View>
                  </View>
                </View>
              </View>
              {/* Quantity Controls and Subtotal */}
              <View style={styles.itemFooter}>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[styles.quantityButton, item.quantity <= 1 && styles.disabledQuantityButton]}
                    onPress={() => decreaseQty(item)}
                    disabled={item.quantity <= 1}
                  >
                    <Icon name="remove" size={16} color={item.quantity <= 1 ? COLORS.muted : COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.quantityButton} onPress={() => increaseQty(item)}>
                    <Icon name="add" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.itemSubtotalContainer}>
                  <Text style={styles.itemSubtotalLabel}>Total</Text>
                  <Text style={styles.itemSubtotalText}>
                    ₹{(getSellingPrice(item) * item.quantity).toFixed(0)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
        {/* Address Section */}
        {itemTotal > 0 && (
          <TouchableOpacity style={styles.addressSection} onPress={() => setShowAddressModal(true)}>
            <View style={styles.addressIconContainer}>
              <Icon name="location-on" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>Delivery Address</Text>
              {defaultAddress ? (
                <Text style={styles.addressText} numberOfLines={2}>
                  {getAddressTypeEmoji(defaultAddress.type)} {defaultAddress.type} • {defaultAddress.receiverName}
                </Text>
              ) : (
                <Text style={[styles.addressText, { color: COLORS.muted }]}>Tap to select address</Text>
              )}
            </View>
            <Icon name="chevron-right" size={20} color={COLORS.accent} />
          </TouchableOpacity>
        )}
        {/* Tip Section */}
        {itemTotal > 0 && (
          <View style={styles.tipSection}>
            <View style={styles.tipHeader}>
              <View style={styles.tipIconContainer}>
                <Text style={styles.tipEmoji}>💝</Text>
              </View>
              <View style={styles.tipHeaderText}>
                <Text style={styles.tipTitle}>Tip your delivery partner</Text>
                <Text style={styles.tipSubtitle}>Thank them for their service</Text>
              </View>
            </View>
            <View style={styles.tipOptions}>
              {tipOptions.map((tip) => (
                <TouchableOpacity
                  key={tip}
                  style={[
                    styles.tipButton,
                    selectedTip === tip && styles.tipButtonSelected,
                  ]}
                  onPress={() => setSelectedTip(tip)}
                >
                  <Text
                    style={[
                      styles.tipButtonText,
                      selectedTip === tip && styles.tipButtonTextSelected,
                    ]}
                  >
                    ₹{tip}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {/* Price Breakdown */}
        {itemTotal > 0 && (
          <View style={styles.priceCard}>
            <TouchableOpacity style={styles.priceHeader} onPress={togglePriceBreakdown} activeOpacity={0.7}>
              <View style={styles.priceLeft}>
                <View style={styles.billIcon}>
                  <Icon name="receipt-long" size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.toPayLabel}>Bill Details</Text>
              </View>
              <Icon
                name={showPriceBreakdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={20}
                color={COLORS.accent}
              />
            </TouchableOpacity>
            <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
              <View style={styles.priceBreakdown}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Item Total</Text>
                  <Text style={styles.finalPrice}>₹{itemTotal.toFixed(0)}</Text>
                </View>
                <Text style={styles.sectionHeader}>Delivery Charges</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Delivery Fee</Text>
                  <Text style={styles.finalPrice}>₹{deliveryFee}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>GST & Charges</Text>
                  <Text style={styles.finalPrice}>₹{gstCharges.toFixed(2)}</Text>
                </View>
                {selectedTip && selectedTip > 0 && (
                  <>
                    <Text style={styles.sectionHeader}>Tip to Delivery Partner</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Delivery Tip</Text>
                      <Text style={styles.finalPrice}>₹{selectedTip}</Text>
                    </View>
                  </>
                )}
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalAmount}>₹{calculateTotal()}</Text>
                </View>
              </View>
            </Animated.View>
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
      {/* Address Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Address</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(false)} style={styles.modalCloseButton}>
              <Icon name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {addresses.length === 0 ? (
              <View style={styles.noAddressContainer}>
                <View style={styles.noAddressIcon}>
                  <Icon name="location-off" size={40} color={COLORS.accent} />
                </View>
                <Text style={styles.noAddressText}>No addresses saved</Text>
                <Text style={styles.noAddressSubText}>Add a delivery address to continue</Text>
              </View>
            ) : (
              addresses.map((addr: any) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.addressItem,
                    selectedAddressId === addr.id && styles.addressItemDefault,
                  ]}
                  onPress={() => handleSelectAddress(addr.id)}
                >
                  <View style={styles.addressItemLeft}>
                    <View style={styles.addressItemIcon}>
                      <Icon name="location-on" size={18} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.addressItemHeader}>
                        <Text style={styles.addressItemType}>
                          {getAddressTypeEmoji(addr.type)} {addr.type}
                        </Text>
                        {addr.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.addressItemName}>{addr.receiverName}</Text>
                      <Text style={styles.addressItemDetail} numberOfLines={2}>
                        {addr.completeAddress}
                      </Text>
                      {addr.city && <Text style={styles.addressItemDetail}>{addr.city}</Text>}
                      {addr.landMark && <Text style={styles.addressItemDetail}>{addr.landMark}</Text>}
                      {addr.floor && <Text style={styles.addressItemDetail}>{addr.floor}</Text>}
                      {addr.instructions && <Text style={styles.addressItemDetail}>{addr.instructions}</Text>}
                      <Text style={styles.addressItemContact}>{addr.receiverContact}</Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={18} color={COLORS.accent} />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.addAddressButton} onPress={handleAddAddress}>
              <Icon name="add-location" size={18} color={COLORS.white} />
              <Text style={styles.addAddressText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
      {/* Bottom Button */}
      {itemTotal > 0 && (
        <View style={styles.bottomButtonContainer}>
          {hasDefaultAddress ? (
            <TouchableOpacity style={styles.bottomButton} onPress={handleCheckout}>
              <View style={styles.bottomButtonContent}>
                <View>
                  <Text style={styles.bottomButtonLabel}>Total Amount</Text>
                  <Text style={styles.bottomButtonAmount}>₹{calculateTotal()}</Text>
                </View>
                <View style={styles.bottomButtonRight}>
                  <Text style={styles.bottomButtonText}>Checkout</Text>
                  <Icon name="arrow-forward" size={18} color={COLORS.white} />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.bottomButton, styles.selectAddressButton]}
              onPress={() => setShowAddressModal(true)}
            >
              <Icon name="location-on" size={18} color={COLORS.white} />
              <Text style={styles.bottomButtonText}>Select Address</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 8,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
    marginRight: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: COLORS.highlight,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyCartIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  cartItemCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cartItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  productImageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.secondary,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  productImage: {
    width: 64,
    height: 64,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 18,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    padding: 3,
  },
  quantityButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  disabledQuantityButton: {
    opacity: 0.4,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: 12,
    minWidth: 32,
    textAlign: 'center',
  },
  itemSubtotalContainer: {
    alignItems: 'flex-end',
  },
  itemSubtotalLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 1,
    fontWeight: '500',
  },
  itemSubtotalText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 3,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  tipSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipHeaderText: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  tipSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tipOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  tipButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tipButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tipButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  tipButtonTextSelected: {
    color: COLORS.white,
  },
  priceCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  billIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toPayLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  priceBreakdown: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  finalPrice: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  bottomPadding: {
    height: 100,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
    backgroundColor: 'rgba(248,249,250,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  bottomButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bottomButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomButtonLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
    fontWeight: '500',
  },
  bottomButtonAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  bottomButtonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollView: {
    flex: 1,
    paddingTop: 12,
  },
  noAddressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  noAddressIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  noAddressText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  noAddressSubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    gap: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  addressItemDefault: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(135, 25, 198, 0.03)',
  },
  addressItemLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 10,
  },
  addressItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressItemType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  addressItemName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  addressItemDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 1,
  },
  addressItemContact: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  defaultBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  modalFooter: {
    padding: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 6,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addAddressText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default Cart;