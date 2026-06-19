import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from './constants';

interface StoreVendorCardProps {
  vendor: any;
}

export const StoreVendorCard: React.FC<StoreVendorCardProps> = ({ vendor }) => {
  if (!vendor) {
    return null;
  }

  const handleCall = () => {
    if (vendor.mobile) {
      Linking.openURL(`tel:${vendor.mobile}`).catch((err) =>
        console.error('Call failed', err)
      );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <View style={styles.vendorIconContainer}>
          <Ionicons name="storefront" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.cardTitle}>{vendor.shopName}</Text>
          <Text style={styles.cardSubtitle}>{vendor.ownerName || 'Store Manager'}</Text>
          <Text style={[styles.cardSubtitle, styles.addressText]}>{vendor.mainAddress}</Text>
        </View>
        {vendor.mobile && (
          <TouchableOpacity style={styles.callIconBtn} onPress={handleCall}>
            <Ionicons name="call" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  container: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(146, 53, 208, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  addressText: {
    marginTop: 4,
    fontSize: 12,
  },
  callIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(146, 53, 208, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
