import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../theme/theme';
import { NormalOfferHeader } from '../../components/offers/NormalOfferHeader';
import { PeriodicOfferProgressMap } from '../../components/offers/PeriodicOfferProgressMap';
import { OfferProductsSection } from '../../components/offers/OfferProductsSection';
import UnifiedFloatingBar from '../../components/order/UnifiedFloatingBar';
import { useGetAvailableOffers } from '../../api/hooks/offer.hook';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../store/cart';

export const OfferDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { offerId, offer: initialOffer } = route.params || {};

  const { isAuthenticated } = useAuth();
  const { cartItems, totalItems } = useCartStore();
  const hasCartItems = totalItems > 0 || (cartItems && cartItems.length > 0);

  const [refreshing, setRefreshing] = useState(false);

  // Fetch latest available customer offers (which contain userPeriodProgress)
  const {
    data: availableOffers,
    isLoading: isOffersLoading,
    refetch,
  } = useGetAvailableOffers();

  // Automatically refresh whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Find live offer matching offerId
  const liveOffer = useMemo(() => {
    if (!availableOffers || !offerId) return null;
    return availableOffers.find(
      (o) => String(o.id) === String(offerId) || String(o.uuid) === String(offerId)
    );
  }, [availableOffers, offerId]);

  // Merge live offer details with any passed initial offer
  const resolvedOffer = useMemo(() => {
    return {
      ...(initialOffer || {}),
      ...(liveOffer || {}),
      periodRule: liveOffer?.periodRule || initialOffer?.periodRule,
      userPeriodProgress:
        liveOffer?.userPeriodProgress || initialOffer?.userPeriodProgress,
    };
  }, [initialOffer, liveOffer]);

  // Determine whether this is a periodic offer
  const isPeriodOffer = useMemo(() => {
    return (
      Boolean(resolvedOffer?.isPeriodOffer) ||
      resolvedOffer?.type === 'PERIODIC' ||
      Boolean(resolvedOffer?.periodRule)
    );
  }, [resolvedOffer]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleShare = async () => {
    try {
      const title = resolvedOffer?.title || 'Special Offer';
      const code =
        resolvedOffer?.code ||
        resolvedOffer?.codes?.[0]?.code ||
        '';
      const message = code
        ? `Check out this deal on Minta Fresh: ${title}! Use promo code "${code}" to save big!`
        : `Check out this deal on Minta Fresh: ${title}! Download the app to grab it!`;

      await Share.share({
        message,
        title,
      });
    } catch (error) {
      // ignore
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isPeriodOffer ? 'Milestone Quest' : 'Offer Details'}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {resolvedOffer?.title || 'Special Promotion'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleShare}
          style={styles.shareButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="share" size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Conditional Header: Gamified Journey for Periodic, or Promo Hero for Normal */}
        {isPeriodOffer ? (
          isOffersLoading && !resolvedOffer?.periodRule ? (
            <View style={styles.loadingHeader}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <PeriodicOfferProgressMap
              offer={resolvedOffer}
              progress={resolvedOffer?.userPeriodProgress}
            />
          )
        ) : (
          <NormalOfferHeader offer={resolvedOffer} />
        )}

        {/* Applicable Products Section */}
        <OfferProductsSection
          offerId={offerId}
          isPeriodOffer={isPeriodOffer}
        />
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      {(isAuthenticated || hasCartItems) && (
        <UnifiedFloatingBar
          hasBottomTab={false}
          onCartPress={() => navigation.navigate('Cart')}
        />
      )}
    </SafeAreaView>
  );
};

export default OfferDetailsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 120, // Leave room for UnifiedFloatingBar
  },
  loadingHeader: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
