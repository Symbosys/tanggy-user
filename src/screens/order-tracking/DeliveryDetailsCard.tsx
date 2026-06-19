import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from './constants';

interface DeliveryDetailsCardProps {
  address: any;
  openPhoneDialer: () => void;
}

export const DeliveryDetailsCard: React.FC<DeliveryDetailsCardProps> = ({
  address,
  openPhoneDialer,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>Your delivery details</Text>
      </View>

      <View style={[styles.row, styles.alignStart]}>
        <Ionicons name="location-outline" size={24} color="#666" />
        <View style={styles.addressContainer}>
          <Text style={styles.cardTitle}>Delivery at Home</Text>
          <Text style={styles.cardSubtitle}>
            {address?.receiverName}, {address?.completeAddress}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={openPhoneDialer}>
        <Text style={styles.phoneText}>
          {address?.receiverName || 'Receiver'}
        </Text>
      </TouchableOpacity>
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
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  row: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  addressContainer: {
    marginLeft: 12,
    flex: 1,
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
  phoneText: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
