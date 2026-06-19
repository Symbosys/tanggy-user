import React from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from './constants';

interface DeliveryPartnerCardProps {
  deliveryPartner: any;
}

export const DeliveryPartnerCard: React.FC<DeliveryPartnerCardProps> = ({
  deliveryPartner,
}) => {
  const imageSource = typeof deliveryPartner?.image === 'string'
    ? deliveryPartner.image
    : deliveryPartner?.image?.url || 'https://cdn-icons-png.flaticon.com/512/4662/4662927.png';

  const handleCall = () => {
    if (deliveryPartner?.mobile) {
      Linking.openURL(`tel:${deliveryPartner.mobile}`).catch((err) =>
        console.error('Call failed', err)
      );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <Image source={{ uri: imageSource }} style={styles.avatar} />
        <View style={styles.infoContainer}>
          <Text style={styles.cardTitle}>
            {deliveryPartner?.name
              ? `${deliveryPartner.name} is on the way`
              : 'We are assigning a delivery partner'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {deliveryPartner?.name
              ? 'Delivery Professional'
              : 'Your delivery partner will reach you soon'}
          </Text>
          {deliveryPartner?.mobile && (
            <Text style={[styles.cardSubtitle, styles.mobileText]}>
              {deliveryPartner.mobile}
            </Text>
          )}
        </View>
        {deliveryPartner?.mobile && (
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
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  infoContainer: {
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
  mobileText: {
    marginTop: 4,
    fontWeight: '700',
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
