import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, getStatusLabel } from './constants';
import { OrderStatus } from '../../types/order.type';

interface StickyHeaderProps {
  navigation: any;
  status: OrderStatus | undefined;
  deliveryEtaMinutes: number | undefined;
  ongoingOrdersCount: number;
  setSwitchModalVisible: (visible: boolean) => void;
  stickyHeaderOpacity: Animated.Value | Animated.AnimatedInterpolation<number>;
}

export const StickyHeader: React.FC<StickyHeaderProps> = ({
  navigation,
  status,
  deliveryEtaMinutes,
  ongoingOrdersCount,
  setSwitchModalVisible,
  stickyHeaderOpacity,
}) => {
  return (
    <Animated.View style={[styles.stickyHeader, { opacity: stickyHeaderOpacity }]}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={() => navigation?.popToTop()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
          <Text style={styles.etaText}>
            {status === OrderStatus.DELIVERED
              ? 'Order Delivered'
              : `Arriving in ${deliveryEtaMinutes || '--'} mins`}
          </Text>
        </View>
      </View>

      {/* Switch Order Button */}
      {ongoingOrdersCount > 1 && (
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setSwitchModalVisible(true)}
        >
          <Text style={styles.switchButtonText}>SWITCH</Text>
          <Ionicons name="chevron-down" size={12} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  etaText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
});
