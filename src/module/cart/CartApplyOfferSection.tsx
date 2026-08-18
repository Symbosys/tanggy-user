import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { cartStyles as styles } from './styles';
import { useCartStore } from '../../store/cart';
import { COLORS } from '../../theme/theme';
import { RootStackParamList } from '../../types/type';

export const CartApplyOfferSection: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {
    appliedOffer,
    appliedOffers,
    appliedPromoCode,
    appliedPromoCodes,
    discountTotal,
    cashbackTotal,
    removeOfferById,
    removePromoCodeByCode,
    removeAppliedOffer,
    loading,
  } = useCartStore();

  const [removingId, setRemovingId] = useState<string | null>(null);

  const offersList = appliedOffers && appliedOffers.length > 0
    ? appliedOffers
    : appliedOffer
    ? [appliedOffer]
    : [];

  const isApplied = offersList.length > 0 || (appliedPromoCodes && appliedPromoCodes.length > 0) || !!appliedPromoCode;

  const handleOpenOffers = () => {
    navigation.navigate('ApplyOffers');
  };

  const handleRemoveSingleOffer = async (offerId: string) => {
    setRemovingId(offerId);
    await removeOfferById(offerId);
    setRemovingId(null);
  };

  return (
    <View style={styles.promoSection}>
      {isApplied ? (
        <View style={styles.appliedOfferCard}>
          {/* Card Header with Add More button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#D1FAE5' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="local-offer" size={16} color="#059669" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#065F46' }}>
                Applied Offers ({offersList.length})
              </Text>
            </View>
            <TouchableOpacity
              style={styles.offerChangeButton}
              onPress={handleOpenOffers}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.offerChangeText}>+ ADD MORE</Text>
            </TouchableOpacity>
          </View>

          {/* List of Applied Offers */}
          {offersList.map((offer, index) => {
            const hasDiscount = offer.discountAmount > 0;
            const hasCashback = offer.cashbackAmount > 0;

            return (
              <View
                key={offer.id || `offer-${index}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 6,
                  borderBottomWidth: index < offersList.length - 1 ? 1 : 0,
                  borderBottomColor: '#ECFDF5',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                  <MaterialIcons name="check-circle" size={18} color="#059669" />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#065F46' }} numberOfLines={1}>
                      {offer.title || (offer.badgeText || 'Offer Applied')}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#047857', marginTop: 1 }}>
                      {hasDiscount
                        ? `₹${offer.discountAmount.toFixed(2)} instant discount applied!`
                        : hasCashback
                        ? `₹${offer.cashbackAmount.toFixed(2)} cashback on delivery!`
                        : 'Offer active on qualifying items'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={{
                    padding: 4,
                    backgroundColor: '#FEE2E2',
                    borderRadius: 6,
                    marginLeft: 8,
                    minWidth: 22,
                    minHeight: 22,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => handleRemoveSingleOffer(offer.id)}
                  disabled={loading || !!removingId}
                  activeOpacity={0.7}
                >
                  {removingId === offer.id ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : (
                    <MaterialIcons name="close" size={14} color="#DC2626" />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.applyOfferCard}
          onPress={handleOpenOffers}
          activeOpacity={0.8}
        >
          <View style={styles.applyOfferLeft}>
            <View style={styles.applyOfferIconBox}>
              <MaterialIcons name="local-offer" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.applyOfferTextBox}>
              <Text style={styles.applyOfferTitle}>Apply Offers</Text>
              <Text style={styles.applyOfferSubtitle}>Tap to select active offers or enter promo codes</Text>
            </View>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
};
