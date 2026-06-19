import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from './constants';

interface OrderSummaryCardProps {
  orderNumber: string | undefined;
  orderId: string | undefined;
  items: any[] | undefined;
  navigation: any;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  orderNumber,
  orderId,
  items,
  navigation,
}) => {
  const handleViewSummary = () => {
    if (orderId) {
      navigation.navigate('OrderDetails', { orderId: orderId.toString() });
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>Order summary</Text>
        <Text style={styles.orderIdText}>
          Order id: #{orderNumber || '--'}{' '}
          <Ionicons name="copy-outline" size={14} color="#666" />
        </Text>
      </View>

      <View style={styles.scrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {items?.map((item, index) => (
            <View key={index} style={styles.scrollableItemContainer}>
              <Image
                source={{
                  uri:
                    item.product?.images?.[0]?.image?.url ||
                    'https://via.placeholder.com/150',
                }}
                style={styles.itemImage}
              />
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>{item.quantity}</Text>
              </View>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product?.name}
              </Text>
              <Text style={styles.itemWeight}>{item.notes || ''}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.viewSummaryButton} onPress={handleViewSummary}>
        <Text style={styles.viewSummaryText}>View order summary</Text>
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
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  orderIdText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  scrollContainer: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  scrollableItemContainer: {
    marginRight: 16,
    position: 'relative',
    width: 80,
    alignItems: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  qtyBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    zIndex: 1,
  },
  qtyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  itemName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 6,
    textAlign: 'center',
  },
  itemWeight: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 2,
  },
  viewSummaryButton: {
    padding: 16,
    paddingTop: 0,
  },
  viewSummaryText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
