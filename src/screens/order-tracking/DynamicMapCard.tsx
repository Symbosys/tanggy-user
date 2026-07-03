import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Order, OrderStatus } from '../../types/order.type';
import {
  CARD_MARGIN,
  CARD_WIDTH,
  COLORS,
  Coordinate,
  COORDINATES,
  EXPAND_SCROLL_Y,
  getStatusLabel,
  width,
} from './constants';

interface DynamicMapCardProps {
  order: Order | undefined;
  deliveryLocation: { latitude: number; longitude: number } | null;
  scrollY: Animated.Value;
  handleExpandMap: () => void;
  handleCollapseMap: () => void;
}

export const DynamicMapCard: React.FC<DynamicMapCardProps> = ({
  order,
  deliveryLocation,
  scrollY,
  handleExpandMap,
  handleCollapseMap,
}) => {
  const status = order?.status;
  const deliveredAt = order?.timestamps?.deliveredAt;
  const deliveryEtaMinutes = order?.orderDeliveryAssignment?.deliveryEtaMinutes;

  // --- COORDINATES & REGION SETUP ---
  const rawUserLat = order?.address?.latitude != null ? Number(order.address.latitude) : NaN;
  const rawUserLng = order?.address?.longitude != null ? Number(order.address.longitude) : NaN;
  const userLat = !isNaN(rawUserLat) && rawUserLat !== 0 ? rawUserLat : COORDINATES.USER.latitude;
  const userLng = !isNaN(rawUserLng) && rawUserLng !== 0 ? rawUserLng : COORDINATES.USER.longitude;
  const userCoordinate = { latitude: userLat, longitude: userLng };

  const vendor = order?.orderVendorAssignments?.vendor;
  const rawVendorLat = vendor?.latitude != null ? Number(vendor.latitude) : NaN;
  const rawVendorLng = vendor?.longitude != null ? Number(vendor.longitude) : NaN;
  const vendorLat = !isNaN(rawVendorLat) && rawVendorLat !== 0 ? rawVendorLat : null;
  const vendorLng = !isNaN(rawVendorLng) && rawVendorLng !== 0 ? rawVendorLng : null;
  const hasVendor = vendorLat !== null && vendorLng !== null;
  const vendorCoordinate = hasVendor ? { latitude: vendorLat as number, longitude: vendorLng as number } : null;

  const hasDeliveryLoc = deliveryLocation && 
    deliveryLocation.latitude != null && 
    deliveryLocation.longitude != null && 
    !isNaN(deliveryLocation.latitude) && 
    !isNaN(deliveryLocation.longitude) &&
    deliveryLocation.latitude !== 0 &&
    deliveryLocation.longitude !== 0;

  const getTargetRegion = () => {
    const coords: Coordinate[] = [userCoordinate];
    if (hasVendor && vendorCoordinate) {
      coords.push(vendorCoordinate);
    }
    if (hasDeliveryLoc && deliveryLocation) {
      coords.push(deliveryLocation);
    }

    if (coords.length > 1) {
      let minLat = coords[0].latitude;
      let maxLat = coords[0].latitude;
      let minLng = coords[0].longitude;
      let maxLng = coords[0].longitude;

      for (let i = 1; i < coords.length; i++) {
        const c = coords[i];
        if (c && !isNaN(c.latitude) && !isNaN(c.longitude)) {
          if (c.latitude < minLat) minLat = c.latitude;
          if (c.latitude > maxLat) maxLat = c.latitude;
          if (c.longitude < minLng) minLng = c.longitude;
          if (c.longitude > maxLng) maxLng = c.longitude;
        }
      }

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const rawLatDelta = Math.abs(maxLat - minLat) * 1.8;
      const rawLngDelta = Math.abs(maxLng - minLng) * 1.8;
      const latDelta = Math.min(Math.max(rawLatDelta, 0.005), 0.015);
      const lngDelta = Math.min(Math.max(rawLngDelta, 0.005), 0.015);

      if (isNaN(centerLat) || isNaN(centerLng) || isNaN(latDelta) || isNaN(lngDelta)) {
        return {
          latitude: userLat,
          longitude: userLng,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        };
      }

      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      };
    } else {
      return {
        latitude: userLat,
        longitude: userLng,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      };
    }
  };

  const mapRef = React.useRef<MapView>(null);

  const recenterMap = () => {
    if (!mapRef.current) return;
    mapRef.current.animateToRegion(getTargetRegion(), 800);
  };

  // Trigger correct zoom on initial mount + when map size changes (expansion)
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      recenterMap();
    }, 300); // Small delay ensures map is fully rendered before animating

    return () => clearTimeout(timeout);
  }, [userLat, userLng, vendorLat, vendorLng, deliveryLocation !== null]);

  // Re-center when map expands (this fixes the zoomed-out state after scrolling)
  React.useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      if (value > 100) { // When map is significantly expanded
        recenterMap();
      }
    });

    return () => scrollY.removeListener(listener);
  }, [scrollY]);

  // --- ANIMATION INTERPOLATIONS ---
  const textOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const mapWidth = scrollY.interpolate({
    inputRange: [0, EXPAND_SCROLL_Y],
    outputRange: [110, width],
    extrapolate: 'clamp',
  });

  const mapHeight = scrollY.interpolate({
    inputRange: [0, EXPAND_SCROLL_Y],
    outputRange: [110, 320],
    extrapolate: 'clamp',
  });

  const cardHeight = scrollY.interpolate({
    inputRange: [0, EXPAND_SCROLL_Y],
    outputRange: [140, 320],
    extrapolate: 'clamp',
  });

  const initialMapX = CARD_WIDTH - 110 - 16;

  const mapTranslateX = scrollY.interpolate({
    inputRange: [0, EXPAND_SCROLL_Y],
    outputRange: [initialMapX, -CARD_MARGIN],
    extrapolate: 'clamp',
  });

  const mapTranslateY = scrollY.interpolate({
    inputRange: [0, EXPAND_SCROLL_Y],
    outputRange: [16, 0],
    extrapolate: 'clamp',
  });

  const expandIconOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const collapseIconOpacity = scrollY.interpolate({
    inputRange: [150, EXPAND_SCROLL_Y],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const formattedDeliveredTime = deliveredAt
    ? new Date(deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Done';

  return (
    <Animated.View style={[styles.dynamicCardContainer, { height: cardHeight }]}>
      {/* Static Text Layer */}
      <Animated.View style={[styles.staticTextLayer, { opacity: textOpacity }]}>
        <Text style={styles.packingText}>{getStatusLabel(status)}</Text>
        <Text style={styles.arrivingLabel}>
          {status === OrderStatus.DELIVERED ? 'Delivered at' : 'Arriving in'}
        </Text>
        <Text style={styles.arrivingTime}>
          {status === OrderStatus.DELIVERED
            ? formattedDeliveredTime
            : `${deliveryEtaMinutes || '--'} mins`}
        </Text>
      </Animated.View>

      {/* Animated Map Layer */}
      <Animated.View
        style={[
          styles.animatedMapWrapper,
          {
            width: mapWidth,
            height: mapHeight,
            transform: [{ translateX: mapTranslateX }, { translateY: mapTranslateY }],
          },
        ]}
      >
        {/* INTERACTIVE MAP */}
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={getTargetRegion()}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          showsUserLocation={false}
          showsCompass={false}
        >
          {hasVendor && vendorCoordinate && (
            <>
              <Polyline
                coordinates={[vendorCoordinate, userCoordinate]}
                strokeColor="black"
                strokeWidth={3}
              />
              <Marker coordinate={vendorCoordinate} title={vendor?.shopName || "Store"}>
                <View style={styles.markerStore}>
                  <Ionicons name="restaurant" size={14} color="white" />
                </View>
              </Marker>
            </>
          )}
          <Marker coordinate={userCoordinate} title="Delivery Location">
            <View style={styles.markerUser}>
              <Ionicons name="navigate" size={14} color="white" />
            </View>
          </Marker>
          {hasDeliveryLoc && deliveryLocation && (
            <Marker coordinate={deliveryLocation} title="Delivery Partner">
              <View style={styles.markerDelivery}>
                <Ionicons name="bicycle" size={14} color="white" />
              </View>
            </Marker>
          )}
        </MapView>

        <View style={styles.googleLogoContainer}>
          <Text style={styles.googleText}>Google</Text>
        </View>

        {/* RE-CENTER BUTTON */}
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={recenterMap}
          activeOpacity={0.7}
        >
          <MaterialIcons name="my-location" size={20} color="#555" />
        </TouchableOpacity>

        {/* EXPAND ICON */}
        <Animated.View
          style={[
            styles.iconContainer,
            { opacity: expandIconOpacity },
            { transform: [{ scale: expandIconOpacity }] },
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
            { transform: [{ scale: collapseIconOpacity }] },
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
  );
};

const styles = StyleSheet.create({
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
  packingText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  arrivingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  arrivingTime: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  animatedMapWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  map: {
    flex: 1,
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
  markerDelivery: {
    backgroundColor: '#FF9800',
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
  googleText: {
    color: '#808080',
    fontSize: 10,
    fontWeight: 'bold',
  },
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
  recenterButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
  },
});