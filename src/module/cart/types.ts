export interface CartItem {
  id: string | number;
  quantity: number;
  productId: string | number;
  product: {
    id: string | number;
    name: string;
    sellingPrice: string | number;
    images: {
      image: {
        url: string;
      };
    }[];
  };
}

export interface Address {
  id: number;
  receiverName: string;
  receiverContact: string;
  completeAddress: string;
  city?: string;
  landMark?: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}
