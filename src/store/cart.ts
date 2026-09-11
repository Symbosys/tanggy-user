import { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import { create } from "zustand";
import api from "../api/api";
import { Product } from "../types/product.type";
import { ErrorMessage, parseToDecimal, parseWeightToGrams, SuccessMessage } from "../utils/utils";
import { useLocationStore } from "./location";
import { useModeStore } from "./mode";

export interface ItemPricing {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  itemTotal: number;
  finalTotal: number;
  appliedOffer?: {
    id: string;
    uuid: string;
    title: string;
    badgeText?: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    cashbackAmount: number;
    isCashback: boolean;
  } | null;
}

export interface CartItem {
  id: number;
  quantity: number;
  productId: string | bigint;
  product: Product;
  pricing?: ItemPricing;
}

export interface AppliedOfferSummary {
  id: string;
  uuid: string;
  title: string;
  badgeText?: string | null;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  cashbackAmount: number;
  isCashback: boolean;
  isStackable?: boolean;
  appliedScope?: string;
}

export interface OfferProgress {
  offerId: string;
  title: string;
  badgeText: string;
  discountType: string;
  discountValue: number;
  minCartValue: number;
  currentCartValue: number;
  amountNeeded: number;
  progressPercentage: number;
  isUnlocked: boolean;
  promoCode?: string;
}

interface CartState {
  cartItems: CartItem[];
  subtotal: number;
  itemTotal: number;
  itemDiscountTotal: number;
  promoDiscountTotal: number;
  discountTotal: number;
  cashbackTotal: number;
  finalItemTotal: number;
  totalItems: number;
  loading: boolean;
  error: string | null;

  // Server computed fees
  deliveryFee: number;
  platformFee: number;
  gstOnPlatform: number;
  packingFee: number;
  surcharge: number;

  // Promo Code & Offers State
  promoCode: string | null;
  selectedOfferId: string | null;
  selectedOfferIds: string[];
  appliedPromoCode: string | null;
  appliedPromoCodes: string[];
  appliedOffer: AppliedOfferSummary | null;
  promoError: string | null;
  appliedOffers: AppliedOfferSummary[];
  offerProgress: OfferProgress | null;

  // Mode Scoping
  currentModeId: string | number | null;
  modeCarts: Record<string, any>;

  // Actions
  switchMode: (modeId: string | number) => void;
  fetchCart: (explicitPromoCodes?: string | string[], explicitOfferIds?: string | string[], explicitModeId?: string | number) => Promise<void>;
  applyOfferById: (offerId: string, isStackable?: boolean) => Promise<boolean>;
  removeOfferById: (offerId: string) => Promise<void>;
  applyPromoCode: (code: string, isStackable?: boolean) => Promise<boolean>;
  removePromoCodeByCode: (code: string) => Promise<void>;
  removeAppliedOffer: () => Promise<void>;
  removePromoCode: () => Promise<void>;
  addToCart: (productId: string, quantity: number, product?: any, explicitModeId?: string | number) => Promise<void>;
  clearCart: (explicitModeId?: string | number) => Promise<void>;
  getQuantity: (productId: string) => number;
  incrementQuantity: (product: Product) => Promise<void>;
  decrementQuantity: (product: Product) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  subtotal: 0,
  itemTotal: 0,
  itemDiscountTotal: 0,
  promoDiscountTotal: 0,
  discountTotal: 0,
  cashbackTotal: 0,
  finalItemTotal: 0,
  totalItems: 0,
  loading: false,
  error: null,
  deliveryFee: 0,
  platformFee: 0,
  gstOnPlatform: 0,
  packingFee: 0,
  surcharge: 0,
  promoCode: null,
  selectedOfferId: null,
  selectedOfferIds: [],
  appliedPromoCode: null,
  appliedPromoCodes: [],
  appliedOffer: null,
  promoError: null,
  appliedOffers: [],
  offerProgress: null,

  // Mode Scoping State
  currentModeId: null,
  modeCarts: {},

  // Switch Mode: optimistically set UI cart state from cache and fetch latest for this mode
  switchMode: (modeId: string | number) => {
    if (!modeId) return;
    const currentModeId = get().currentModeId;
    if (String(currentModeId) === String(modeId)) return;

    const modeKey = String(modeId);
    const cachedModeCart = get().modeCarts[modeKey];

    if (cachedModeCart) {
      set({
        currentModeId: modeId,
        cartItems: cachedModeCart.cartItems || [],
        subtotal: cachedModeCart.subtotal || 0,
        itemTotal: cachedModeCart.itemTotal || 0,
        itemDiscountTotal: cachedModeCart.itemDiscountTotal || 0,
        promoDiscountTotal: cachedModeCart.promoDiscountTotal || 0,
        discountTotal: cachedModeCart.discountTotal || 0,
        cashbackTotal: cachedModeCart.cashbackTotal || 0,
        finalItemTotal: cachedModeCart.finalItemTotal || 0,
        totalItems: cachedModeCart.totalItems || 0,
        deliveryFee: cachedModeCart.deliveryFee || 0,
        platformFee: cachedModeCart.platformFee || 0,
        gstOnPlatform: cachedModeCart.gstOnPlatform || 0,
        packingFee: cachedModeCart.packingFee || 0,
        surcharge: cachedModeCart.surcharge || 0,
        appliedOffers: cachedModeCart.appliedOffers || [],
        appliedOffer: cachedModeCart.appliedOffer || null,
        appliedPromoCode: cachedModeCart.appliedPromoCode || null,
        appliedPromoCodes: cachedModeCart.appliedPromoCodes || [],
        promoError: null,
        offerProgress: cachedModeCart.offerProgress || null,
      });
    } else {
      set({
        currentModeId: modeId,
        cartItems: [],
        subtotal: 0,
        itemTotal: 0,
        itemDiscountTotal: 0,
        promoDiscountTotal: 0,
        discountTotal: 0,
        cashbackTotal: 0,
        finalItemTotal: 0,
        totalItems: 0,
        deliveryFee: 0,
        platformFee: 0,
        gstOnPlatform: 0,
        packingFee: 0,
        surcharge: 0,
        appliedOffers: [],
        appliedOffer: null,
        appliedPromoCode: null,
        appliedPromoCodes: [],
        promoError: null,
        offerProgress: null,
      });
    }

    get().fetchCart(undefined, undefined, modeId);
  },

  // Fetch all items from backend with active offers & promo calculation
  fetchCart: async (explicitPromoCodes?: string | string[], explicitOfferIds?: string | string[], explicitModeId?: string | number) => {
    set({ loading: true, error: null });
    try {
      const { latitude, longitude } = useLocationStore.getState();
      const targetModeId = explicitModeId ?? get().currentModeId ?? useModeStore.getState().selectedMode?.id;
      
      const codesArray = explicitPromoCodes !== undefined
        ? (Array.isArray(explicitPromoCodes) ? explicitPromoCodes : explicitPromoCodes ? [explicitPromoCodes] : [])
        : get().appliedPromoCodes;

      const offerIdsArray = explicitOfferIds !== undefined
        ? (Array.isArray(explicitOfferIds) ? explicitOfferIds : explicitOfferIds ? [explicitOfferIds] : [])
        : get().selectedOfferIds;

      const res = await api.get("/user/cart/all", {
        params: {
          modeId: targetModeId ? String(targetModeId) : undefined,
          latitude,
          longitude,
          promoCodes: codesArray.length > 0 ? codesArray.join(",") : undefined,
          promoCode: codesArray.length > 0 ? codesArray[0] : undefined,
          appliedOfferIds: offerIdsArray.length > 0 ? offerIdsArray.join(",") : undefined,
          appliedOfferId: offerIdsArray.length > 0 ? offerIdsArray[0] : undefined,
        },
      });

      const data = res.data.data;

      const subtotal = parseToDecimal(data.total || 0);
      const itemTotal = parseToDecimal(data.itemTotal || data.subtotal || 0);
      const itemDiscountTotal = parseToDecimal(data.itemDiscountTotal || 0);
      const promoDiscountTotal = parseToDecimal(data.promoDiscountTotal || 0);
      const discountTotal = parseToDecimal(data.discountTotal || 0);
      const cashbackTotal = parseToDecimal(data.cashbackTotal || 0);
      const finalItemTotal = parseToDecimal(data.finalItemTotal || 0);
      const totalItems = data.items?.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0) || 0;
      const deliveryFee = parseToDecimal(data.deliveryFee || 0);
      const platformFee = parseToDecimal(data.platformFee || 0);
      const gstOnPlatform = parseToDecimal(data.gstOnPlatform || 0);
      const packingFee = parseToDecimal(data.packingFee || 0);
      const surcharge = parseToDecimal(data.surcharge || 0);

      const appliedOffersList: AppliedOfferSummary[] = data.appliedOffers || [];
      const singleAppliedOffer = data.appliedOffer || (appliedOffersList.length > 0 ? appliedOffersList[0] : null);

      // Keep selectedOfferIds and appliedPromoCodes in sync with server-validated applied offers
      const serverAppliedIds = new Set(appliedOffersList.map((o) => String(o.id)));
      const serverAppliedUuids = new Set(appliedOffersList.map((o) => String(o.uuid)));
      const validatedOfferIds = offerIdsArray.filter(
        (id) => serverAppliedIds.has(String(id)) || serverAppliedUuids.has(String(id))
      );

      const serverAppliedCode = data.appliedPromoCode || null;
      const validatedPromoCodes = serverAppliedCode
        ? codesArray.filter((c) => c.toUpperCase() === serverAppliedCode.toUpperCase())
        : [];

      const modeCartData = {
        cartItems: data.items || [],
        subtotal,
        itemTotal,
        itemDiscountTotal,
        promoDiscountTotal,
        discountTotal,
        cashbackTotal,
        finalItemTotal,
        totalItems,
        deliveryFee,
        platformFee,
        gstOnPlatform,
        packingFee,
        surcharge,
        appliedOffers: appliedOffersList,
        appliedOffer: singleAppliedOffer,
        selectedOfferIds: validatedOfferIds,
        selectedOfferId: validatedOfferIds[0] || null,
        appliedPromoCode: serverAppliedCode,
        appliedPromoCodes: validatedPromoCodes,
        promoError: data.promoError || null,
        offerProgress: data.offerProgress || null,
      };

      const nextModeCarts = {
        ...get().modeCarts,
        ...(targetModeId ? { [String(targetModeId)]: modeCartData } : {}),
      };

      // Only update active cart items if this fetch was for the active mode
      const activeModeId = get().currentModeId ?? useModeStore.getState().selectedMode?.id;
      if (!targetModeId || String(targetModeId) === String(activeModeId)) {
        set({
          ...modeCartData,
          currentModeId: targetModeId ?? activeModeId,
          modeCarts: nextModeCarts,
          loading: false,
        });
      } else {
        set({
          modeCarts: nextModeCarts,
          loading: false,
        });
      }
    } catch (err: any) {
      set({ loading: false });
      ErrorMessage(err);
    }
  },

  // Apply an Offer by ID (with stacking support & max 2 offers limit)
  applyOfferById: async (offerId: string, isStackable?: boolean) => {
    if (!offerId) return false;
    set({ loading: true, promoError: null });

    try {
      let nextOfferIds: string[];
      let nextPromoCodes: string[];
      const currentOffers = get().appliedOffers;

      if (isStackable === false) {
        // Non-stackable offer: clear all other offers and promo codes (always allowed as 1 offer)
        nextOfferIds = [offerId];
        nextPromoCodes = [];
      } else {
        const isAlreadyApplied = currentOffers.some((o) => String(o.id) === String(offerId) || String(o.uuid) === String(offerId)) || get().selectedOfferIds.includes(offerId);
        
        if (!isAlreadyApplied && currentOffers.length >= 2) {
          const errorMsg = "Maximum 2 offers can be applied per order. Please remove an offer to add a new one.";
          set({ promoError: errorMsg, loading: false });
          ErrorMessage(errorMsg);
          return false;
        }

        // Stackable offer: remove any currently applied non-stackable offers
        const nonStackableIds = currentOffers.filter((o) => !o.isStackable).map((o) => o.id);
        nextOfferIds = get().selectedOfferIds.filter((id) => !nonStackableIds.includes(id));
        if (!nextOfferIds.includes(offerId)) {
          nextOfferIds.push(offerId);
        }
        nextPromoCodes = get().appliedPromoCodes;
      }

      set({
        selectedOfferIds: nextOfferIds,
        selectedOfferId: nextOfferIds[0] || null,
        appliedPromoCodes: nextPromoCodes,
        appliedPromoCode: nextPromoCodes[0] || null,
        promoError: null,
      });

      SuccessMessage("Offer applied successfully!");
      await get().fetchCart(nextPromoCodes, nextOfferIds);
      return true;
    } catch (err: any) {
      set({ promoError: err?.response?.data?.message || "Failed to apply offer", loading: false });
      ErrorMessage(err as AxiosError | Error);
      return false;
    }
  },

  // Remove a specific applied Offer by ID or UUID
  removeOfferById: async (offerId: string) => {
    const target = String(offerId).trim().toUpperCase();
    const nextOfferIds = get().selectedOfferIds.filter((id) => String(id).toUpperCase() !== target);
    const nextPromoCodes = get().appliedPromoCodes.filter((c) => c.toUpperCase() !== target);
    const remainingOffers = get().appliedOffers.filter(
      (o) => String(o.id).toUpperCase() !== target && (!o.uuid || String(o.uuid).toUpperCase() !== target)
    );

    set({
      selectedOfferIds: nextOfferIds,
      selectedOfferId: nextOfferIds[0] || null,
      appliedPromoCodes: nextPromoCodes,
      appliedPromoCode: nextPromoCodes[0] || null,
      appliedOffers: remainingOffers,
      appliedOffer: remainingOffers[0] || null,
    });
    SuccessMessage("Offer removed");
    await get().fetchCart(nextPromoCodes, nextOfferIds);
  },

  // Apply Promo Code (with stacking support & max 2 offers limit)
  applyPromoCode: async (code: string, isStackable?: boolean) => {
    if (!code || !code.trim()) {
      ErrorMessage("Please enter a valid promo code");
      return false;
    }
    const cleanCode = code.trim().toUpperCase();
    set({ loading: true, promoError: null });

    try {
      let nextPromoCodes: string[];
      let nextOfferIds: string[];
      const currentOffers = get().appliedOffers;

      if (isStackable === false) {
        // Non-stackable: clear all (always allowed as 1 offer)
        nextPromoCodes = [cleanCode];
        nextOfferIds = [];
      } else {
        const isAlreadyApplied = get().appliedPromoCodes.includes(cleanCode);
        if (!isAlreadyApplied && currentOffers.length >= 2) {
          const errorMsg = "Maximum 2 offers can be applied per order. Please remove an offer to add a new one.";
          set({ promoError: errorMsg, loading: false });
          ErrorMessage(errorMsg);
          return false;
        }

        // Stackable: filter out non-stackables
        const nonStackableIds = currentOffers.filter((o) => !o.isStackable).map((o) => String(o.id));
        const nonStackableUuids = currentOffers.filter((o) => !o.isStackable).map((o) => String(o.uuid));
        nextOfferIds = get().selectedOfferIds.filter(
          (id) => !nonStackableIds.includes(String(id)) && !nonStackableUuids.includes(String(id))
        );
        nextPromoCodes = [...get().appliedPromoCodes.filter((c) => c !== cleanCode), cleanCode];
      }

      set({
        promoCode: cleanCode,
        appliedPromoCodes: nextPromoCodes,
        appliedPromoCode: nextPromoCodes[0] || null,
        selectedOfferIds: nextOfferIds,
        selectedOfferId: nextOfferIds[0] || null,
        promoError: null,
      });

      SuccessMessage(`Promo code ${cleanCode} applied!`);
      await get().fetchCart(nextPromoCodes, nextOfferIds);
      return true;
    } catch (err: any) {
      set({ promoError: err?.response?.data?.message || "Failed to apply promo code", loading: false });
      ErrorMessage(err as AxiosError | Error);
      return false;
    }
  },

  // Remove a specific Promo Code
  removePromoCodeByCode: async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const nextPromoCodes = get().appliedPromoCodes.filter((c) => c.toUpperCase() !== cleanCode);
    const nextOfferIds = get().selectedOfferIds.filter((id) => String(id).toUpperCase() !== cleanCode);
    const remainingOffers = get().appliedOffers.filter(
      (o) =>
        !o.title?.toUpperCase().includes(cleanCode) &&
        !o.badgeText?.toUpperCase().includes(cleanCode)
    );

    set({
      appliedPromoCodes: nextPromoCodes,
      appliedPromoCode: nextPromoCodes[0] || null,
      promoCode: nextPromoCodes[0] || null,
      selectedOfferIds: nextOfferIds,
      selectedOfferId: nextOfferIds[0] || null,
      appliedOffers: remainingOffers,
      appliedOffer: remainingOffers[0] || null,
    });
    SuccessMessage("Promo code removed");
    await get().fetchCart(nextPromoCodes, nextOfferIds);
  },

  // Remove All Applied Offers & Promo Codes
  removeAppliedOffer: async () => {
    set({
      promoCode: null,
      selectedOfferId: null,
      selectedOfferIds: [],
      appliedPromoCode: null,
      appliedPromoCodes: [],
      appliedOffer: null,
      appliedOffers: [],
      promoError: null,
    });
    SuccessMessage("All offers removed");
    await get().fetchCart([], []);
  },

  removePromoCode: async () => {
    await get().removeAppliedOffer();
  },

  // Add or update an item in cart
  addToCart: async (productId: string, quantity: number, product?: any, explicitModeId?: string | number) => {
    const currentItems = get().cartItems;
    const targetItem = currentItems.find((item) => String(item.product?.id || item.productId) === String(productId));
    const currentQty = targetItem ? targetItem.quantity : 0;

    // Check weight constraint if quantity is increasing
    if (quantity > currentQty) {
      const weightStr = product ? product.weight : targetItem ? targetItem.product?.weight : null;
      if (weightStr) {
        const itemWeight = parseWeightToGrams(weightStr);
        let proposedWeight = 0;
        for (const item of currentItems) {
          if (String(item.product?.id || item.productId) !== String(productId)) {
            proposedWeight += parseWeightToGrams(item.product?.weight || "0g") * item.quantity;
          }
        }
        proposedWeight += itemWeight * quantity;

        if (proposedWeight > 5000) {
          SuccessMessage("More than 5kg is not allowed");
          return;
        }
      }
    }

    set({ loading: true, error: null });
    try {
      const targetModeId = explicitModeId ?? product?.modeId ?? get().currentModeId ?? useModeStore.getState().selectedMode?.id;
      await api.post("/user/cart/add", {
        productId,
        quantity,
        modeId: targetModeId ? Number(targetModeId) : undefined,
      });
      // refresh cart with updated pricing & recalculations for current mode
      await get().fetchCart(undefined, undefined, targetModeId);
    } catch (err: any) {
      set({ loading: false });
      ErrorMessage(err as AxiosError | Error);
    }
  },

  // Clear the current mode's cart (or specified mode's cart)
  clearCart: async (explicitModeId?: string | number) => {
    const targetModeId = explicitModeId ?? get().currentModeId ?? useModeStore.getState().selectedMode?.id;
    set({ loading: true, error: null });
    try {
      await api.delete("/user/cart/clear", {
        params: targetModeId ? { modeId: targetModeId } : undefined,
        withCredentials: true,
      });

      const modeKey = targetModeId ? String(targetModeId) : null;
      const nextModeCarts = { ...get().modeCarts };
      if (modeKey) {
        delete nextModeCarts[modeKey];
      }

      set({
        cartItems: [],
        subtotal: 0,
        itemTotal: 0,
        itemDiscountTotal: 0,
        promoDiscountTotal: 0,
        discountTotal: 0,
        cashbackTotal: 0,
        finalItemTotal: 0,
        totalItems: 0,
        deliveryFee: 0,
        platformFee: 0,
        gstOnPlatform: 0,
        packingFee: 0,
        surcharge: 0,
        promoCode: null,
        selectedOfferId: null,
        selectedOfferIds: [],
        appliedPromoCode: null,
        appliedPromoCodes: [],
        appliedOffer: null,
        appliedOffers: [],
        promoError: null,
        offerProgress: null,
        modeCarts: nextModeCarts,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false });
      ErrorMessage(err);
    }
  },

  // Get quantity for a specific product
  getQuantity: (productId: string) => {
    return get().cartItems.find((item) => String(item.product?.id || item.productId) === String(productId))?.quantity || 0;
  },

  // Increment quantity for a product
  incrementQuantity: async (product: Product) => {
    const currentQuantity = get().getQuantity(String(product.id));
    await get().addToCart(String(product.id), currentQuantity + 1, product);
  },

  // Decrement quantity for a product
  decrementQuantity: async (product: Product) => {
    const currentQuantity = get().getQuantity(String(product.id));
    if (currentQuantity > 0) {
      await get().addToCart(String(product.id), currentQuantity - 1, product);
    }
  },
}));

// Automatic synchronization: switch cart mode whenever active mode changes
useModeStore.subscribe((state) => {
  const modeId = state.selectedMode?.id;
  if (modeId && String(modeId) !== String(useCartStore.getState().currentModeId)) {
    useCartStore.getState().switchMode(modeId);
  }
});