import { create } from 'zustand';

interface CartUIState {
  selectedTip: number | null;
  showAddressModal: boolean;
  selectedAddressId: number | null;
  showCheckoutPopup: boolean;
  showTaxPopup: boolean;

  // Actions
  setSelectedTip: (tip: number | null) => void;
  toggleTip: (tip: number) => void;
  setShowAddressModal: (show: boolean) => void;
  setSelectedAddressId: (id: number | null) => void;
  setShowCheckoutPopup: (show: boolean) => void;
  setShowTaxPopup: (show: boolean) => void;
  resetUI: () => void;
}

export const useCartUIStore = create<CartUIState>((set) => ({
  selectedTip: null,
  showAddressModal: false,
  selectedAddressId: null,
  showCheckoutPopup: false,
  showTaxPopup: false,

  setSelectedTip: (tip) => set({ selectedTip: tip }),
  toggleTip: (tip) =>
    set((state) => ({ selectedTip: state.selectedTip === tip ? null : tip })),
  setShowAddressModal: (show) => set({ showAddressModal: show }),
  setSelectedAddressId: (id) => set({ selectedAddressId: id }),
  setShowCheckoutPopup: (show) => set({ showCheckoutPopup: show }),
  setShowTaxPopup: (show) => set({ showTaxPopup: show }),
  resetUI: () =>
    set({
      selectedTip: null,
      showAddressModal: false,
      selectedAddressId: null, // Logic might override this separately
      showCheckoutPopup: false,
      showTaxPopup: false,
    }),
}));
