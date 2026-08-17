import { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import { create } from "zustand";
import api from "../api/api";
import { Product } from "../types/product.type";
import { ErrorMessage, parseToDecimal, parseWeightToGrams, SuccessMessage } from "../utils/utils";
import { useLocationStore } from "./location";

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
  appliedScope: string;
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
  appliedPromoCode: string | null;
  appliedOffer: AppliedOfferSummary | null;
  promoError: string | null;
  appliedOffers: AppliedOfferSummary[];
  offerProgress: OfferProgress | null;

  // Actions
  fetchCart: (explicitPromoCode?: string, explicitOfferId?: string) => Promise<void>;
  applyOfferById: (offerId: string) => Promise<boolean>;
  applyPromoCode: (code: string) => Promise<boolean>;
  removeAppliedOffer: () => Promise<void>;
  removePromoCode: () => Promise<void>;
  addToCart: (productId: string, quantity: number, product?: any) => Promise<void>;
  clearCart: () => Promise<void>;
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
  appliedPromoCode: null,
  appliedOffer: null,
  promoError: null,
  appliedOffers: [],
  offerProgress: null,

  // Fetch all items from backend with active offers & promo calculation
  fetchCart: async (explicitPromoCode?: string, explicitOfferId?: string) => {
    set({ loading: true, error: null });
    try {
      const { latitude, longitude } = useLocationStore.getState();
      const codeToSend = explicitPromoCode !== undefined ? explicitPromoCode : get().promoCode;
      const offerIdToSend = explicitOfferId !== undefined ? explicitOfferId : get().selectedOfferId;

      const res = await api.get("/user/cart/all", {
        params: {
          latitude,
          longitude,
          promoCode: codeToSend || undefined,
          appliedOfferId: offerIdToSend || undefined,
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

      set({
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
        appliedPromoCode: data.appliedPromoCode || null,
        promoError: data.promoError || null,
        offerProgress: data.offerProgress || null,
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false });
      ErrorMessage(err);
    }
  },

  // Apply an Offer by ID (for non-code or tap-to-apply offers)
  applyOfferById: async (offerId: string) => {
    if (!offerId) return false;
    set({ loading: true, promoError: null });

    try {
      const res = await api.post("/user/cart/apply-offer", { offerId });
      if (res.data?.success) {
        set({ selectedOfferId: offerId, promoCode: null, promoError: null });
        SuccessMessage(res.data.message || "Offer applied successfully!");
        await get().fetchCart("", offerId);
        return true;
      } else {
        const msg = res.data?.message || "Failed to apply offer";
        set({ promoError: msg, loading: false });
        ErrorMessage(msg);
        return false;
      }
    } catch (err: any) {
      set({ promoError: err?.response?.data?.message || "Failed to apply offer", loading: false });
      ErrorMessage(err as AxiosError | Error);
      return false;
    }
  },

  // Apply Promo Code
  applyPromoCode: async (code: string) => {
    if (!code || !code.trim()) {
      ErrorMessage("Please enter a valid promo code");
      return false;
    }
    const cleanCode = code.trim().toUpperCase();
    set({ loading: true, promoError: null });

    try {
      const res = await api.post("/user/cart/apply-promo", { code: cleanCode });
      if (res.data?.success) {
        set({ promoCode: cleanCode, selectedOfferId: null, promoError: null });
        SuccessMessage(res.data.message || `Promo code ${cleanCode} applied!`);
        await get().fetchCart(cleanCode, "");
        return true;
      } else {
        const msg = res.data?.message || "Invalid promo code";
        set({ promoError: msg, loading: false });
        ErrorMessage(msg);
        return false;
      }
    } catch (err: any) {
      set({ promoError: err?.response?.data?.message || "Failed to apply promo code", loading: false });
      ErrorMessage(err as AxiosError | Error);
      return false;
    }
  },

  // Remove Applied Offer or Promo Code
  removeAppliedOffer: async () => {
    set({ promoCode: null, selectedOfferId: null, appliedPromoCode: null, appliedOffer: null, promoError: null });
    SuccessMessage("Offer removed");
    await get().fetchCart("", "");
  },

  removePromoCode: async () => {
    await get().removeAppliedOffer();
  },

  // Add or update an item in cart
  addToCart: async (productId: string, quantity: number, product?: any) => {
    const currentItems = get().cartItems;
    const targetItem = currentItems.find((item) => String(item.product.id) === String(productId));
    const currentQty = targetItem ? targetItem.quantity : 0;

    // Check weight constraint if quantity is increasing
    if (quantity > currentQty) {
      const weightStr = product ? product.weight : targetItem ? targetItem.product.weight : null;
      if (weightStr) {
        const itemWeight = parseWeightToGrams(weightStr);
        let proposedWeight = 0;
        for (const item of currentItems) {
          if (String(item.product.id) !== String(productId)) {
            proposedWeight += parseWeightToGrams(item.product.weight) * item.quantity;
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
      await api.post("/user/cart/add", { productId, quantity });
      // refresh cart with updated pricing & recalculations
      await get().fetchCart();
    } catch (err: any) {
      set({ loading: false });
      ErrorMessage(err as AxiosError | Error);
    }
  },

  // Clear the entire cart
  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      await api.delete("/user/cart/clear", {
        withCredentials: true,
      });
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
        appliedPromoCode: null,
        promoError: null,
        appliedOffers: [],
        loading: false,
      });
    } catch (err: any) {
      set({ loading: false });
      ErrorMessage(err);
    }
  },

  // Get quantity for a specific product
  getQuantity: (productId: string) => {
    return get().cartItems.find((item) => String(item.product.id) === String(productId))?.quantity || 0;
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
      await get().addToCart(String(product.id), currentQuantity - 1);
    }
  },
}));