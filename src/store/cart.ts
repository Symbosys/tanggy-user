import { create } from "zustand";
import axios, { AxiosError } from "axios";
import api from "../api/api";
import { ErrorMessage, parseToDecimal } from "../utils/utils";
import { Product } from "../types/product.type";

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
  addToCart: (productId: string, quantity: number) => Promise<void>;
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
  addToCart: async (productId: string, quantity: number) => {
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
    await get().addToCart(product.id, currentQuantity + 1);
  },

  // Decrement quantity for a product
  decrementQuantity: async (product: Product) => {
    const currentQuantity = get().getQuantity(product.id);
    if (currentQuantity > 0) {
      await get().addToCart(product.id, currentQuantity - 1);
    }
  },
}));