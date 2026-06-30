// types/order.type.ts

export enum OrderStatus {
  PLACED = 'PLACED',
  VENDOR_PENDING = 'VENDOR_PENDING',
  VENDOR_ACCEPTED = 'VENDOR_ACCEPTED',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  DELIVERY_PENDING = 'DELIVERY_PENDING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

export enum PaymentMethod {
  WALLET = 'WALLET',
  UPI = 'UPI',
  CARD = 'CARD',
  NETBANKING = 'NETBANKING',
  COD = 'COD',
  RAZORPAY = 'RAZORPAY',
  PHONEPE = 'PHONEPE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum DeliveryStatus {
  NOT_ASSIGNED = 'NOT_ASSIGNED',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export enum RefundReason {
  USER_CANCELLED = 'USER_CANCELLED',
  VENDOR_UNAVAILABLE = 'VENDOR_UNAVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  WRONG_ITEM = 'WRONG_ITEM',
  DAMAGED = 'DAMAGED',
  LATE_DELIVERY = 'LATE_DELIVERY',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  VENDOR_REJECTED = 'VENDOR_REJECTED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
}

export enum OrderSource {
  APP = 'APP',
  WEBSITE = 'WEBSITE',
  TELEPHONE = 'TELEPHONE',
}

export enum OrderEventType {
  ORDER_PLACED = 'ORDER_PLACED',
  VENDOR_NOTIFIED = 'VENDOR_NOTIFIED',
  VENDOR_ACCEPTED = 'VENDOR_ACCEPTED',
  VENDOR_REJECTED = 'VENDOR_REJECTED',
  PREPARING_STARTED = 'PREPARING_STARTED',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  DELIVERY_NOTIFIED = 'DELIVERY_NOTIFIED',
  DELIVERY_ACCEPTED = 'DELIVERY_ACCEPTED',
  DELIVERY_REJECTED = 'DELIVERY_REJECTED',
  PICKED_UP = 'PICKED_UP',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  DISPUTE_RAISED = 'DISPUTE_RAISED',
}

export enum BroadcastStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  MISSED = 'MISSED',
}

export enum VendorAssignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum AssignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export interface OrderTimestamps {
  id: bigint;
  orderId: bigint;
  placedAt: Date;
  vendorNotifiedAt?: Date;
  vendorAssignedAt?: Date;
  confirmedAt?: Date;
  readyAt?: Date;
  deliveryNotifiedAt?: Date;
  deliveryAssignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
}

export interface OrderItem {
  id: bigint;
  orderId: bigint;
  productId: bigint;
  vendorProductId?: bigint;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  product: {
    id: bigint;
    name: string;
    images?: Array<{
      id: bigint;
      image: {
        id: bigint;
        url: string;
      };
    }>;
  };
}

export interface OrderRefund {
  id: bigint;
  orderId: bigint;
  amount: number;
  reason?: RefundReason;
  status: PaymentStatus;
  referenceId?: string;
  processedAt?: Date;
  description?: string;
}

export interface OrderTrackingEvent {
  id: bigint;
  orderId: bigint;
  eventType: OrderEventType;
  latitude?: number;
  longitude?: number;
  location?: string;
  eta?: number;
  notes?: string;
  executedBy?: string;
  timestamp: Date;
}

export interface OrderVendorBroadcast {
  id: bigint;
  orderId: bigint;
  vendorId: bigint;
  notifiedAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectReason?: string;
  status: BroadcastStatus;
  vendor: {
    id: bigint;
    name: string;
  };
}

export interface OrderDeliveryBroadcast {
  id: bigint;
  orderId: bigint;
  deliveryPartnerId: bigint;
  notifiedAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectReason?: string;
  status: BroadcastStatus;
  deliveryPartner: {
    id: bigint;
    name: string;
  };
}

export interface OrderVendorAssignment {
  id: bigint;
  orderId: bigint;
  amount: number;
  vendorId?: bigint;
  assignedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  status: VendorAssignmentStatus;
  estimatedPrepTimeMinutes?: number;
  actualPrepTimeMinutes?: number;
  pickupOtp?: string;
  notes?: string;
  vendor?: {
    id: bigint;
    shopName: string;
    ownerName?: string;
    email?: string;
    mobile?: string;
    mainAddress?: string;
    latitude?: number;
    longitude?: number;
    images?: any;
  };
}

export interface OrderDeliveryAssignment {
  id: bigint;
  orderId: bigint;
  deliveryPartnerId?: bigint;
  assignedAt?: Date;
  pickupEtaMinutes?: number;
  deliveryEtaMinutes?: number;
  plannedDistanceKm?: number;
  actualDistanceKm?: number;
  basePay?: number;
  distancePay?: number;
  incentivePay?: number;
  tipAmount?: number;
  totalPay?: number;
  isBadWeather?: boolean;
  isNight?: boolean;
  payCurrency?: string;
  incentiveReason?: any;
  pickupOtp?: string;
  deliveryOtp?: string;
  status: AssignmentStatus;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  deliveryPartner?: {
    id: bigint;
    name: string;
    mobile?: string;
    image?: any;
  };
}

export interface Order {
  id: bigint;
  orderNumber: string;
  userId: bigint;
  addressId: bigint;
  itemTotal: number;
  gstOnItemTotal: number;
  deliveryFee: number;
  platformFee: number;
  gstOnPlatform: number;
  packingFee: number;
  gstOnPackingFee: number;
  tipAmount?: number;
  surcharge?: number;
  discountAmount: number;
  paidAmount?: number;
  subtotal: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  notes?: string;
  source: OrderSource;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  refundReference?: string;
  cancelReason?: string;
  disputeDetails?: any;
  reviewId?: bigint;
  user: {
    id: bigint;
    name: string;
  };
  address: {
    id: bigint;
    receiverName: string;
    completeAddress: string;
    latitude?: number;
    longitude?: number;
  };
  items: OrderItem[];
  refunds?: OrderRefund;
  tracking: OrderTrackingEvent[];
  vendorBroadcasts: OrderVendorBroadcast[];
  deliveryBroadcasts: OrderDeliveryBroadcast[];
  orderDeliveryAssignment?: OrderDeliveryAssignment;
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
    deliveryId: string;
    timestamp: number;
  } | null;
  notifications: any[]; // Adjust as needed
  review?: any; // Adjust as needed
  userWalletDebitId?: bigint;
  vendorWalletCreditId?: bigint;
  deliveryPartnerWalletCreditId?: bigint;
  timestamps?: OrderTimestamps;
  vendorWalletTransaction: any[]; // Adjust as needed
  deliveryPartnerWalletTransaction: any[]; // Adjust as needed
  userWalletTransaction: any[]; // Adjust as needed
  orderVendorAssignments?: OrderVendorAssignment;
  payments: any[]; // Adjust as needed
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAllOrdersResponse {
  orders: Order[];
  totalOrder: number;
  totalPage: number;
  currentPage: number;
  count: number;
}

export interface OrderItemUI {
  id: string;
  restaurant: string;
  date: string;
  amount: string;
  status: string;
  statusColor: string;
  items: Array<{
    id: string;
    name: string;
    image: string;
  }>;
}

// ─── Input Types ─────────────────────────────────────

export interface PlaceOrderItem {
  productId: string;
  quantity: number;
  notes?: string | null;
}

export interface PlaceOrderInput {
  addressId: string;
  items: PlaceOrderItem[];
  tipAmount?: number;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  source?: OrderSource;
}

// ─── Response Types ───────────────────────────────────

export interface PlaceOrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

/** Response shape when placing order with paymentMethod: PHONEPE */
export interface PlaceOrderPhonePeResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
    phonePe: {
      token: string;
      orderId: string;
      merchantOrderId: string;
    };
  };
}

/** Response from /order/phonepe/verify-payment */
export interface VerifyPhonePePaymentResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    status: string;
    order: {
      id: string;
      orderNumber: string;
      paymentStatus: PaymentStatus;
    } | null;
  };
}
