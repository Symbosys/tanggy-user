import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from './constants';

const { width } = Dimensions.get('window');

interface OrderDeliveredScreenProps {
  order: any;
  navigation: any;
}

export const OrderDeliveredScreen: React.FC<OrderDeliveredScreenProps> = ({
  order,
  navigation,
}) => {
  const items = order?.items || [];
  const address = order?.address;
  const deliveryPartner = order?.orderDeliveryAssignment?.deliveryPartner;

  // Hiding courier details if delivered more than 30 minutes ago
  const deliveredAtTime = new Date(order.timestamps?.deliveredAt || order.updatedAt).getTime();
  const isDeliveredOver30Min = (new Date().getTime() - deliveredAtTime) > 30 * 60 * 1000;

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'BottomTab' }],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#9235D0" translucent={false} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Gradient Celebration */}
        <LinearGradient
          colors={['#9235D0', '#7b2bb3']}
          style={styles.headerGradient}
        >
          {/* Close button to quickly go home */}
          <TouchableOpacity style={styles.closeButton} onPress={handleGoHome}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* Lottie animation */}
          <View style={styles.animationWrapper}>
            <LottieView
              source={require('../../assets/lottie/Green_tick.json')}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
          </View>

          <Text style={styles.headerTitle}>Order Delivered!</Text>
          <Text style={styles.headerSubtitle}>
            Your fresh products reached you successfully. Enjoy your order! 💜
          </Text>

          <View style={styles.orderIdBadge}>
            <Text style={styles.orderIdText}>Order #{order?.orderNumber || 'ORD-58934'}</Text>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* 1. Items Delivered Section */}
          {items.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Delivered Items</Text>
                <Text style={styles.cardBadge}>{items.length} {items.length === 1 ? 'item' : 'items'}</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.itemsScrollContent}
              >
                {items.map((item: any, idx: number) => {
                  const imageUrl = item.product?.images?.[0]?.image?.url || 'https://via.placeholder.com/150';
                  return (
                    <View key={idx} style={styles.itemContainer}>
                      <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUrl }} style={styles.productImage} />
                        <View style={styles.qtyBadge}>
                          <Text style={styles.qtyText}>x{item.quantity}</Text>
                        </View>
                      </View>
                      <Text style={styles.productName} numberOfLines={1}>
                        {item.product?.name || 'Fresh item'}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* 2. Delivery Partner details (Hidden if delivered > 30 minutes ago) */}
          {deliveryPartner && !isDeliveredOver30Min && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Delivery Executive</Text>
              <View style={styles.partnerRow}>
                <Image
                  source={{
                    uri: deliveryPartner?.image?.url || 'https://cdn-icons-png.flaticon.com/512/4662/4662927.png'
                  }}
                  style={styles.partnerAvatar}
                />
                <View style={styles.partnerInfo}>
                  <Text style={styles.partnerName}>
                    {deliveryPartner?.name || 'Delivery Professional'}
                  </Text>
                  <Text style={styles.partnerSubtitle}>
                    Verified Rider • Minta Fresh Partner
                  </Text>
                </View>
                <View style={styles.deliveredBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success || '#4CAF50'} />
                  <Text style={styles.deliveredBadgeText}>Delivered</Text>
                </View>
              </View>
            </View>
          )}

          {/* 3. Address details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivered to</Text>
            <View style={styles.addressRow}>
              <View style={styles.addressIconWrapper}>
                <Ionicons name="home" size={18} color="#9235D0" />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>
                  {address?.receiverName || 'Home Address'}
                </Text>
                <Text style={styles.addressText} numberOfLines={2}>
                  {address?.completeAddress || 'No address specified'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Persistent Bottom Action Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleGoHome}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#9235D0', '#b58ff0']}
            style={styles.homeButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" style={styles.homeButtonIcon} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  animationWrapper: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  lottie: {
    width: 90,
    height: 90,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 15,
    lineHeight: 20,
    marginBottom: 16,
  },
  orderIdBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  orderIdText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // Shadows for iOS
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Shadows for Android
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9235D0',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemsScrollContent: {
    paddingRight: 16,
  },
  itemContainer: {
    width: 75,
    marginRight: 16,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 6,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  qtyBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#9235D0',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  qtyText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  productName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4A4A4A',
    textAlign: 'center',
    width: '100%',
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E1BEE7',
  },
  partnerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222222',
  },
  partnerSubtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  deliveredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deliveredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
    marginLeft: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  addressIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
  },
  addressText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
  },
  homeButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  homeButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  homeButtonIcon: {
    marginLeft: 8,
  },
});
