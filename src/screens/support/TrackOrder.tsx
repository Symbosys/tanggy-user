import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { AppNavigation } from '../../types/type';

const { width: screenWidth } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TrackOrder = ({ navigation }: AppNavigation) => {
  const insets = useSafeAreaInsets();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'Why is my order not moving?',
      answer:
        'Order status updates when our kitchen finishes preparing or the delivery partner reaches a new milestone. Live GPS tracking activates once the rider is on the way.',
    },
    {
      question: 'Can I change my delivery address?',
      answer:
        'Delivery addresses cannot be changed once an order is placed to ensure timely delivery. Please double-check your address before confirming your order.',
    },
    {
      question: 'What if my order is delayed?',
      answer:
        'Delivery times may vary due to traffic, weather, or rush hours. You can monitor the real-time ETA on the map, and our support team is available if you need help.',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation?.canGoBack?.()) {
              navigation.goBack();
            } else {
              navigation.navigate('BottomTab');
            }
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Icon name="chevron-left" size={26} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>How to Track Your Order</Text>
          <Text style={styles.headerSubtitle}>
            Follow your order in real-time, from our kitchen to your doorstep.
          </Text>
        </View>

        <Image
          source={require('../../assets/logo/LOGO.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
      >
        {/* Header Delivery Banner Card */}
        <View style={styles.bannerCard}>
          <Image
            source={require('../../assets/order/track/delivery.png')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* Steps to Track Your Order */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Steps to Track Your Order</Text>
          <Text style={styles.sectionSubtitle}>It's quick and easy!</Text>

          {/* Connected Step Circles Row */}
          <View style={styles.stepTopRow}>
            {/* Step 1 Circle */}
            <View style={styles.stepCircleWrap}>
              <View style={styles.stepIconCircle}>
                <Icon name="shopping-bag" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
            </View>

            {/* Dashed connector 1-2 */}
            <View style={styles.dashedLine} />

            {/* Step 2 Circle */}
            <View style={styles.stepCircleWrap}>
              <View style={styles.stepIconCircle}>
                <Icon name="touch-app" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
            </View>

            {/* Dashed connector 2-3 */}
            <View style={styles.dashedLine} />

            {/* Step 3 Circle */}
            <View style={styles.stepCircleWrap}>
              <View style={styles.stepIconCircle}>
                <Icon name="location-on" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
            </View>

            {/* Dashed connector 3-4 */}
            <View style={styles.dashedLine} />

            {/* Step 4 Circle */}
            <View style={styles.stepCircleWrap}>
              <View style={styles.stepIconCircle}>
                <Icon name="notifications-none" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
            </View>
          </View>

          {/* Step Text Labels Row */}
          <View style={styles.stepLabelsRow}>
            <View style={styles.stepLabelCol}>
              <Text style={styles.stepTitle}>Go to Orders</Text>
              <Text style={styles.stepDesc}>
                Open the My Orders section from your account.
              </Text>
            </View>

            <View style={styles.stepLabelCol}>
              <Text style={styles.stepTitle}>Select Order</Text>
              <Text style={styles.stepDesc}>
                Tap on the order you want to track.
              </Text>
            </View>

            <View style={styles.stepLabelCol}>
              <Text style={styles.stepTitle}>View Tracking</Text>
              <Text style={styles.stepDesc}>
                See real-time status and live location (if available).
              </Text>
            </View>

            <View style={styles.stepLabelCol}>
              <Text style={styles.stepTitle}>Get Notified</Text>
              <Text style={styles.stepDesc}>
                Receive updates at every important stage.
              </Text>
            </View>
          </View>
        </View>

        {/* Go to My Orders CTA Button */}
        <TouchableOpacity
          style={styles.ctaButtonWrapper}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaButtonGradient}
          >
            <Text style={styles.ctaButtonText}>Go to My Orders</Text>
            <View style={styles.ctaArrowCircle}>
              <Icon name="chevron-right" size={20} color={COLORS.primary} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Example: Order Tracking Card */}
        <View style={styles.exampleCard}>
          {/* Card Header */}
          <View style={styles.exampleHeader}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.exampleTitle}>Example: Order Tracking</Text>
              <Text style={styles.exampleSubtitle}>
                Here's how your order tracking looks:
              </Text>
            </View>
            <View style={styles.orderIdPill}>
              <Text style={styles.orderIdText}>#TG123456</Text>
            </View>
          </View>

          {/* Timeline & Map Row */}
          <View style={styles.exampleBody}>
            {/* Timeline Column */}
            <View style={styles.timelineCol}>
              {/* Item 1: Order Placed */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineIndicator}>
                  <View style={styles.completedDot}>
                    <Icon name="check" size={13} color={COLORS.white} />
                  </View>
                  <View style={styles.completedLine} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Order Placed</Text>
                  <Text style={styles.timelineTime}>12 Sep 2025, 10:30 AM</Text>
                  <Text style={styles.timelineSub}>Your order has been confirmed.</Text>
                </View>
              </View>

              {/* Item 2: Preparing */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineIndicator}>
                  <View style={styles.completedDot}>
                    <Icon name="check" size={13} color={COLORS.white} />
                  </View>
                  <View style={styles.completedLine} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Preparing</Text>
                  <Text style={styles.timelineTime}>12 Sep 2025, 11:00 AM</Text>
                  <Text style={styles.timelineSub}>Your food is being prepared.</Text>
                </View>
              </View>

              {/* Item 3: Out for Delivery */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineIndicator}>
                  <View style={styles.activeDot}>
                    <Icon name="delivery-dining" size={15} color={COLORS.white} />
                  </View>
                  <View style={styles.pendingLine} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Out for Delivery</Text>
                  <Text style={styles.timelineTime}>12 Sep 2025, 12:20 PM</Text>
                  <Text style={styles.timelineSub}>Your order is on the way.</Text>
                </View>
              </View>

              {/* Item 4: Delivered */}
              <View style={styles.timelineItem}>
                <View style={styles.timelineIndicator}>
                  <View style={styles.pendingDot} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelinePendingTitle}>Delivered</Text>
                  <Text style={styles.timelineSub}>Estimated by 1:00 PM</Text>
                </View>
              </View>
            </View>

            {/* Map Column */}
            <View style={styles.mapCol}>
              <Image
                source={require('../../assets/order/track/map.png')}
                style={styles.mapImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* Common Questions Section */}
        <View style={styles.faqSection}>
          <View style={styles.faqHeader}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.sectionTitle}>Common Questions</Text>
              <Text style={styles.sectionSubtitle}>
                Find quick answers to frequently asked questions about order tracking.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('HelpSupport')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.viewAllBtn}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Icon name="chevron-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {faqs.map((item, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <View key={index} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqQuestionRow}
                  activeOpacity={0.7}
                  onPress={() => toggleFaq(index)}
                >
                  <View style={styles.faqQuestionLeft}>
                    <View style={styles.faqQuestionIconWrap}>
                      <Icon name="help-outline" size={14} color={COLORS.primary} />
                    </View>
                    <Text style={styles.faqQuestionText}>{item.question}</Text>
                  </View>
                  <Icon
                    name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={20}
                    color={COLORS.muted}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.faqAnswerWrap}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Support Banner Card */}
        <View style={styles.supportCard}>
          <View style={styles.supportLeft}>
            <View style={styles.supportIconCircle}>
              <Icon name="headset-mic" size={22} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Still need help?</Text>
              <Text style={styles.supportSubtitle}>
                Our support team is here for you 24/7.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.contactSupportBtn}
            onPress={() => navigation.navigate('AiAssistant')}
            activeOpacity={0.8}
          >
            <Text style={styles.contactSupportText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.highlight,
  },
  headerTitleCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
    lineHeight: 15,
  },
  logoImage: {
    width: 72,
    height: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },

  // ── Delivery Banner Card ──
  bannerCard: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 20,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: COLORS.secondary,
  },
  bannerImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1958 / 803,
  },

  // ── Steps Section ──
  stepsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
    marginBottom: 16,
  },
  stepTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  stepCircleWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  stepIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    borderWidth: 1.2,
    borderColor: COLORS.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberBadge: {
    position: 'absolute',
    bottom: -6,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: 9.5,
    fontWeight: '800',
  },
  dashedLine: {
    flex: 1,
    height: 0,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.accent,
    borderStyle: 'dashed',
    marginHorizontal: 6,
    marginBottom: 6,
  },
  stepLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepLabelCol: {
    width: (screenWidth - 44) / 4,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: 9.5,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 13,
  },

  // ── Go to Orders CTA Button ──
  ctaButtonWrapper: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 22,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
  },
  ctaButtonGradient: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  ctaButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  ctaArrowCircle: {
    position: 'absolute',
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Example Order Tracking Card ──
  exampleCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    elevation: 2,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  exampleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  exampleSubtitle: {
    fontSize: 11.5,
    color: COLORS.muted,
    marginTop: 2,
  },
  orderIdPill: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.highlight,
  },
  orderIdText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  exampleBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineCol: {
    flex: 1.15,
    paddingRight: 6,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIndicator: {
    alignItems: 'center',
    width: 24,
    marginRight: 8,
  },
  completedDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.muted,
    backgroundColor: COLORS.surface,
  },
  completedLine: {
    width: 2,
    height: 18,
    backgroundColor: COLORS.success,
    marginVertical: 2,
  },
  pendingLine: {
    width: 2,
    height: 18,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 4,
  },
  timelineTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  timelinePendingTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timelineTime: {
    fontSize: 9.5,
    color: COLORS.muted,
    marginTop: 1,
  },
  timelineSub: {
    fontSize: 9.5,
    color: COLORS.muted,
    marginTop: 1,
    lineHeight: 12,
  },
  mapCol: {
    flex: 1,
    height: 165,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.secondary,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },

  // ── Common Questions Section ──
  faqSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 2,
  },
  faqCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  faqQuestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  faqQuestionIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  faqQuestionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  faqAnswerWrap: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  faqAnswerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // ── Support Card ──
  supportCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.highlight,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  supportIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  supportTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  supportSubtitle: {
    fontSize: 10.5,
    color: COLORS.muted,
    marginTop: 2,
  },
  contactSupportBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.2,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  contactSupportText: {
    color: COLORS.primary,
    fontSize: 11.5,
    fontWeight: '800',
  },
});

export default TrackOrder;