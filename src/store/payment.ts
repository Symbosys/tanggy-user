import { create } from 'zustand';

export interface PaymentMethodType {
    id: string;
    name: string;
    description: string;
    icon: string;
    isAvailable: boolean;
    type: 'upi' | 'card' | 'netbanking' | 'cod' | 'wallet';
}

interface PaymentState {
    selectedPaymentMethod: PaymentMethodType | null;
    setSelectedPaymentMethod: (method: PaymentMethodType) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
    selectedPaymentMethod: null,
    setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method }),
}));
