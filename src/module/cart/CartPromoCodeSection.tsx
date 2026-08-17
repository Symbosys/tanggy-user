import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { cartStyles as styles } from './styles';
import { useCartStore } from '../../store/cart';
import { useCartCalculations } from './hooks';
import { COLORS } from '../../theme/theme';

export const CartPromoCodeSection: React.FC = () => {
  const {
    promoCode,
    appliedPromoCode,
    promoError,
    applyPromoCode,
    removePromoCode,
    loading,
    promoDiscountTotal,
  } = useCartStore();

  const { discountAmount, cashbackAmount } = useCartCalculations();

  const [inputCode, setInputCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (!inputCode.trim()) return;
    setIsApplying(true);
    const success = await applyPromoCode(inputCode.trim());
    setIsApplying(false);
    if (success) {
      setInputCode('');
    }
  };

  const handleRemove = async () => {
    await removePromoCode();
    setInputCode('');
  };

  return (
    <View style={styles.promoSection}>
      <View style={styles.promoCard}>
        <View style={styles.promoHeaderRow}>
          <MaterialIcons name="local-offer" size={18} color={COLORS.primary} />
          <Text style={styles.promoHeaderTitle}>Offers & Promo Code</Text>
        </View>

        {appliedPromoCode ? (
          <View style={styles.promoAppliedContainer}>
            <View style={styles.promoAppliedLeft}>
              <MaterialIcons name="check-circle" size={20} color="#059669" />
              <View style={styles.promoAppliedDetails}>
                <Text style={styles.promoAppliedCode} numberOfLines={1} ellipsizeMode="tail">
                  {appliedPromoCode}
                </Text>
                <Text style={styles.promoAppliedSaving} numberOfLines={2} ellipsizeMode="tail">
                  {promoDiscountTotal > 0
                    ? `Promo discount of ₹${promoDiscountTotal.toFixed(2)} applied!`
                    : cashbackAmount > 0
                    ? `₹${cashbackAmount.toFixed(2)} wallet cashback on delivery!`
                    : 'Coupon applied successfully!'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.promoRemoveButton}
              onPress={handleRemove}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.promoRemoveText}>REMOVE</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.promoInputRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="ENTER PROMO CODE"
                placeholderTextColor="#9CA3AF"
                value={inputCode}
                onChangeText={text => setInputCode(text.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[
                  styles.promoApplyButton,
                  (!inputCode.trim() || isApplying) && { opacity: 0.6 },
                ]}
                onPress={handleApply}
                disabled={!inputCode.trim() || isApplying}
              >
                {isApplying ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.promoApplyText}>APPLY</Text>
                )}
              </TouchableOpacity>
            </View>
            {promoError ? (
              <Text style={styles.promoErrorText}>{promoError}</Text>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
};
