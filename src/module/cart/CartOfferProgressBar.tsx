import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { cartStyles as styles } from './styles';
import { useCartStore } from '../../store/cart';
import { COLORS } from '../../theme/theme';

export const CartOfferProgressBar: React.FC = () => {
  const { offerProgress } = useCartStore();

  if (!offerProgress || offerProgress.minCartValue <= 0) {
    return null;
  }

  const {
    title,
    badgeText,
    minCartValue,
    currentCartValue,
    amountNeeded,
    progressPercentage,
    isUnlocked,
    promoCode,
  } = offerProgress;

  return (
    <View style={styles.progressSection}>
      <View style={[styles.progressCard, isUnlocked && styles.progressCardUnlocked]}>
        <View style={styles.progressTopRow}>
          <View style={styles.progressTitleContainer}>
            <MaterialIcons
              name={isUnlocked ? 'check-circle' : 'local-offer'}
              size={16}
              color={isUnlocked ? '#059669' : COLORS.primary}
            />
            <Text style={styles.progressTitle} numberOfLines={1} ellipsizeMode="tail">
              {isUnlocked
                ? `Offer Unlocked: ${title || badgeText}`
                : promoCode
                ? `Code "${promoCode}" (Min ₹${minCartValue.toFixed(0)})`
                : `Unlock: ${title || badgeText}`}
            </Text>
          </View>
          {!isUnlocked && amountNeeded > 0 ? (
            <View style={styles.progressAmountBadge}>
              <Text style={styles.progressAmountBadgeText}>
                Add ₹{amountNeeded.toFixed(0)}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Progress Bar Track */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              isUnlocked && styles.progressBarFillUnlocked,
              { width: `${Math.min(100, Math.max(0, progressPercentage))}%` },
            ]}
          />
        </View>

        {/* Bottom Row */}
        <View style={styles.progressBottomRow}>
          <Text style={styles.progressSubText} numberOfLines={1} ellipsizeMode="tail">
            {isUnlocked
              ? '🎉 Maximum offer benefit applied to cart!'
              : `Add ₹${amountNeeded.toFixed(0)} more to reach ₹${minCartValue.toFixed(0)}`}
          </Text>
          <Text style={styles.progressValueText} numberOfLines={1}>
            ₹{currentCartValue.toFixed(0)} / ₹{minCartValue.toFixed(0)}
          </Text>
        </View>
      </View>
    </View>
  );
};
