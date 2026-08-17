import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
    appliedPromoCode,
    discountTotal,
    cashbackTotal,
    removeAppliedOffer,
    loading,
  } = useCartStore();

  const isApplied = !!(appliedOffer || appliedPromoCode);

  const handleOpenOffers = () => {
    navigation.navigate('ApplyOffers');
  };

  const handleRemove = async () => {
    await removeAppliedOffer();
  };

  return (
    <View style={styles.promoSection}>
      {isApplied ? (
        <View style={styles.appliedOfferCard}>
          <View style={styles.appliedOfferHeader}>
            <View style={styles.appliedOfferTitleRow}>
              <MaterialIcons name="check-circle" size={20} color="#059669" />
              <View style={styles.appliedOfferTextGroup}>
                <Text style={styles.appliedOfferCode} numberOfLines={1} ellipsizeMode="tail">
                  {appliedPromoCode ? `CODE: ${appliedPromoCode}` : appliedOffer?.title || 'OFFER APPLIED'}
                </Text>
                <Text style={styles.appliedOfferSavingText} numberOfLines={2}>
                  {discountTotal > 0
                    ? `₹${discountTotal.toFixed(2)} instant discount applied!`
                    : cashbackTotal > 0
                    ? `₹${cashbackTotal.toFixed(2)} cashback on delivery!`
                    : 'Offer applied successfully!'}
                </Text>
              </View>
            </View>

            <View style={styles.appliedOfferActions}>
              <TouchableOpacity
                style={styles.offerChangeButton}
                onPress={handleOpenOffers}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.offerChangeText}>CHANGE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.offerRemoveButton}
                onPress={handleRemove}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.offerRemoveText}>REMOVE</Text>
              </TouchableOpacity>
            </View>
          </View>
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
