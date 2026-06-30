import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Ads from '../../components/order/Ads';
import { useQueryClient } from '@tanstack/react-query';
import { useOrderDetails, useOrders } from '../../api/hooks/useOrder';
import { OrderStatus } from '../../types/order.type';

import { COLORS, EXPAND_SCROLL_Y } from './constants';
import { StickyHeader } from './StickyHeader';
import { DynamicMapCard } from './DynamicMapCard';
import { DeliveryOtpCard } from './DeliveryOtpCard';
import { DeliveryPartnerCard } from './DeliveryPartnerCard';
import { StoreVendorCard } from './StoreVendorCard';
import { DeliveryDetailsCard } from './DeliveryDetailsCard';
import { SupportSystemCard } from './SupportSystemCard';
import { OrderSummaryCard } from './OrderSummaryCard';
import { RateReviewCard } from './RateReviewCard';
import { SwitchOrderModal } from './SwitchOrderModal';
import { wsService } from '../../socket/websocket.service';
import { EVENT_TYPES } from '../../constants/event.constant';
import { handleOrderAccepted } from '../../socket/handlers/order.handler';

const BlinkitFinalClone = ({ navigation, route }: any) => {
  const { id: initialId, orderNumber: initialOrderNumber } = route.params || {};
  const [currentId, setCurrentId] = useState(initialId);
  const [currentOrderNumber, setCurrentOrderNumber] = useState(initialOrderNumber);

  const queryClient = useQueryClient();

  const queryParams = currentId ? { id: currentId } : { orderNumber: currentOrderNumber };
  const { data: order, isLoading, refetch } = useOrderDetails(queryParams);

  // Fetch all ongoing orders for switching
  const { data: ongoingOrderData } = useOrders({
    page: 1,
    limit: 10,
    statusType: 'ongoing',
  });

  const ongoingOrders = ongoingOrderData?.orders || [];

  const vendor = order?.orderVendorAssignments?.vendor;
  const deliveryAssignment = order?.orderDeliveryAssignment;
  const deliveryPartner = deliveryAssignment?.deliveryPartner;

  const scrollY = useRef(new Animated.Value(0)).current;
  const mainScrollViewRef = useRef<ScrollView>(null);

  // --- STATES ---
  const [rating, setRating] = useState(0);
  const [isSwitchModalVisible, setSwitchModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Initialize/sync deliveryLocation state from API's lastKnownLocation on order change
  useEffect(() => {
    if (order?.lastKnownLocation) {
      setDeliveryLocation({
        latitude: Number(order.lastKnownLocation.latitude),
        longitude: Number(order.lastKnownLocation.longitude),
      });
    } else {
      setDeliveryLocation(null);
    }
  }, [order?.id, order?.lastKnownLocation]);

  // --- WEB SOCKET EVENT LISTENERS ---
  useEffect(() => {
    const handleWsEvent = (event: any) => {
      console.log('📬 WebSocket event received on tracking screen:', event);
      const eventOrderId = event?.data?.orderId;
      const eventOrderNumber = event?.data?.orderNumber;

      // Invalidate if the event refers to the current order being tracked
      const isMatchingId = currentId && String(eventOrderId) === String(currentId);
      const isMatchingNumber = currentOrderNumber && String(eventOrderNumber) === String(currentOrderNumber);
      const isMatchingFetchedId = order?.id && String(eventOrderId) === String(order.id);
      const isMatchingFetchedNumber = order?.orderNumber && String(eventOrderNumber) === String(order.orderNumber);

      if (isMatchingId || isMatchingNumber || isMatchingFetchedId || isMatchingFetchedNumber) {
        console.log('🔄 Match found, invalidating order details query cache');
        queryClient.invalidateQueries({ queryKey: ['order-details'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    };

    const handleLocationUpdate = (event: any) => {
      console.log('📬 WebSocket location update event received on tracking screen:', event);
      const eventOrderId = event?.orderId || event?.data?.orderId;
      const isMatchingId = currentId && String(eventOrderId) === String(currentId);
      const isMatchingFetchedId = order?.id && String(eventOrderId) === String(order.id);

      if (isMatchingId || isMatchingFetchedId) {
        const lat = event?.lat !== undefined ? Number(event.lat) : (event?.data?.lat !== undefined ? Number(event.data.lat) : null);
        const lng = event?.lng !== undefined ? Number(event.lng) : (event?.data?.lng !== undefined ? Number(event.data.lng) : null);

        if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
          console.log(`📍 Updating delivery partner location state: lat=${lat}, lng=${lng}`);
          setDeliveryLocation({
            latitude: lat,
            longitude: lng,
          });
        }
      }
    };

    // Register listeners for all tracking events
    const eventsToListen = [
      EVENT_TYPES.ORDER_PREPARING,
      EVENT_TYPES.ORDER_READY_FOR_PICKUP,
      EVENT_TYPES.DELIVERY_ACCEPTED,
      EVENT_TYPES.ORDER_PICKED_UP,
      EVENT_TYPES.ORDER_DELIVERED,
    ];

    eventsToListen.forEach((eventType) => {
      wsService.on(eventType, handleWsEvent);
    });

    wsService.on("location_update", handleLocationUpdate);

    return () => {
      eventsToListen.forEach((eventType) => {
        wsService.off(eventType, handleWsEvent);
      });
      wsService.off("location_update", handleLocationUpdate);
    };
  }, [currentId, currentOrderNumber, order?.id, order?.orderNumber, queryClient]);



  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading tracking details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.goBackButton}
        >
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- HANDLERS ---
  const openPhoneDialer = () => {
    Linking.openURL('tel:70506XXXXX');
  };

  const handleSwitchOrder = (id: string, orderNumber: string) => {
    setCurrentId(id);
    setCurrentOrderNumber(orderNumber);
    setSwitchModalVisible(false);
  };

  const handleExpandMap = () => {
    (mainScrollViewRef.current as any)?.scrollTo({ y: EXPAND_SCROLL_Y, animated: true });
  };

  const handleCollapseMap = () => {
    (mainScrollViewRef.current as any)?.scrollTo({ y: 0, animated: true });
  };

  // Sticky Header Fades in
  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [120, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <StickyHeader
        navigation={navigation}
        status={order?.status}
        deliveryEtaMinutes={deliveryAssignment?.deliveryEtaMinutes}
        ongoingOrdersCount={ongoingOrders.length}
        setSwitchModalVisible={setSwitchModalVisible}
        stickyHeaderOpacity={stickyHeaderOpacity}
      />

      <Animated.ScrollView
        ref={mainScrollViewRef as any}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <Ads />

        {/* Dynamic Map Card */}
        <DynamicMapCard
          order={order}
          deliveryLocation={deliveryLocation}
          scrollY={scrollY}
          handleExpandMap={handleExpandMap}
          handleCollapseMap={handleCollapseMap}
        />

        {/* OTP Card */}
        <DeliveryOtpCard
          deliveryOtp={deliveryAssignment?.deliveryOtp}
          isDelivered={order?.status === OrderStatus.DELIVERED}
        />

        {/* Delivery Partner */}
        <DeliveryPartnerCard deliveryPartner={deliveryPartner} />

        {/* Store/Vendor Details */}
        <StoreVendorCard vendor={vendor} />

        {/* Delivery Details */}
        <DeliveryDetailsCard
          address={order?.address}
          openPhoneDialer={openPhoneDialer}
        />

        {/* Support System */}
        <SupportSystemCard navigation={navigation} />

        {/* Order Summary */}
        <OrderSummaryCard
          orderNumber={order?.orderNumber}
          orderId={order?.id?.toString()}
          items={order?.items}
          navigation={navigation}
        />

        {/* Rate and Review */}
        <RateReviewCard rating={rating} setRating={setRating} />
      </Animated.ScrollView>

      {/* Switch Order Popup */}
      <SwitchOrderModal
        isVisible={isSwitchModalVisible}
        onClose={() => setSwitchModalVisible(false)}
        ongoingOrders={ongoingOrders}
        currentId={currentId}
        currentOrderNumber={currentOrderNumber}
        handleSwitchOrder={handleSwitchOrder}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  loadingText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  errorText: {
    color: COLORS.redText,
    fontWeight: 'bold',
  },
  goBackButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  goBackText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BlinkitFinalClone;