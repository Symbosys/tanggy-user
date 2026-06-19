import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from './constants';

interface DeliveryOtpCardProps {
  deliveryOtp: string | undefined;
  isDelivered: boolean;
}

export const DeliveryOtpCard: React.FC<DeliveryOtpCardProps> = ({
  deliveryOtp,
  isDelivered,
}) => {
  if (!deliveryOtp || isDelivered) {
    return null;
  }

  return (
    <View style={[styles.card, styles.otpCard]}>
      <View style={styles.otpContent}>
        <MaterialCommunityIcons
          name="lock-open-outline"
          size={28}
          color="#22C55E"
          style={styles.lockIcon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.otpTitle}>Delivery Verification Code</Text>
          <Text style={styles.otpCode}>{deliveryOtp}</Text>
          <Text style={styles.otpSubtitle}>
            Share this OTP with the rider when they arrive to confirm delivery.
          </Text>
        </View>
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
  otpCard: {
    borderWidth: 1.5,
    borderColor: '#22C55E',
    overflow: 'hidden',
    padding: 16,
  },
  otpContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  lockIcon: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  otpTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  otpCode: {
    fontSize: 32,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 4,
    marginVertical: 4,
  },
  otpSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});
