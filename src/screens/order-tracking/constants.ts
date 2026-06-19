import { Dimensions } from 'react-native';
import { COLORS as THEME_COLORS } from '../../theme/theme';
import { OrderStatus } from '../../types/order.type';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export const { width, height } = Dimensions.get('window');
export const CARD_MARGIN = 12;
export const CARD_WIDTH = width - CARD_MARGIN * 2;
export const EXPAND_SCROLL_Y = 230;

export const COLORS = {
  ...THEME_COLORS,
  secondary: '#fbc02d',    // Yellow for Stars/Ratings
  blue: THEME_COLORS.primary,         // User Location (Matched to Primary)
  bg: THEME_COLORS.background,           // Default background
  black: '#000000',
  text: THEME_COLORS.textPrimary,         // Text Primary
  gray: THEME_COLORS.muted,         // Muted
  lightRed: '#FEE2E2',     // SOFT_RED (Alert Backgrounds)
  redText: '#b91c1c',      // RED (Alert Text)
  lightYellow: '#DBEAFE',  // SOFT_BLUE
  orange: THEME_COLORS.primary,       // Mapped to Primary
};

export const COORDINATES = {
  RESTAURANT: { latitude: 23.4345, longitude: 85.322 } as Coordinate,
  USER: { latitude: 23.4385, longitude: 85.328 } as Coordinate,
};

export const getStatusLabel = (status: OrderStatus | undefined) => {
  switch (status) {
    case OrderStatus.PLACED: return 'Order Placed';
    case OrderStatus.VENDOR_PENDING: return 'Waiting for vendor';
    case OrderStatus.VENDOR_ACCEPTED: return 'Vendor accepted';
    case OrderStatus.PREPARING: return 'Preparing your order';
    case OrderStatus.READY_FOR_PICKUP: return 'Ready for pickup';
    case OrderStatus.DELIVERY_PENDING: return 'Searching for partner';
    case OrderStatus.OUT_FOR_DELIVERY: return 'Out for delivery';
    case OrderStatus.DELIVERED: return 'Delivered';
    case OrderStatus.CANCELLED: return 'Cancelled';
    default: return 'Order Status';
  }
};
