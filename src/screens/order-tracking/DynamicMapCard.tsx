import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { OrderStatus } from '../../types/order.type';
import {
  CARD_MARGIN,
  CARD_WIDTH,
  COLORS,
  COORDINATES,
  EXPAND_SCROLL_Y,
  getStatusLabel,
  width,
} from './constants';

interface DynamicMapCardProps {
  status: OrderStatus | undefined;
  deliveredAt: string | Date | undefined;
  deliveryEtaMinutes: number | undefined;
  scrollY: Animated.Value;
  handleExpandMap: () => void;
  handleCollapseMap: () => void;
}

export const DynamicMapCard: React.FC<DynamicMapCardProps> = ({
  status,
  deliveredAt,
  deliveryEtaMinutes,
  scrollY,
  handleExpandMap,
  handleCollapseMap,
}) => {
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
          provider={PROVIDER_GOOGLE}
          style={styles.map}
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
});
