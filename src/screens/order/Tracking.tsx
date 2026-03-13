import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  Linking,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// --- TYPES ---
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface BannerItem {
  id: string;
  image: string;
}

interface OrderOption {
  id: string;
  storeName: string;
  itemsCount: string;
  price: string;
  status: string;
}

const { width, height } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_WIDTH = width - CARD_MARGIN * 2;

import { COLORS as THEME_COLORS } from '../../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- UPDATED THEME COLORS ---
const COLORS = {
  ...THEME_COLORS,
  secondary: '#fbc02d',    // Yellow for Stars/Ratings
  blue: THEME_COLORS.primary,         // User Location (Matched to Primary)
  bg: THEME_COLORS.background,           // Default background
  black: '#000000',
  text: THEME_COLORS.textPrimary,         // Text Primary
  gray: THEME_COLORS.muted,         // Muted
  lightRed: '#FEE2E2',     // SOFT_RED (Alert Backgrounds)
  redText: '#b91c1c',      // RED (Alert Text)
  lightYellow: '#DBEAFE',  // SOFT_BLUE
  orange: THEME_COLORS.primary,       // Mapped to Primary
};

// --- COORDINATES FOR TRACKING (UNCHANGED) ---
const COORDINATES = {
  RESTAURANT: { latitude: 23.4345, longitude: 85.322 } as Coordinate,
  USER: { latitude: 23.4385, longitude: 85.328 } as Coordinate,
};

// --- BANNER DATA ---
const BANNER_DATA: BannerItem[] = [
  { id: '1', image: 'https://imgs.search.brave.com/zjheuudkVf3hS8K-sIylJ7ICB-uIyk2D8Ez9DKrW_rA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/dGhldGFrZW91dC5j/b20vaW1nL2dhbGxl/cnkvMTUtZGlzaGVz/LXByb2Zlc3Npb25h/bC1jaGVmcy1sb3Zl/LXRvLW9yZGVyLWF0/LXJlc3RhdXJhbnRz/L2ludHJvLTE3NTE2/MjI4NjQuanBn' },
  { id: '2', image: 'https://imgs.search.brave.com/bEIQSFJXnP5-0x1ncP74Ky2pNqfnjWdyijZEn6ceH9w/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/dGhldGFrZW91dC5j/b20vaW1nL2dhbGxl/cnkvMTUtZGlzaGVz/LXByb2Zlc3Npb25h/bC1jaGVmcy1sb3Zl/LXRvLW9yZGVyLWF0/LXJlc3RhdXJhbnRz/L3Rhc3RpbmctbWVu/dXMtMTc1MTYyMjg4/NC5qcGc' },
  { id: '3', image: 'https://imgs.search.brave.com/zjheuudkVf3hS8K-sIylJ7ICB-uIyk2D8Ez9DKrW_rA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/dGhldGFrZW91dC5j/b20vaW1nL2dhbGxl/cnkvMTUtZGlzaGVz/LXByb2Zlc3Npb25h/bC1jaGVmcy1sb3Zl/LXRvLW9yZGVyLWF0/LXJlc3RhdXJhbnRz/L2ludHJvLTE3NTE2/MjI4NjQuanBn' },
];

// --- ORDER ITEMS DATA ---
const ORDER_IMAGES = [
  'https://cdn.grofers.com/app/images/products/normal/pro_384788.jpg',
  'https://cdn.grofers.com/app/images/products/normal/pro_392767.jpg',
  'https://cdn.grofers.com/app/images/products/normal/pro_404832.jpg',
  'https://cdn.grofers.com/app/images/products/normal/pro_479860.jpg',
];

// --- TIP AMOUNTS ---
const TIP_AMOUNTS = [20, 30, 50, 100];

// --- DUMMY ORDERS FOR SWITCHING ---
const MY_ORDERS: OrderOption[] = [
  { id: 'ORD97573829895', storeName: 'Minta Store - Hinoo', itemsCount: '4 items', price: '₹342', status: 'Arriving in 14 mins' },
  { id: 'ORD88812345678', storeName: 'Minta Store - Lalpur', itemsCount: '2 items', price: '₹120', status: 'Packing' },
];

const BlinkitFinalClone = ({ navigation }: any) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  // Typed Refs
  const flatListRef = useRef<FlatList<BannerItem>>(null);
  const mainScrollViewRef = useRef<ScrollView>(null);

  // State for Banner Pagination
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // --- NEW STATES ---
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);

  // --- SWITCH ORDER STATES ---
  const [isSwitchModalVisible, setSwitchModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(MY_ORDERS[0].id);

  // --- HANDLERS ---
  const goToAddressScreen = () => {
    navigation?.navigate('SelectAddressScreen');
  };

  const goToSupportScreen = () => {
    navigation?.navigate('SupportScreen');
  };

  const openPhoneDialer = () => {
    Linking.openURL('tel:70506XXXXX');
  };

  // Switch Order Handler
  const handleSwitchOrder = (id: string) => {
    setSelectedOrderId(id);
    setSwitchModalVisible(false);
  };

  // --- AUTO SCROLL LOGIC ---
  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= BANNER_DATA.length) {
        nextIndex = 0; // Loop back to start
      }

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3000); // 3 Seconds

    return () => clearInterval(interval);
  }, [activeIndex]);

  // --- ANIMATION CONFIGURATION ---

  // FIX: Increased scroll target to 230 to hide banner completely under sticky header
  const EXPAND_SCROLL_Y = 230;

  const textOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const mapWidth = scrollY.interpolate({
    inputRange: [0, EXPAND_SCROLL_Y], // Updated range
    outputRange: [110, width],
    extrapolate: 'clamp',
  });

  const mapHeight = scrollY.interpolate({
    inputRange: [0, EXPAND_SCROLL_Y], // Updated range
    outputRange: [110, 320],
    extrapolate: 'clamp',
  });

  const cardHeight = scrollY.interpolate({
    inputRange: [0, EXPAND_SCROLL_Y], // Updated range
    outputRange: [140, 320],
    extrapolate: 'clamp',
  });

  const initialMapX = CARD_WIDTH - 110 - 16;

  const mapTranslateX = scrollY.interpolate({
    inputRange: [0, EXPAND_SCROLL_Y], // Updated range
    outputRange: [initialMapX, -CARD_MARGIN],
    extrapolate: 'clamp',
  });

  const mapTranslateY = scrollY.interpolate({
    inputRange: [0, EXPAND_SCROLL_Y], // Updated range
    outputRange: [16, 0],
    extrapolate: 'clamp',
  });

  // Sticky Header Fades in (Keep this starting earlier for smooth effect)
  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [120, 180],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const expandIconOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const collapseIconOpacity = scrollY.interpolate({
    inputRange: [150, EXPAND_SCROLL_Y], // Updated range
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const renderBannerItem = ({ item }: { item: BannerItem }) => (
    <View style={styles.bannerSlide}>
      <Image
        source={{ uri: item.image }}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <View style={styles.bannerOverlay} />
    </View>
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  const handleExpandMap = () => {
    // FIX: Scroll to 230 instead of 180
    (mainScrollViewRef.current as any)?.scrollTo({ y: EXPAND_SCROLL_Y, animated: true });
  };

  const handleCollapseMap = () => {
    (mainScrollViewRef.current as any)?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* --- STICKY HEADER --- */}
      <Animated.View
        style={[styles.stickyHeader, { opacity: stickyHeaderOpacity }]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => navigation?.popToTop()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={{ marginLeft: 16 }}>
            <Text style={{ color: 'white', fontSize: 12 }}>Packing your order</Text>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              Arriving in 14 minutes
            </Text>
          </View>
        </View>

        {/* Switch Order Button */}
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setSwitchModalVisible(true)}
        >
          <Text style={styles.switchButtonText}>SWITCH</Text>
          <Ionicons name="chevron-down" size={12} color={COLORS.primary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        ref={mainScrollViewRef as any}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
      >
        {/* --- HEADER SLIDER ANIMATION --- */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={BANNER_DATA}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={renderBannerItem}
            keyExtractor={(item) => item.id}
            onScroll={handleScroll}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
          <View style={styles.paginationContainer}>
            {BANNER_DATA.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === activeIndex ? COLORS.white : 'rgba(255,255,255,0.5)',
                    width: index === activeIndex ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* --- DYNAMIC MAP CARD --- */}
        <Animated.View
          style={[styles.dynamicCardContainer, { height: cardHeight }]}
        >
          {/* Static Text Layer */}
          <Animated.View
            style={[styles.staticTextLayer, { opacity: textOpacity }]}
          >
            <Text style={styles.packingText}>Packing your order</Text>
            <Text style={styles.arrivingLabel}>Arriving in</Text>
            <Text style={styles.arrivingTime}>14 minutes</Text>
          </Animated.View>

          {/* Animated Map Layer */}
          <Animated.View
            style={[
              styles.animatedMapWrapper,
              {
                width: mapWidth,
                height: mapHeight,
                transform: [
                  { translateX: mapTranslateX },
                  { translateY: mapTranslateY },
                ],
              },
            ]}
          >
            {/* INTERACTIVE MAP */}
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              initialRegion={{
                latitude: (COORDINATES.RESTAURANT.latitude + COORDINATES.USER.latitude) / 2,
                longitude: (COORDINATES.RESTAURANT.longitude + COORDINATES.USER.longitude) / 2,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              scrollEnabled={true}
              zoomEnabled={true}
              pitchEnabled={true}
              rotateEnabled={true}
              showsUserLocation={false}
              showsCompass={false}
            >
              <Polyline
                coordinates={[COORDINATES.RESTAURANT, COORDINATES.USER]}
                strokeColor="black"
                strokeWidth={3}
              />
              <Marker coordinate={COORDINATES.RESTAURANT} title="Restaurant">
                <View style={styles.markerStore}>
                  <Ionicons name="restaurant" size={14} color="white" />
                </View>
              </Marker>
              <Marker coordinate={COORDINATES.USER} title="You">
                <View style={styles.markerUser}>
                  <Ionicons name="navigate" size={14} color="white" />
                </View>
              </Marker>
            </MapView>

            <View style={styles.googleLogoContainer}>
              <Text style={styles.googleText}>Google</Text>
            </View>

            {/* EXPAND ICON */}
            <Animated.View
              style={[
                styles.iconContainer,
                { opacity: expandIconOpacity },
                { transform: [{ scale: expandIconOpacity }] }
              ]}
              pointerEvents="box-none"
            >
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleExpandMap}
                activeOpacity={0.7}
              >
                <MaterialIcons name="fullscreen" size={20} color="#555" />
              </TouchableOpacity>
            </Animated.View>

            {/* COLLAPSE ICON */}
            <Animated.View
              style={[
                styles.iconContainer,
                { opacity: collapseIconOpacity },
                { transform: [{ scale: collapseIconOpacity }] }
              ]}
              pointerEvents="box-none"
            >
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleCollapseMap}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={20} color="#555" />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </Animated.View>

        {/* Delivery Partner */}
        <View style={styles.card}>
          <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4662/4662927.png' }}
              style={{ width: 45, height: 45, marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>We are assigning a delivery</Text>
              <Text style={styles.cardTitle}>partner to deliver your order</Text>
            </View>
          </View>
          <View style={styles.divider} />
        </View>

        {/* Instructions */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setIsInstructionsOpen(!isInstructionsOpen)}
            activeOpacity={1}
          >
            <View style={styles.circleIcon}>
              <Ionicons name="mic-outline" size={20} color="#555" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardTitle}>Add delivery instructions</Text>
              <Text style={styles.cardSubtitle}>Help your delivery partner reach you faster</Text>
            </View>

            <TouchableOpacity onPress={() => setIsInstructionsOpen(!isInstructionsOpen)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons
                name={isInstructionsOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Collapsible Content */}
          {isInstructionsOpen && (
            <View style={styles.instructionContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={styles.instructionChip}>
                  <MaterialCommunityIcons name="bell-off-outline" size={18} color="#444" />
                  <Text style={styles.instructionText}>Avoid calling</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.instructionChip}>
                  <MaterialCommunityIcons name="door-closed" size={18} color="#444" />
                  <Text style={styles.instructionText}>Leave at door</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.instructionChip}>
                  <MaterialCommunityIcons name="security" size={18} color="#444" />
                  <Text style={styles.instructionText}>Security</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Delivery Details */}
        <View style={styles.card}>
          <View style={{ padding: 16, paddingBottom: 0 }}>
            <Text style={styles.cardTitle}>Your delivery details</Text>
          </View>

          <View
            style={[styles.row, { alignItems: 'flex-start' }]}
          >
            <Ionicons name="location-outline" size={24} color="#666" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.cardTitle}>Delivery at Home</Text>
              <Text style={styles.cardSubtitle}>
                Ravindra Srivastava, Virat Nagar, Near Darpan Beauty parlour,
                2nd Transfer, Iowadih, Namku...
              </Text>

              <TouchableOpacity onPress={goToAddressScreen}>
                <Text style={[styles.cardSubtitle, { color: COLORS.primary, marginTop: 4, fontWeight: '600' }]}>
                  Change address {'>'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.updateBanner}>
            <Text style={styles.updateText}>
              Now update your address effortlessly if you've ordered at an
              incorrect location
            </Text>
            <TouchableOpacity style={styles.okButton}>
              <Text style={styles.okText}>OK</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={openPhoneDialer}>
            <Text style={styles.phoneText}>Ravindra, 70506XXXXX</Text>
          </TouchableOpacity>
        </View>

        {/* Need Help */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={goToSupportScreen}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>support system</Text>
              <Text style={styles.cardSubtitle}>
                Chat with us about any issue related to your order
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <View style={{ padding: 16 }}>
            <Text style={styles.cardTitle}>Order summary</Text>
            <Text style={styles.orderId}>
              Order id: #ORD97573829895{' '}
              <Ionicons name="copy-outline" size={14} color="#666" />
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {ORDER_IMAGES.map((img, index) => (
                <View key={index} style={styles.scrollableItemContainer}>
                  <Image source={{ uri: img }} style={styles.itemImage} />
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyText}>1</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity style={styles.seeMoreContainer}>
                <Text style={styles.seeMoreText}>+2</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <TouchableOpacity style={{ padding: 16, paddingTop: 0 }}>
            <Text style={styles.viewSummary}>View order summary</Text>
          </TouchableOpacity>
        </View>

        {/* Rate and Review */}
        <View style={styles.card}>
          <View style={{ padding: 16 }}>
            <Text style={styles.cardTitle}>Rate and review</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
              {/* User Avatar */}
              <Image
                source={{ uri: 'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg' }}
                style={styles.avatar}
              />

              {/* Stars */}
              <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={rating >= star ? "star" : "star-outline"}
                      size={32}
                      color={rating >= star ? COLORS.secondary : "#666"}
                      style={{ marginHorizontal: 8 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* --- TIP DELIVERY PARTNER --- */}
        <View style={styles.card}>
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.cardTitle}>Tip your delivery partner</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              100% of your tip goes to your partner
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {TIP_AMOUNTS.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.tipChip,
                    selectedTip === amount && styles.selectedTipChip
                  ]}
                  onPress={() => setSelectedTip(amount === selectedTip ? null : amount)}
                >
                  <Text style={[
                    styles.tipText,
                    selectedTip === amount && styles.selectedTipText
                  ]}>₹{amount}</Text>
                  {selectedTip === amount && (
                    <View style={styles.selectedIcon}>
                      <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.tipChip}>
                <Text style={styles.tipText}>Custom</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

      </Animated.ScrollView>

      {/* --- SWITCH ORDER POPUP (MODAL) --- */}
      <Modal
        visible={isSwitchModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSwitchModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSwitchModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Order</Text>
            <TouchableOpacity onPress={() => setSwitchModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {MY_ORDERS.map((order) => {
            const isSelected = selectedOrderId === order.id;
            return (
              <TouchableOpacity
                key={order.id}
                style={[styles.orderOption, isSelected && styles.orderOptionSelected]}
                onPress={() => handleSwitchOrder(order.id)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {/* Radio Button */}
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>

                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.orderStore}>{order.storeName}</Text>
                    <Text style={styles.orderMeta}>{order.itemsCount} | {order.price}</Text>
                    <Text style={styles.orderStatus}>{order.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Sticky Header
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: COLORS.primary,
    zIndex: 100,
    paddingTop: 40,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Switch Button Styles
  switchButton: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 4,
  },

  // --- CAROUSEL / SLIDER STYLES ---
  carouselContainer: { height: 360, marginBottom: -40, position: 'relative' },
  bannerSlide: { width: width, height: 340 },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  paginationContainer: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  // --- DYNAMIC CARD ---
  dynamicCardContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  staticTextLayer: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  packingText: { fontSize: 13, color: '#666', fontWeight: '500' },
  arrivingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  arrivingTime: { fontSize: 26, fontWeight: '800', color: COLORS.primary },

  // Animated Map
  animatedMapWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  markerStore: {
    backgroundColor: COLORS.primary,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 2,
  },
  markerUser: {
    backgroundColor: COLORS.blue,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 2,
  },
  googleLogoContainer: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'white',
    paddingHorizontal: 5,
    borderRadius: 2,
  },
  googleText: { color: '#808080', fontSize: 10, fontWeight: 'bold' },

  // Icon Styles
  iconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  // Common Card Styles
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardSubtitle: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
  row: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  smallText: { fontSize: 12, color: COLORS.text },
  circleIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Delivery Details
  updateBanner: {
    backgroundColor: COLORS.lightYellow,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateText: { flex: 1, color: COLORS.orange, fontSize: 12 },
  okButton: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  okText: { color: 'white', fontWeight: 'bold' },
  phoneText: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Order Summary
  orderId: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  viewSummary: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  // --- STYLES FOR ORDER ITEMS SCROLL ---
  scrollableItemContainer: { marginRight: 12, position: 'relative' },
  itemImage: { width: 60, height: 60, borderRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  qtyBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: COLORS.white, paddingHorizontal: 6, borderRadius: 10, borderWidth: 1, borderColor: '#eee', elevation: 2 },
  qtyText: { fontSize: 10, fontWeight: 'bold', color: COLORS.primary },
  seeMoreContainer: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  seeMoreText: { fontSize: 16, fontWeight: 'bold', color: COLORS.gray },

  // --- STYLES FOR INSTRUCTIONS ---
  instructionContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  instructionChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#eee' },
  instructionText: { fontSize: 12, color: '#333', marginLeft: 6, fontWeight: '500' },

  // --- STYLES FOR RATING ---
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#eee'
  },
  starContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 16
  },

  // --- STYLES FOR TIP SECTION ---
  tipChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  selectedTipChip: {
    backgroundColor: '#E8F5E9',
    borderColor: COLORS.primary,
  },
  tipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  selectedTipText: {
    color: COLORS.primary
  },
  selectedIcon: {
    marginLeft: 4,
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 10
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 250,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  orderOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderOptionSelected: {
    backgroundColor: '#f9f9f9',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  orderStore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  orderMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderStatus: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  }
});

export default BlinkitFinalClone;