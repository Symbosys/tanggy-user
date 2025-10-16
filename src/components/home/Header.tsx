import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/theme';

const HeaderAddress: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="home" size={24} color={COLORS.highlight} />
          <Text style={styles.headerTitle}>Home</Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.textPrimary} />
        </View>
        <View style={styles.headerRight}>
          <MaterialCommunityIcons name="lightning-bolt" size={16} color={COLORS.highlight} />
          <Text style={styles.deliveryText}>Delivery</Text>
        </View>
      </View>
      <View style={styles.addressContainer}>
        <Text style={styles.addressText}>dvdf, dvd, x cddd, Koramanga...</Text>
        <Text style={styles.deliveryTime}>in 30 mins</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white, // #ffffff
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white, // #ffffff
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 4,
    color: COLORS.textPrimary, // #222222
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 14,
    color: COLORS.textPrimary, // #222222
    marginLeft: 4,
  },
  addressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  addressText: {
    fontSize: 12,
    color: COLORS.muted, // #888888
  },
  deliveryTime: {
    fontSize: 12,
    color: COLORS.highlight, // #ff9fa3
    textAlign: 'right',
    marginTop: -16,
  },
});

export default HeaderAddress;