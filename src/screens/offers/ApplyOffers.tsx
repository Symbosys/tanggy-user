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
import { parseToDecimal, ErrorMessage } from '../../utils/utils';

export const ApplyOffersScreen: React.FC = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const promoInputRef = useRef<TextInput>(null);

  const { data: offers = [], isLoading: loadingOffers, isRefetching, refetch } = useGetAvailableOffers();

  useFocusEffect(
    useCallback(() => {
      refetch();
      useCartStore.getState().fetchCart();
    }, [refetch])
  );

  const {
    itemTotal,
    subtotal,
    totalItems,
    selectedOfferId,
    selectedOfferIds,
    appliedPromoCode,
    appliedPromoCodes,
    appliedOffers,
    applyOfferById,
    removeOfferById,
    applyPromoCode,
    removePromoCodeByCode,
    removeAppliedOffer,
    loading: cartLoading,
  } = useCartStore();

  const [inputCode, setInputCode] = useState('');
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const isAnyActionLoading = cartLoading || isApplyingCode || !!applyingId;
  const currentCartValue = parseToDecimal(itemTotal || subtotal || 0);

  const handleApplyCode = async () => {
    if (!inputCode.trim()) return;
    const clean = inputCode.trim().toUpperCase();
    const matchingOffer = offers.find((o) => o.codes?.some((c) => c.code.toUpperCase() === clean));
    const isStackable = matchingOffer ? (matchingOffer.metadata?.isStackable ?? false) : true;
    
    const appliedCount = appliedOffers?.length || 0;
    if (isStackable && appliedCount >= 2 && !appliedPromoCodes.includes(clean)) {
      ErrorMessage("Maximum 2 offers can be applied per order. Please remove an offer to add a new one.");
      return;
    }

    setIsApplyingCode(true);
    await applyPromoCode(clean, isStackable);
    setIsApplyingCode(false);
    setInputCode('');
  };

  const handleUsePromoCode = async (offerId: string, code: string, isStackable: boolean) => {
    const appliedCount = appliedOffers?.length || 0;
    if (isStackable && appliedCount >= 2 && !appliedPromoCodes.includes(code.toUpperCase())) {
      ErrorMessage("Maximum 2 offers can be applied per order. Please remove an offer to add a new one.");
      return;
    }
    setApplyingId(offerId);
    await applyPromoCode(code, isStackable);
    setApplyingId(null);
  };

  const handleApplyOffer = async (offer: AvailableOffer) => {
    const isStackable = offer.metadata?.isStackable ?? false;
    const appliedCount = appliedOffers?.length || 0;
    if (isStackable && appliedCount >= 2 && !isOfferCurrentlyApplied(offer)) {
      ErrorMessage("Maximum 2 offers can be applied per order. Please remove an offer to add a new one.");
      return;
    }
    setApplyingId(offer.id);
    await applyOfferById(offer.id, isStackable);
    setApplyingId(null);
  };

  const handleRemoveOffer = async (offer: AvailableOffer) => {
    setApplyingId(offer.id);
    const matchingCode = offer.codes?.find((c) =>
      appliedPromoCodes.some((pc) => pc.toUpperCase() === c.code.toUpperCase())
    );
    if (matchingCode) {
      await removePromoCodeByCode(matchingCode.code);
    } else {
      await removeOfferById(offer.id);
    }
    setApplyingId(null);
  };

  const isOfferCurrentlyApplied = (offer: AvailableOffer) => {
    // A period offer can ONLY be applied if it is UNLOCKED in the user's active cycle
    if (offer.isPeriodOffer && offer.userPeriodProgress?.status !== 'UNLOCKED') {
      return false;
    }

    const offerIdStr = String(offer.id);
    const offerUuidStr = offer.uuid ? String(offer.uuid) : null;
    const promoCodeUpperList = offer.codes?.map((c) => c.code.toUpperCase()) || [];

    // Strictly check if this offer is in the validated appliedOffers list
    if (
      appliedOffers &&
      appliedOffers.some(
        (ao) =>
          String(ao.id) === offerIdStr ||
          (offerUuidStr && String(ao.id) === offerUuidStr) ||
          String(ao.uuid) === offerIdStr ||
          (offerUuidStr && String(ao.uuid) === offerUuidStr) ||
          (ao.title && offer.title && ao.title.trim().toUpperCase() === offer.title.trim().toUpperCase())
      )
    ) {
      return true;
    }

    // Or if any of its promo codes is in the validated appliedPromoCodes list
    if (
      appliedPromoCodes &&
      appliedPromoCodes.length > 0 &&
      promoCodeUpperList.some((c) => appliedPromoCodes.includes(c))
    ) {
      return true;
    }

    return false;
  };

  const formatBenefitText = (offer: AvailableOffer) => {
    const val = parseToDecimal(offer.discountValue);
    const type = (offer.discountType || '').toUpperCase();

    if (offer.isPeriodOffer && type === 'PERCENTAGE' && val === 100) {
      return '100% FREE ORDER';
    }
    if (type === 'PERCENTAGE') {
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
              editable={!isAnyActionLoading}
            />
            <TouchableOpacity
              style={[
                styles.applyBtn,
                (!inputCode.trim() || isAnyActionLoading) && { opacity: 0.6 },
              ]}
              onPress={handleApplyCode}
              disabled={!inputCode.trim() || isAnyActionLoading}
              activeOpacity={0.8}
            >
              {isApplyingCode ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.applyBtnText}>APPLY</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Available Offers List Section */}
        {(appliedOffers?.length || 0) >= 2 && (
          <View style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialIcons name="info-outline" size={18} color="#059669" />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#065F46', flex: 1 }}>
              Maximum 2 offers applied. To apply a different offer, please remove an applied offer first.
            </Text>
          </View>
        )}

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
            const isPeriodOffer = offer.isPeriodOffer ?? false;
            const progress = offer.userPeriodProgress;
            const periodRule = offer.periodRule;
            const minCartVal = parseToDecimal(offer.metadata?.minCartValue || 0);
            const minCartItems = offer.metadata?.minCartItems ?? 1;

            let isQualified = false;
            let isValQualified = true;
            let isItemsQualified = true;
            let amountNeeded = 0;
            let itemsNeeded = 0;

            if (isPeriodOffer) {
              isQualified = progress?.status === 'UNLOCKED';
            } else {
              isValQualified = minCartVal <= 0 || currentCartValue >= minCartVal;
              isItemsQualified = minCartItems <= 1 || totalItems >= minCartItems;
              isQualified = isValQualified && isItemsQualified;
              amountNeeded = Math.max(0, minCartVal - currentCartValue);
              itemsNeeded = Math.max(0, minCartItems - totalItems);
            }

            const isApplied = isOfferCurrentlyApplied(offer);
            const promoCodeStr = offer.codes?.find((c) => c.isActive && c.code)?.code;
            const isStackable = offer.metadata?.isStackable ?? false;
            const hasProductTargets = (offer.productTargets?.length ?? 0) > 0;
            const isCardActionLoading = applyingId === offer.id;

            return (
              <View
                key={offer.id}
                style={[
                  styles.offerCard,
                  isApplied && styles.offerCardApplied,
                  isPeriodOffer && styles.offerCardPeriod,
                  !isQualified && !isApplied && styles.offerCardLocked,
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
                    {isPeriodOffer ? (
                      <View style={[styles.codeBadge, { backgroundColor: '#F3E8FF', borderColor: '#D8B4FE' }]}>
                        <MaterialIcons name="auto-awesome" size={11} color="#7E22CE" />
                        <Text style={[styles.codeBadgeText, { color: '#7E22CE' }]}>Period Milestone</Text>
                      </View>
                    ) : promoCodeStr ? (
                      <View style={styles.codeBadge}>
                        <MaterialIcons name="confirmation-number" size={12} color="#4338CA" />
                        <Text style={styles.codeBadgeText}>{promoCodeStr}</Text>
                      </View>
                    ) : null}
                    {isStackable ? (
                      <View style={[styles.codeBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                        <MaterialIcons name="layers" size={11} color="#059669" />
                        <Text style={[styles.codeBadgeText, { color: '#059669' }]}>Stackable</Text>
                      </View>
                    ) : (
                      <View style={[styles.codeBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                        <MaterialIcons name="lock-outline" size={11} color="#D97706" />
                        <Text style={[styles.codeBadgeText, { color: '#D97706' }]}>Single Offer</Text>
                      </View>
                    )}
                  </View>

                  {/* Apply / Remove / Use Code Button */}
                  {isApplied ? (
                    <TouchableOpacity
                      style={styles.appliedBtn}
                      onPress={() => handleRemoveOffer(offer)}
                      disabled={isAnyActionLoading}
                      activeOpacity={0.8}
                    >
                      {isCardActionLoading ? (
                        <ActivityIndicator size="small" color="#059669" style={{ marginHorizontal: 8 }} />
                      ) : (
                        <>
                          <MaterialIcons name="check" size={14} color="#059669" />
                          <Text style={styles.appliedBtnText}>APPLIED</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : isQualified ? (
                    promoCodeStr ? (
                      <TouchableOpacity
                        style={styles.cardUseCodeBtn}
                        onPress={() => handleUsePromoCode(offer.id, promoCodeStr, isStackable)}
                        activeOpacity={0.8}
                        disabled={isAnyActionLoading}
                      >
                        {isCardActionLoading ? (
                          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginHorizontal: 12 }} />
                        ) : (
                          <>
                            <MaterialIcons name="content-copy" size={12} color={COLORS.primary} />
                            <Text style={styles.cardUseCodeBtnText}>USE CODE</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.cardApplyBtn}
                        onPress={() => handleApplyOffer(offer)}
                        disabled={isAnyActionLoading}
                        activeOpacity={0.8}
                      >
                        {isCardActionLoading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" style={{ marginHorizontal: 10 }} />
                        ) : (
                          <Text style={styles.cardApplyBtnText}>APPLY</Text>
                        )}
                      </TouchableOpacity>
                    )
                  ) : (
                    <View style={styles.lockedBtn}>
                      <MaterialIcons name="lock" size={14} color="#9CA3AF" />
                      <Text style={styles.lockedBtnText}>
                        {isPeriodOffer && progress?.status === 'REDEEMED' ? 'REDEEMED' : 'LOCKED'}
                      </Text>
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

                {/* 🔄 Dedicated Period Offer Milestone Progress Card */}
                {isPeriodOffer && progress && (
                  <View style={styles.periodProgressBox}>
                    <View style={styles.periodProgressHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                        <MaterialIcons
                          name={progress.status === 'UNLOCKED' ? 'stars' : progress.status === 'REDEEMED' ? 'check-circle' : 'trending-up'}
                          size={16}
                          color={progress.status === 'UNLOCKED' ? '#059669' : progress.status === 'REDEEMED' ? '#4F46E5' : '#7E22CE'}
                        />
                        <Text style={styles.periodProgressTitle} numberOfLines={1}>
                          {progress.status === 'UNLOCKED'
                            ? '🎉 Milestone Completed!'
                            : progress.status === 'REDEEMED'
                            ? '✅ Reward Claimed for Current Cycle'
                            : `Milestone: ${progress.completedOrderCount} of ${progress.targetOrderCount} Delivered Orders`}
                        </Text>
                      </View>
                      <Text style={styles.periodCycleTag}>Cycle #{progress.currentCycleNumber}</Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(100, Math.max(0, progress.progressPercentage ?? (progress.completedOrderCount / progress.targetOrderCount) * 100))}%`,
                            backgroundColor: progress.status === 'UNLOCKED' ? '#10B981' : '#8B5CF6',
                          },
                        ]}
                      />
                    </View>

                    {/* Status Explainer */}
                    <View style={styles.periodStatusRow}>
                      {progress.status === 'IN_PROGRESS' && (
                        <>
                          <Text style={styles.periodStatusText}>
                            🚚 Complete {Math.max(0, progress.targetOrderCount - progress.completedOrderCount)} more delivered order(s) to unlock this reward!
                          </Text>
                          {progress.remainingDays !== undefined && (
                            <Text style={styles.periodDaysLeftText}>
                              ⏳ {progress.remainingDays} {progress.remainingDays === 1 ? 'day' : 'days'} left
                            </Text>
                          )}
                        </>
                      )}
                      {progress.status === 'UNLOCKED' && (
                        <Text style={[styles.periodStatusText, { color: '#059669', fontWeight: '700' }]}>
                          ✨ Unlocked! Tap APPLY to receive this benefit on your current order.
                        </Text>
                      )}
                      {progress.status === 'REDEEMED' && (
                        <Text style={styles.periodStatusText}>
                          You have used this reward. A fresh cycle begins automatically on your next delivered order.
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Qualification Warning if standard offer locked */}
                {!isPeriodOffer && !isQualified ? (
                  <View style={styles.lockInfoBox}>
                    <MaterialIcons name="info-outline" size={14} color="#B45309" />
                    <Text style={styles.lockInfoText}>
                      {!isValQualified
                        ? `Add ₹${amountNeeded.toFixed(2)} more to unlock this offer (Min Cart: ₹${minCartVal.toFixed(0)})`
                        : `Add ${itemsNeeded} more item(s) to unlock this offer (Min Items: ${minCartItems})`}
                    </Text>
                  </View>
                ) : null}

                {/* Offer Rules & Terms Breakdown */}
                <View style={styles.termsDivider} />
                <View style={styles.rulesContainer}>
                  {isPeriodOffer ? (
                    <>
                      <View style={styles.ruleItem}>
                        <MaterialIcons name="track-changes" size={13} color="#7E22CE" />
                        <Text style={[styles.ruleText, { color: '#6B21A8', fontWeight: '700' }]}>
                          Target: {periodRule?.targetOrderCount || progress?.targetOrderCount || 5} Orders in {periodRule?.periodDurationValue || 1} {periodRule?.periodDurationType === 'DAYS' ? 'Days' : 'Month(s)'}
                        </Text>
                      </View>
                      <View style={styles.ruleItem}>
                        <MaterialIcons name="autorenew" size={13} color="#6B7280" />
                        <Text style={styles.ruleText}>Recurring Lifetime Cycles</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      {minCartVal > 0 ? (
                        <View style={styles.ruleItem}>
                          <MaterialIcons name="shopping-bag" size={13} color="#6B7280" />
                          <Text style={styles.ruleText}>Min Order: ₹{minCartVal.toFixed(0)}</Text>
                        </View>
                      ) : null}
                      {minCartItems > 1 ? (
                        <View style={styles.ruleItem}>
                          <MaterialIcons name="format-list-numbered" size={13} color="#6B7280" />
                          <Text style={styles.ruleText}>Min Items: {minCartItems}</Text>
                        </View>
                      ) : null}
                    </>
                  )}

                  {hasProductTargets ? (
                    <View style={styles.ruleItem}>
                      <MaterialIcons name="check-circle-outline" size={13} color="#6B7280" />
                      <Text style={styles.ruleText}>Select Products</Text>
                    </View>
                  ) : null}
                  <View style={styles.ruleItem}>
                    {isStackable ? (
                      <>
                        <MaterialIcons name="layers" size={13} color="#059669" />
                        <Text style={[styles.ruleText, { color: '#059669', fontWeight: '700' }]}>
                          Can combine with other offers
                        </Text>
                      </>
                    ) : (
                      <>
                        <MaterialIcons name="lock-outline" size={13} color="#D97706" />
                        <Text style={[styles.ruleText, { color: '#D97706', fontWeight: '700' }]}>
                          Cannot combine with other offers
                        </Text>
                      </>
                    )}
                  </View>
                  {!isPeriodOffer && (
                    <>
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
                    </>
                  )}
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
  offerCardPeriod: {
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  periodProgressBox: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
  },
  periodProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  periodProgressTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B21A8',
    flex: 1,
  },
  periodCycleTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7E22CE',
    backgroundColor: '#F3E8FF',
    borderColor: '#D8B4FE',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E9D5FF',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  periodStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  periodStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7E22CE',
    flex: 1,
  },
  periodDaysLeftText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9333EA',
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
