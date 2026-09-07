import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { COLORS } from '../../theme/theme';
import { parseToDecimal } from '../../utils/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface NormalOfferHeaderProps {
  offer: any;
}

export const NormalOfferHeader: React.FC<NormalOfferHeaderProps> = ({ offer }) => {
  const [copied, setCopied] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Extract banner image URL
  const imageUrl =
    typeof offer?.bannerImage === 'string'
      ? offer.bannerImage
      : offer?.bannerImage?.url ||
        offer?.bannerImage?.secure_url ||
        (typeof offer?.image === 'string'
          ? offer.image
          : offer?.image?.url || offer?.image?.secure_url);

  // Extract promo code
  const promoCode =
    offer?.codes?.[0]?.code ||
    (offer?.type === 'PROMO_CODE' ? offer?.code : null);

  const discountVal = parseToDecimal(offer?.discountValue || 0);
  const isPercentage =
    offer?.discountType === 'PERCENTAGE' ||
    offer?.discountType === 'WALLET_CASHBACK_PERCENTAGE';
  const isCashback = offer?.discountType?.includes('CASHBACK');
  const discountDisplay = isPercentage ? `${discountVal}%` : `₹${discountVal}`;

  const minCart = parseToDecimal(offer?.metadata?.minCartValue || 0);
  const minItems = offer?.metadata?.minCartItems || 1;
  const isStackable = offer?.metadata?.isStackable ?? false;
  const termsText =
    offer?.metadata?.termsAndConditions ||
    offer?.termsAndConditions ||
    'Standard promotion terms apply. Cannot be transferred or exchanged for cash.';

  const handleCopyCode = () => {
    if (!promoCode) return;
    setCopied(true);
    Toast.show({
      type: 'success',
      text1: 'Promo Code Copied!',
      text2: `Apply "${promoCode}" at checkout to claim your discount.`,
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const formatDate = (dStr?: string) => {
    if (!dStr) return null;
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const startDateFormatted = formatDate(offer?.startDate);
  const endDateFormatted = formatDate(offer?.endDate);

  return (
    <View style={styles.container}>
      {/* Hero Banner Card */}
      {imageUrl ? (
        <View style={styles.bannerWrapper}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.gradientOverlay}
          >
            {offer?.badgeText ? (
              <View style={styles.badgePill}>
                <Icon name="local-offer" size={12} color="#FFFFFF" />
                <Text style={styles.badgePillText}>{offer.badgeText}</Text>
              </View>
            ) : null}
          </LinearGradient>
        </View>
      ) : null}

      {/* Main Title & Benefit Summary */}
      <View style={styles.detailsCard}>
        <View style={styles.benefitRow}>
          <View style={styles.benefitBadge}>
            <Icon
              name={isCashback ? 'account-balance-wallet' : 'stars'}
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.benefitText}>
              {discountDisplay} {isCashback ? 'Cashback' : 'Off'}
            </Text>
          </View>

          <View
            style={[
              styles.stackableBadge,
              isStackable ? styles.stackableGreen : styles.stackableGray,
            ]}
          >
            <Icon
              name={isStackable ? 'verified' : 'lock'}
              size={12}
              color={isStackable ? '#059669' : '#6B7280'}
            />
            <Text
              style={[
                styles.stackableText,
                { color: isStackable ? '#059669' : '#6B7280' },
              ]}
            >
              {isStackable ? 'Stackable' : 'Exclusive'}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{offer?.title || 'Special Promotion'}</Text>
        {offer?.subtitle ? (
          <Text style={styles.subtitle}>{offer.subtitle}</Text>
        ) : null}
        {offer?.description ? (
          <Text style={styles.description}>{offer.description}</Text>
        ) : null}

        {/* Promo Code Copy Card (If Code based) */}
        {promoCode ? (
          <TouchableOpacity
            style={styles.couponCard}
            onPress={handleCopyCode}
            activeOpacity={0.85}
          >
            <View style={styles.couponLeft}>
              <View style={styles.couponIconCircle}>
                <Icon name="content-cut" size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.couponCodeText}>{promoCode}</Text>
                <Text style={styles.couponSubText}>Tap to copy promo code</Text>
              </View>
            </View>
            <View
              style={[
                styles.copyButton,
                copied ? styles.copyButtonActive : null,
              ]}
            >
              <Icon
                name={copied ? 'check' : 'content-copy'}
                size={14}
                color={copied ? '#FFFFFF' : COLORS.primary}
              />
              <Text
                style={[
                  styles.copyButtonText,
                  copied ? { color: '#FFFFFF' } : null,
                ]}
              >
                {copied ? 'COPIED' : 'COPY'}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Key Constraints Chips */}
        <View style={styles.metaChipsRow}>
          {minCart > 0 ? (
            <View style={styles.metaChip}>
              <Icon name="shopping-cart" size={13} color="#4B5563" />
              <Text style={styles.metaChipText}>Min Order: ₹{minCart}</Text>
            </View>
          ) : (
            <View style={styles.metaChip}>
              <Icon name="check-circle" size={13} color="#059669" />
              <Text style={styles.metaChipText}>No Minimum Order</Text>
            </View>
          )}

          {minItems > 1 ? (
            <View style={styles.metaChip}>
              <Icon name="format-list-numbered" size={13} color="#4B5563" />
              <Text style={styles.metaChipText}>Min {minItems} Items</Text>
            </View>
          ) : null}

          {startDateFormatted && endDateFormatted ? (
            <View style={styles.metaChip}>
              <Icon name="event" size={13} color="#4B5563" />
              <Text style={styles.metaChipText}>
                Valid till {endDateFormatted}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Terms & Conditions Toggle */}
        <TouchableOpacity
          style={styles.termsToggle}
          onPress={() => setShowTerms(!showTerms)}
          activeOpacity={0.7}
        >
          <Text style={styles.termsToggleText}>Terms & Conditions</Text>
          <Icon
            name={showTerms ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={18}
            color="#6B7280"
          />
        </TouchableOpacity>

        {showTerms ? (
          <View style={styles.termsContent}>
            <Text style={styles.termsText}>{termsText}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  bannerWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'flex-end',
    padding: 12,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  benefitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(238, 87, 34, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  benefitText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  stackableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stackableGreen: {
    backgroundColor: '#ECFDF5',
  },
  stackableGray: {
    backgroundColor: '#F3F4F6',
  },
  stackableText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 4,
    lineHeight: 18,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 17,
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  couponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  couponIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  couponCodeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#9A3412',
    letterSpacing: 1.2,
  },
  couponSubText: {
    fontSize: 10,
    color: '#C2410C',
    marginTop: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  copyButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  metaChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metaChipText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  termsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  termsToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  termsContent: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  termsText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
});
