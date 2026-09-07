import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { parseToDecimal } from '../../utils/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PeriodRule {
  targetOrderCount?: number;
  periodDays?: number;
  minOrderValue?: any;
  discountType?: string;
  discountValue?: any;
  maxDiscount?: any;
}

interface UserPeriodProgress {
  completedOrderCount?: number;
  targetOrderCount?: number;
  currentCycleNumber?: number;
  cycleStartDate?: string;
  cycleEndDate?: string;
  status?: string; // 'IN_PROGRESS' | 'UNLOCKED'
  daysRemaining?: number;
  progressPercentage?: number;
}

interface PeriodicOfferProgressMapProps {
  offer: {
    id: string | number;
    title?: string;
    description?: string;
    badgeText?: string | null;
    discountType?: string;
    discountValue?: any;
    maxDiscount?: any;
    minOrderValue?: any;
    periodRule?: PeriodRule | any;
    startDate?: string;
    endDate?: string;
    metadata?: any;
  };
  progress?: UserPeriodProgress | null;
}

export const PeriodicOfferProgressMap: React.FC<PeriodicOfferProgressMapProps> = ({
  offer,
  progress,
}) => {
  const targetCount =
    progress?.targetOrderCount ||
    offer?.periodRule?.targetOrderCount ||
    5;
  const completedCount = Math.min(
    progress?.completedOrderCount || 0,
    targetCount
  );
  const remainingCount = Math.max(0, targetCount - completedCount);
  const isUnlocked =
    progress?.status === 'UNLOCKED' || completedCount >= targetCount;
  const progressPercent =
    progress?.progressPercentage ??
    Math.min(100, Math.round((completedCount / targetCount) * 100));

  const minOrderValue = parseToDecimal(
    offer?.periodRule?.minOrderValue ??
      offer?.minOrderValue ??
      offer?.metadata?.minCartValue ??
      0
  );

  const discountVal = parseToDecimal(
    offer?.periodRule?.discountValue ?? offer?.discountValue ?? 0
  );

  const rawMaxDiscount =
    offer?.periodRule?.maxDiscount ??
    offer?.maxDiscount ??
    offer?.metadata?.maxDiscount;
  const maxDisc = rawMaxDiscount ? parseToDecimal(rawMaxDiscount) : null;

  const rawDiscountType = String(
    offer?.periodRule?.discountType ??
      offer?.discountType ??
      'PERCENTAGE'
  ).toUpperCase();

  const isPercentage =
    rawDiscountType === 'PERCENTAGE' ||
    rawDiscountType === 'WALLET_CASHBACK_PERCENTAGE' ||
    rawDiscountType === 'WALLET_CASHBACK_PERCENT';

  const isCashback =
    rawDiscountType.includes('CASHBACK') ||
    offer?.description?.toLowerCase().includes('cashback') ||
    offer?.title?.toLowerCase().includes('cashback') ||
    Boolean(offer?.badgeText?.toLowerCase().includes('cashback'));

  let rewardLabel = '';
  if (isCashback) {
    if (isPercentage) {
      rewardLabel = `${discountVal}% Cashback${maxDisc ? ` (up to ₹${maxDisc.toFixed(0)})` : ''}`;
    } else {
      rewardLabel = `₹${discountVal.toFixed(0)} Cashback`;
    }
  } else if (rawDiscountType === 'PERCENTAGE') {
    rewardLabel = `${discountVal}% OFF${maxDisc ? ` (up to ₹${maxDisc.toFixed(0)})` : ''}`;
  } else if (rawDiscountType === 'BUY_X_GET_Y') {
    rewardLabel = 'Buy & Get Reward';
  } else {
    rewardLabel = `₹${discountVal.toFixed(0)} FLAT OFF`;
  }

  const daysRemaining = progress?.daysRemaining ?? offer?.periodRule?.periodDays;

  // Build the list of steps for the roadmap
  const steps = Array.from({ length: targetCount }, (_, index) => {
    const stepNumber = index + 1;
    const isCompleted = stepNumber <= completedCount;
    const isCurrent = stepNumber === completedCount + 1 && !isUnlocked;
    const isLocked = stepNumber > completedCount + 1;
    const isFinal = stepNumber === targetCount;

    return {
      stepNumber,
      isCompleted,
      isCurrent,
      isLocked,
      isFinal,
    };
  });

  return (
    <View style={styles.container}>
      {/* Hero Challenge Banner */}
      <LinearGradient
        colors={['#0F3D2E', '#165B45', '#1B7358']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}
      >
        <View style={styles.badgeRow}>
          <View style={styles.challengeBadge}>
            <MaterialIcons name="military-tech" size={16} color="#FFD700" />
            <Text style={styles.challengeBadgeText}>MILESTONE CHALLENGE</Text>
          </View>
          {daysRemaining !== undefined && (
            <View style={styles.timerBadge}>
              <MaterialIcons name="schedule" size={14} color="#FFF" />
              <Text style={styles.timerBadgeText}>
                {daysRemaining} Days Left
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.heroTitle}>{offer.title || 'Exclusive Reward Quest'}</Text>
        {offer.description ? (
          <Text style={styles.heroSubtitle}>{offer.description}</Text>
        ) : (
          <Text style={styles.heroSubtitle}>
            Complete {targetCount} orders to unlock your {rewardLabel}!
          </Text>
        )}

        {/* Reward Pill Banner */}
        <View style={styles.rewardContainer}>
          <View style={styles.rewardLeft}>
            <View style={styles.trophyCircle}>
              <MaterialIcons
                name={isCashback ? 'account-balance-wallet' : 'emoji-events'}
                size={24}
                color="#FFD700"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardSub}>Grand Target Reward</Text>
              <Text style={styles.rewardMain}>{rewardLabel}</Text>
            </View>
          </View>
          {minOrderValue > 0 && (
            <View style={styles.minOrderTag}>
              <Text style={styles.minOrderTagText}>
                Min ₹{minOrderValue}/order
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Progress Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.summaryTitle}>Your Quest Progress</Text>
            <Text style={styles.summarySub}>
              {isUnlocked
                ? 'Congratulations! Reward unlocked for next purchase.'
                : remainingCount === 1
                ? 'Almost there! Just 1 order remaining.'
                : `Only ${remainingCount} orders away from unlocking!`}
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              isUnlocked ? styles.statusUnlocked : styles.statusInProgress,
            ]}
          >
            <MaterialIcons
              name={isUnlocked ? 'lock-open' : 'autorenew'}
              size={13}
              color={isUnlocked ? '#0F766E' : '#B45309'}
            />
            <Text
              style={[
                styles.statusText,
                isUnlocked ? styles.statusTextUnlocked : styles.statusTextInProgress,
              ]}
            >
              {isUnlocked ? 'UNLOCKED' : 'IN PROGRESS'}
            </Text>
          </View>
        </View>

        {/* Dynamic Progress Bar */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarTrack}>
            <LinearGradient
              colors={
                isUnlocked
                  ? ['#10B981', '#059669']
                  : [COLORS.primary, '#34D399']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <View style={styles.progressPercentRow}>
            <Text style={styles.progressCountText}>
              <Text style={styles.highlightCount}>{completedCount}</Text> of{' '}
              {targetCount} Orders Completed
            </Text>
            <Text style={styles.progressPercentText}>{progressPercent}%</Text>
          </View>
        </View>
      </View>

      {/* Gamified Roadmap Section */}
      <View style={styles.roadmapCard}>
        <View style={styles.roadmapHeader}>
          <MaterialIcons name="map" size={20} color={COLORS.primary} />
          <Text style={styles.roadmapTitle}>Order Journey Map</Text>
        </View>
        <Text style={styles.roadmapSubtitle}>
          Follow each milestone to reach the target reward
        </Text>

        <View style={styles.stepsContainer}>
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;

            return (
              <View key={step.stepNumber} style={styles.stepRow}>
                {/* Left: Timeline indicator and connector line */}
                <View style={styles.timelineColumn}>
                  <View
                    style={[
                      styles.nodeCircle,
                      step.isCompleted && styles.nodeCircleCompleted,
                      step.isCurrent && styles.nodeCircleCurrent,
                      step.isLocked && styles.nodeCircleLocked,
                    ]}
                  >
                    {step.isCompleted ? (
                      <MaterialIcons name="check" size={16} color="#FFF" />
                    ) : step.isFinal ? (
                      <MaterialIcons
                        name="stars"
                        size={18}
                        color={step.isCurrent ? COLORS.primary : '#9CA3AF'}
                      />
                    ) : step.isCurrent ? (
                      <View style={styles.currentInnerDot} />
                    ) : (
                      <MaterialIcons name="lock" size={14} color="#9CA3AF" />
                    )}
                  </View>

                  {!isLast && (
                    <View
                      style={[
                        styles.connectorLine,
                        step.isCompleted
                          ? styles.connectorCompleted
                          : styles.connectorPending,
                      ]}
                    />
                  )}
                </View>

                {/* Right: Milestone Info Box */}
                <View
                  style={[
                    styles.stepContent,
                    step.isCurrent && styles.stepContentActive,
                    step.isCompleted && styles.stepContentCompleted,
                  ]}
                >
                  <View style={styles.stepHeaderRow}>
                    <Text
                      style={[
                        styles.stepNumberLabel,
                        step.isCompleted && styles.stepNumberLabelCompleted,
                        step.isCurrent && styles.stepNumberLabelCurrent,
                      ]}
                    >
                      {step.isFinal
                        ? `Target Milestone (${step.stepNumber} Orders)`
                        : `Order #${step.stepNumber}`}
                    </Text>
                    {step.isCompleted && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>DONE</Text>
                      </View>
                    )}
                    {step.isCurrent && (
                      <View style={styles.nextTargetBadge}>
                        <Text style={styles.nextTargetBadgeText}>NEXT STEP</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.stepDesc}>
                    {step.isCompleted
                      ? 'Order counted towards periodic goal'
                      : step.isFinal
                      ? `Final milestone unlocks ${rewardLabel}`
                      : minOrderValue > 0
                      ? `Place order of min ₹${minOrderValue}`
                      : 'Place any qualifying order'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Rules & Guidelines */}
      <View style={styles.rulesCard}>
        <View style={styles.rulesHeader}>
          <MaterialIcons name="info-outline" size={18} color="#4B5563" />
          <Text style={styles.rulesTitle}>Challenge Terms & How It Works</Text>
        </View>
        <View style={styles.ruleItem}>
          <Text style={styles.ruleBullet}>•</Text>
          <Text style={styles.ruleText}>
            Each qualifying order (min. ₹{minOrderValue || 0}) advances your
            progress by 1 step.
          </Text>
        </View>
        <View style={styles.ruleItem}>
          <Text style={styles.ruleBullet}>•</Text>
          <Text style={styles.ruleText}>
            Progress updates automatically upon successful order delivery.
          </Text>
        </View>
        <View style={styles.ruleItem}>
          <Text style={styles.ruleBullet}>•</Text>
          <Text style={styles.ruleText}>
            Once unlocked, the {rewardLabel}{' '}
            {isCashback
              ? 'will be credited to your wallet upon completing qualifying orders.'
              : 'discount automatically applies to qualifying products on your subsequent order.'}
          </Text>
        </View>
        {daysRemaining !== undefined && (
          <View style={styles.ruleItem}>
            <Text style={styles.ruleBullet}>•</Text>
            <Text style={styles.ruleText}>
              Current cycle ends in {daysRemaining} days. Complete remaining
              orders before expiration!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
  },
  heroBanner: {
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  challengeBadgeText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#D1FAE5',
    lineHeight: 18,
    marginBottom: 16,
  },
  rewardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  rewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  trophyCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardSub: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '500',
  },
  rewardMain: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  minOrderTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  minOrderTagText: {
    color: '#FEF08A',
    fontSize: 11,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  summarySub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    maxWidth: SCREEN_WIDTH - 150,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusInProgress: {
    backgroundColor: '#FEF3C7',
  },
  statusUnlocked: {
    backgroundColor: '#CCFBF1',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextInProgress: {
    color: '#92400E',
  },
  statusTextUnlocked: {
    color: '#0F766E',
  },
  progressBarWrapper: {
    marginTop: 2,
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressPercentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  progressCountText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  highlightCount: {
    fontWeight: '800',
    color: COLORS.primary,
    fontSize: 15,
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  roadmapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  roadmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  roadmapTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  roadmapSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  stepsContainer: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineColumn: {
    alignItems: 'center',
    width: 32,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeCircleCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  nodeCircleCurrent: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.primary,
    borderWidth: 2.5,
  },
  nodeCircleLocked: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  currentInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  connectorLine: {
    width: 2,
    height: 42,
    marginVertical: -2,
    zIndex: 1,
  },
  connectorCompleted: {
    backgroundColor: '#10B981',
  },
  connectorPending: {
    backgroundColor: '#E5E7EB',
  },
  stepContent: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 16,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  stepContentActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  stepContentCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepNumberLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  stepNumberLabelCompleted: {
    color: '#065F46',
  },
  stepNumberLabelCurrent: {
    color: COLORS.primary,
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedBadgeText: {
    color: '#047857',
    fontSize: 9,
    fontWeight: '700',
  },
  nextTargetBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  nextTargetBadgeText: {
    color: '#B45309',
    fontSize: 9,
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: 11,
    color: '#6B7280',
  },
  rulesCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  rulesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  ruleBullet: {
    color: COLORS.primary,
    fontSize: 14,
    marginRight: 6,
    lineHeight: 18,
  },
  ruleText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
});
