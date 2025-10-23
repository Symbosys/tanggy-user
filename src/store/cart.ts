import { create } from "zustand";
import axios, { AxiosError } from "axios";
import api from "../api/api";
import { ErrorMessage, parseToDecimal } from "../utils/utils";
import { Product } from "../types/product.type";

// interface Product {
//   id: number;
//   name: string;
//   sellingPrice: number;
//   imageUrl?: string;
// }

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
  addToCart: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
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
    } catch (err) {
      throw err
    }
  },

  // Add or update an item in cart
  addToCart: async (productId, quantity) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post(
        "/user/cart/add",
        { productId, quantity }
        );
        console.log("🚀 ~ file: cart.ts ~ line 39 ~ fetchCart ~ res", res.data)

      // refresh cart
      await get().fetchCart();
    } catch (err) {
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
      set({
        loading: false,
        error: err.response?.data?.message || "Failed to clear cart",
      });
    }
  },
}));
