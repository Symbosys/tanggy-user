import { AxiosError } from "axios";
import Toast from 'react-native-toast-message';
import { create } from "zustand";
import api from "../api/api";
import { Product } from "../types/product.type";
import { ErrorMessage, parseToDecimal, parseWeightToGrams, SuccessMessage } from "../utils/utils";

interface CartItem {
  id: number;
  quantity: number;
  product: Product;
}

interface CartState {
  cartItems: CartItem[];
  subtotal: number;
  totalItems: number;
  loading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number, product?: any) => Promise<void>;
  clearCart: () => Promise<void>;
  getQuantity: (productId: string) => number;
  incrementQuantity: (product: Product) => Promise<void>;
  decrementQuantity: (product: Product) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  subtotal: 0,
  totalItems: 0,
  loading: false,
  error: null,

  // Fetch all items from backend
  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/user/cart/all");

      const data = res.data.data;

      const subtotal = parseToDecimal(data.total || 0);
      const totalItems = data.items?.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );

      set({
        cartItems: data.items || [],
        subtotal,
        totalItems,
        loading: false,
      });
    } catch (err: any) {
      ErrorMessage(err);  
    }
  },

  // Add or update an item in cart
  addToCart: async (productId: string, quantity: number, product?: any) => {
    const currentItems = get().cartItems;
    const targetItem = currentItems.find(item => item.product.id === productId);
    const currentQty = targetItem ? targetItem.quantity : 0;

    // Check weight constraint if quantity is increasing
    if (quantity > currentQty) {
      const weightStr = product ? product.weight : (targetItem ? targetItem.product.weight : null);
      if (weightStr) {
        const itemWeight = parseWeightToGrams(weightStr);
        let proposedWeight = 0;
        for (const item of currentItems) {
          if (item.product.id !== productId) {
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
      const res = await api.post(
        "/user/cart/add",
        { productId, quantity }
      );
      console.log("🚀 ~ file: cart.ts ~ line 39 ~ fetchCart ~ res", res.data);

      // refresh cart
      await get().fetchCart();
    } catch (err: any) {
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
        totalItems: 0,
        loading: false,
      });
    } catch (err: any) {
      ErrorMessage(err);
    }
  },

  // Get quantity for a specific product
  getQuantity: (productId: string) => {
    return get().cartItems.find(item => item.product.id === productId)?.quantity || 0;
  },

  // Increment quantity for a product
  incrementQuantity: async (product: Product) => {
    const currentQuantity = get().getQuantity(product.id);
    await get().addToCart(product.id, currentQuantity + 1, product);
  },

  // Decrement quantity for a product
  decrementQuantity: async (product: Product) => {
    const currentQuantity = get().getQuantity(product.id);
    if (currentQuantity > 0) {
      await get().addToCart(product.id, currentQuantity - 1);
    }
  },
}));