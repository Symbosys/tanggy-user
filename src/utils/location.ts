import { Order } from '../types/order.type';

type cord = {
  lat: number;
  lng: number;
};

// Helper to calculate distance between two coordinates in kilometers using Haversine formula
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateEta(
  order: any,
  userCord: cord,
  vendorCord?: cord,
  deliveryGuyCord?: cord,
): number {
  // If no delivery guy coordinate is provided or is invalid, return fixed ETA of 40 minutes
  if (
    !deliveryGuyCord ||
    !deliveryGuyCord.lat ||
    !deliveryGuyCord.lng ||
    !vendorCord ||
    !vendorCord.lat ||
    !vendorCord.lng ||
    isNaN(deliveryGuyCord.lat) ||
    isNaN(deliveryGuyCord.lng) ||
    isNaN(vendorCord.lat) ||
    isNaN(vendorCord.lng)
  ) {
    return 40;
  }

  // Check if the order has been picked up
  const isPickedUp =
    order.deliveryStatus === 'PICKED_UP' ||
    order.deliveryStatus === 'IN_TRANSIT' ||
    order.status === 'OUT_FOR_DELIVERY';

  if (isPickedUp) {
    // Calculate distance between user and delivery guy directly
    const distance = getDistance(
      userCord.lat,
      userCord.lng,
      deliveryGuyCord.lat,
      deliveryGuyCord.lng,
    );
    // Multiply by 10 (each km takes 10 minutes)
    return Math.round(distance * 10);
  } else {
    // Calculate distance from delivery guy to vendor and vendor to user
    const distGuyToVendor = getDistance(
      deliveryGuyCord.lat,
      deliveryGuyCord.lng,
      vendorCord.lat,
      vendorCord.lng,
    );
    const distVendorToUser = getDistance(
      vendorCord.lat,
      vendorCord.lng,
      userCord.lat,
      userCord.lng,
    );
    // Sum and multiply by 10
    return Math.round((distGuyToVendor + distVendorToUser) * 10);
  }
}

const order = {
  id: 1,
  deliveryStatus: 'PREPARING',
  status: 'PICKED_UP',
};

const eta = calculateEta(
  order,
  {
    lat: 23.357380800331594,
    lng: 85.31143754320486,
  },
  {
    lat: 23.35835399027041,
    lng: 85.31181646046086,
  },
  {
    lat: 23.350192869082502,
    lng: 85.3393743736609,
  },
);

console.log(eta)