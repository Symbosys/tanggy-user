import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useCartStore } from '../../store/cart';
import { useAddressStore } from '../../store/address';
import { AppNavigation } from '../../types/type';
import { parseToDecimal } from '../../utils/utils';

const { width: screenWidth } = Dimensions.get('window');

const CartScreen = ({ navigation }: AppNavigation) => {
  const { fetchCart, cartItems, addToCart, clearCart, totalItems, loading } = useCartStore();
  const { fetchAddresses, addresses } = useAddressStore();
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, [fetchCart, fetchAddresses]);

  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === null) {
      const def = addresses.find((a: any) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const defaultAddress = selectedAddressId
    ? addresses.find((addr: any) => addr.id === selectedAddressId)
    : addresses.find((addr: any) => addr.isDefault);
  const hasDefaultAddress = !!defaultAddress;
  const addressText = defaultAddress
    ? `${defaultAddress.completeAddress}, ${defaultAddress.city || ''}${defaultAddress.landMark ? `, ${defaultAddress.landMark}` : ''}`
    : 'Select delivery address';

  const getSellingPrice = (item: any): number => {
    return parseToDecimal(item?.product?.sellingPrice) || 0;
  };

  const itemTotal = cartItems.reduce((acc: number, item: any) => acc + getSellingPrice(item) * item.quantity, 0);

  const deliveryFee = 40;
  const tipAmount = selectedTip || 0;
  const calculateTotal = (): number => itemTotal + deliveryFee + tipAmount;

  const updateCartItem = async (item: any, newQuantity: number) => {
    if (newQuantity === 0) {
      Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await addToCart(Number(item.productId), 0);
          },
        },
      ]);
      return;
    }
    await addToCart(Number(item.productId), newQuantity);
  };

  const increaseQty = (item: any) => {
    updateCartItem(item, item.quantity + 1);
  };

  const decreaseQty = (item: any) => {
    if (item.quantity > 1) {
      updateCartItem(item, item.quantity - 1);
    }
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    Alert.alert('Clear Cart', 'Are you sure you want to clear all items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearCart();
        },
      },
    ]);
  };

  const handleTipSelect = (tip: number) => {
    setSelectedTip(tip);
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
    Alert.alert('Checkout', `Proceed to checkout for ₹${calculateTotal().toFixed(2)}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Checkout', onPress: () => navigation.navigate('OrderPlaced') },
    ]);
  };

  const handleSelectAddress = (addressId: number) => {
    setSelectedAddressId(addressId);
    setShowAddressModal(false);
  };

  const handleAddAddress = () => {
    navigation.navigate('AddAddress');
    setShowAddressModal(false);
  };

  const getAddressDisplay = (addr: any): string => {
    return `${addr.completeAddress || ''}${addr.city ? `, ${addr.city}` : ''}${addr.landMark ? `, ${addr.landMark}` : ''}`;
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.main} contentContainerStyle={styles.emptyContent}>
          <View style={styles.emptyContainer}>
            <MaterialIcons name="shopping-cart" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>Add items to get started</Text>
          </View>
        </ScrollView>
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
        {/* Header Section */}
        <View style={styles.header}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={styles.headerGradient}
          />
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Cart</Text>
            {cartItems.length > 0 && (
              <TouchableOpacity style={styles.iconButton} onPress={handleClearCart}>
                <MaterialIcons name="delete-sweep" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Cart Items List */}
        <View style={styles.itemsList}>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemContent}>
                <ImageBackground
                  source={{
                    uri: item.product.images[0]?.image.url || 'https://via.placeholder.com/64x64?text=Product',
                  }}
                  style={styles.itemImage}
                  imageStyle={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  {/* <Text style={styles.itemDesc} numberOfLines={2}>
                    {item.product.description || 'Standard pack'}
                  </Text> */}
                  <Text style={styles.itemPrice}>₹{getSellingPrice(item).toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[styles.quantityButton, item.quantity <= 1 && styles.disabledQuantityButton]}
                  onPress={() => decreaseQty(item)}
                  disabled={item.quantity <= 1}
                >
                  <Text style={[styles.quantityIcon, item.quantity <= 1 && { opacity: 0.5 }]}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={item.quantity.toString()}
                  keyboardType="numeric"
                  selectTextOnFocus={false}
                  editable={false}
                />
                <TouchableOpacity style={styles.quantityButton} onPress={() => increaseQty(item)}>
                  <Text style={styles.quantityIcon}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Tip Section */}
        <View style={styles.tipSection}>
          <LinearGradient
            colors={[`${COLORS.secondary}20`, COLORS.white]}
            style={styles.tipCard}
          >
            <Text style={styles.tipTitle}>Tip your delivery partner</Text>
            <Text style={styles.tipDesc}>100% of the tip goes to your delivery partner.</Text>
            <View style={styles.tipButtons}>
              {[10, 20, 30, 40, 50].map((tip) => (
                <TouchableOpacity
                  key={tip}
                  style={[
                    styles.tipButtonUnselected,
                    selectedTip === tip && styles.tipButtonSelected,
                  ]}
                  onPress={() => handleTipSelect(tip)}
                >
                  <Text style={[styles.tipButtonText, selectedTip === tip && styles.tipButtonSelectedText]}>
                    ₹{tip}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Delivery Address Section */}
        <View style={styles.addressSection}>
          <TouchableOpacity style={styles.addressCard} onPress={() => setShowAddressModal(true)}>
            <View style={styles.addressContent}>
              <Text style={styles.addressTitle}>Delivery Address</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {addressText}
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Subtotal Summary */}
        <View style={styles.subtotalSection}>
          <View style={styles.subtotalCard}>
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalValue}>₹{itemTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Delivery Fee</Text>
              <Text style={styles.subtotalValue}>₹{deliveryFee.toFixed(2)}</Text>
            </View>
            {tipAmount > 0 && (
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Tip</Text>
                <Text style={styles.subtotalValue}>₹{tipAmount.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.dashedBorder} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                style={styles.gradientTextContainer}
              >
                <Text style={styles.gradientText}>₹{calculateTotal().toFixed(2)}</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
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
            <Text style={styles.modalTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(false)} style={styles.modalCloseButton}>
              <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {addresses.length === 0 ? (
              <View style={styles.noAddressContainer}>
                <MaterialIcons name="location-off" size={64} color={COLORS.textSecondary} />
                <Text style={styles.noAddressTitle}>No addresses saved</Text>
                <Text style={styles.noAddressSubtitle}>Add a delivery address to continue</Text>
              </View>
            ) : (
              addresses.map((addr: any) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.addressItem,
                    selectedAddressId === addr.id && styles.addressItemSelected,
                  ]}
                  onPress={() => handleSelectAddress(addr.id)}
                >
                  <View style={styles.addressItemContent}>
                    <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
                    <View style={styles.addressItemDetails}>
                      <Text style={styles.addressItemName}>{addr.receiverName}</Text>
                      <Text style={styles.addressItemText} numberOfLines={2}>
                        {getAddressDisplay(addr)}
                      </Text>
                      <Text style={styles.addressItemContact}>{addr.receiverContact}</Text>
                    </View>
                  </View>
                  {addr.isDefault && <Text style={styles.defaultLabel}>DEFAULT</Text>}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.addAddressButton} onPress={handleAddAddress}>
              <MaterialIcons name="add-location" size={20} color={COLORS.white} />
              <Text style={styles.addAddressText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Sticky Footer Checkout Button */}
      <View style={styles.footer}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          style={styles.checkoutButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity style={styles.checkoutTouchable} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    flex: 1,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  header: {
    position: 'relative',
    backgroundColor: `${COLORS.background}CC`,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  itemsList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
    gap: 16,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  itemDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 9999,
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  disabledQuantityButton: {
    opacity: 0.5,
  },
  quantityIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  quantityInput: {
    width: 20,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  tipSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  tipCard: {
    padding: 16,
    borderRadius: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  tipDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tipButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    flexWrap: 'wrap',
  },
  tipButtonUnselected: {
    height: 36,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: COLORS.white,
    borderRadius: 9999,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipButtonSelected: {
    height: 36,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
    borderRadius: 9999,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  tipButtonSelectedText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
  addressSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  addressContent: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 8,
  },
  subtotalSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  subtotalCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
    gap: 12,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  subtotalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  dashedBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  gradientTextContainer: {
    borderRadius: 4,
  },
  gradientText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: `${COLORS.background}CC`,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  checkoutButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  checkoutText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollView: {
    flex: 1,
    padding: 16,
  },
  noAddressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  noAddressTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  noAddressSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
  },
  addressItemSelected: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addressItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  addressItemDetails: {
    flex: 1,
  },
  addressItemName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  addressItemText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  addressItemContact: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '800',
  },
  defaultLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addAddressText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default CartScreen;