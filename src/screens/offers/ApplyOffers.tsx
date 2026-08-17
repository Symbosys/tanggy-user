import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCartStore } from '../../store/cart';
import { useGetAvailableOffers, AvailableOffer } from '../../api/hooks/offer.hook';
import { COLORS } from '../../theme/theme';
import { parseToDecimal } from '../../utils/utils';

export const ApplyOffersScreen: React.FC = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const promoInputRef = useRef<TextInput>(null);

  const { data: offers = [], isLoading: loadingOffers, isRefetching, refetch } = useGetAvailableOffers();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const {
    itemTotal,
    subtotal,
    selectedOfferId,
    appliedPromoCode,
    applyOfferById,
    applyPromoCode,
    removeAppliedOffer,
    loading: cartLoading,
  } = useCartStore();

  const [inputCode, setInputCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const currentCartValue = parseToDecimal(itemTotal || subtotal || 0);

  const handleApplyCode = async () => {
    if (!inputCode.trim()) return;
    setIsApplying(true);
    const success = await applyPromoCode(inputCode.trim());
    setIsApplying(false);
    if (success) {
      navigation.goBack();
    }
  };

  const handleUsePromoCode = (code: string) => {
    setInputCode(code.toUpperCase());
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    setTimeout(() => {
      promoInputRef.current?.focus();
    }, 250);
  };

  const handleApplyOffer = async (offer: AvailableOffer) => {
    setIsApplying(true);
    const success = await applyOfferById(offer.id);
    setIsApplying(false);
    if (success) {
      navigation.goBack();
    }
  };

  const isOfferCurrentlyApplied = (offer: AvailableOffer) => {
    if (selectedOfferId && (selectedOfferId === offer.id || selectedOfferId === offer.uuid)) {
      return true;
    }
    if (appliedPromoCode && offer.codes?.some((c) => c.code.toUpperCase() === appliedPromoCode.toUpperCase())) {
      return true;
    }
    return false;
  };

  const formatBenefitText = (offer: AvailableOffer) => {
    const val = parseToDecimal(offer.discountValue);
    const type = (offer.discountType || '').toUpperCase();

    if (type === 'PERCENTAGE' || type === 'PERCENTAGE_CAPPED') {
      return `${val}% OFF`;
    }
    if (type === 'FIXED_AMOUNT' || type === 'FLAT' || type === 'FIXED') {
      return `₹${val.toFixed(0)} OFF`;
    }
    if (type === 'WALLET_CASHBACK_PERCENTAGE' || type === 'WALLET_CASHBACK_PERCENT') {
      return `${val}% CASHBACK`;
    }
    if (type === 'WALLET_CASHBACK_FLAT' || type === 'WALLET_CASHBACK') {
      return `₹${val.toFixed(0)} CASHBACK`;
    }
    if (type === 'FREE_DELIVERY') {
      return 'FREE DELIVERY';
    }
    if (type === 'BUY_X_GET_Y') {
      return 'BUY & GET';
    }
    return `₹${val.toFixed(0)} OFF`;
  };

  const formatDaysText = (days?: string[]) => {
    if (!days || days.length === 7) return 'All Days';
    if (days.length === 0) return 'All Days';
    return days.map((d) => d.slice(0, 3)).join(', ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coupons & Offers</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Promo Code Input Section */}
        <View style={styles.inputCard}>
          <Text style={styles.inputSectionTitle}>Have a Promo Code?</Text>
          <View style={styles.inputRow}>
            <TextInput
              ref={promoInputRef}
              style={styles.promoInput}
              placeholder="ENTER CODE"
              placeholderTextColor="#9CA3AF"
              value={inputCode}
              onChangeText={(text) => setInputCode(text.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[
                styles.applyBtn,
                (!inputCode.trim() || isApplying) && { opacity: 0.6 },
              ]}
              onPress={handleApplyCode}
              disabled={!inputCode.trim() || isApplying}
              activeOpacity={0.8}
            >
              {isApplying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.applyBtnText}>APPLY</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Available Offers List Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Offers</Text>
          <Text style={styles.cartValueBadge}>
            Cart: ₹{currentCartValue.toFixed(2)}
          </Text>
        </View>

        {loadingOffers ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading available offers...</Text>
          </View>
        ) : offers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="local-offer" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Offers Available Right Now</Text>
            <Text style={styles.emptySubtitle}>
              Check back soon for new promotions and exclusive discounts.
            </Text>
          </View>
        ) : (
          offers.map((offer) => {
            const minCartVal = parseToDecimal(offer.metadata?.minCartValue || 0);
            const isQualified = minCartVal <= 0 || currentCartValue >= minCartVal;
            const amountNeeded = Math.max(0, minCartVal - currentCartValue);
            const isApplied = isOfferCurrentlyApplied(offer);
            const promoCodeStr = offer.codes?.find((c) => c.isActive && c.code)?.code;

            return (
              <View
                key={offer.id}
                style={[
                  styles.offerCard,
                  isApplied && styles.offerCardApplied,
                  !isQualified && styles.offerCardLocked,
                ]}
              >
                {/* Top Badge Row */}
                <View style={styles.cardTopRow}>
                  <View style={styles.badgeContainer}>
                    <View style={styles.benefitBadge}>
                      <Text style={styles.benefitBadgeText}>
                        {formatBenefitText(offer)}
                      </Text>
                    </View>
                    {promoCodeStr ? (
                      <TouchableOpacity
                        style={styles.codeBadge}
                        onPress={() => handleUsePromoCode(promoCodeStr)}
                        activeOpacity={0.7}
                      >
                        <MaterialIcons name="confirmation-number" size={12} color="#4338CA" />
                        <Text style={styles.codeBadgeText}>{promoCodeStr}</Text>
                        <MaterialIcons name="content-copy" size={11} color="#4338CA" style={{ marginLeft: 2 }} />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {/* Apply / Remove / Use Code Button */}
                  {isApplied ? (
                    <TouchableOpacity
                      style={styles.appliedBtn}
                      onPress={removeAppliedOffer}
                      disabled={cartLoading || isApplying}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="check" size={14} color="#059669" />
                      <Text style={styles.appliedBtnText}>APPLIED</Text>
                    </TouchableOpacity>
                  ) : isQualified ? (
                    promoCodeStr ? (
                      <TouchableOpacity
                        style={styles.cardUseCodeBtn}
                        onPress={() => handleUsePromoCode(promoCodeStr)}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="content-copy" size={12} color={COLORS.primary} />
                        <Text style={styles.cardUseCodeBtnText}>USE CODE</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.cardApplyBtn}
                        onPress={() => handleApplyOffer(offer)}
                        disabled={cartLoading || isApplying}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.cardApplyBtnText}>APPLY</Text>
                      </TouchableOpacity>
                    )
                  ) : (
                    <View style={styles.lockedBtn}>
                      <MaterialIcons name="lock" size={14} color="#9CA3AF" />
                      <Text style={styles.lockedBtnText}>LOCKED</Text>
                    </View>
                  )}
                </View>

                {/* Offer Title & Description */}
                <Text style={styles.offerTitle}>{offer.title}</Text>
                {offer.subtitle || offer.description ? (
                  <Text style={styles.offerDescription}>
                    {offer.subtitle || offer.description}
                  </Text>
                ) : null}

                {/* Qualification Warning if locked */}
                {!isQualified && amountNeeded > 0 ? (
                  <View style={styles.lockInfoBox}>
                    <MaterialIcons name="info-outline" size={14} color="#B45309" />
                    <Text style={styles.lockInfoText}>
                      Add ₹{amountNeeded.toFixed(2)} more items to unlock this offer (Min Cart: ₹{minCartVal.toFixed(2)})
                    </Text>
                  </View>
                ) : null}

                {/* Offer Rules & Terms Breakdown */}
                <View style={styles.termsDivider} />
                <View style={styles.rulesContainer}>
                  {minCartVal > 0 ? (
                    <View style={styles.ruleItem}>
                      <MaterialIcons name="shopping-bag" size={13} color="#6B7280" />
                      <Text style={styles.ruleText}>Min Order: ₹{minCartVal.toFixed(2)}</Text>
                    </View>
                  ) : null}
                  {offer.metadata?.maxDiscount ? (
                    <View style={styles.ruleItem}>
                      <MaterialIcons name="trending-down" size={13} color="#6B7280" />
                      <Text style={styles.ruleText}>Max Discount: ₹{parseToDecimal(offer.metadata.maxDiscount).toFixed(2)}</Text>
                    </View>
                  ) : null}
                  <View style={styles.ruleItem}>
                    <MaterialIcons name="event" size={13} color="#6B7280" />
                    <Text style={styles.ruleText}>{formatDaysText(offer.metadata?.applicableDays)}</Text>
                  </View>
                  {offer.endDate ? (
                    <View style={styles.ruleItem}>
                      <MaterialIcons name="schedule" size={13} color="#6B7280" />
                      <Text style={styles.ruleText}>
                        Expires: {new Date(offer.endDate).toLocaleDateString()}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  inputSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    backgroundColor: '#F9FAFB',
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cartValueBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  offerCardApplied: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  offerCardLocked: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E5E7EB',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  benefitBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  benefitBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  codeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4338CA',
  },
  cardApplyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
  },
  cardApplyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cardUseCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cardUseCodeBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  appliedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  appliedBtnText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  lockedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  lockedBtnText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
    marginBottom: 8,
  },
  lockInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  lockInfoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    flex: 1,
  },
  termsDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  rulesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ruleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default ApplyOffersScreen;
