import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import api from "../api";
import { Mode, Product } from "../../types/product.type";

export interface CartItemProduct extends Product {}

export interface CartItemData {
  id: string | number;
  cartId: string | number;
  productId: string | number;
  quantity: number;
  notes?: string | null;
  product: CartItemProduct;
  pricing?: {
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    itemTotal: number;
    finalTotal: number;
  };
}

export interface UserCartData {
  id: string | number;
  userId: string | number;
  modeId: string | number;
  mode?: Mode;
  items: CartItemData[];
  appliedOfferId?: string | number | null;
  appliedPromoCode?: string | null;
  appliedPromoId?: string | number | null;
  itemTotal: number;
  itemDiscountTotal: number;
  promoDiscountTotal: number;
  discountTotal: number;
  cashbackTotal: number;
  finalItemTotal: number;
  deliveryFee: number;
  platformFee: number;
  gstOnPlatform: number;
  packingFee: number;
  surcharge: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCartResponse {
  success: boolean;
  message: string;
  data: UserCartData;
}

export interface CartSummaryItem {
  modeId: string;
  modeName: string;
  modeSlug: string;
  totalItems: number;
  totalAmount: number;
}

export interface UserCartSummaryData {
  totalModesWithCart: number;
  totalItemsAcrossAllModes: number;
  totalAmountAcrossAllModes: number;
  carts: CartSummaryItem[];
}

export interface UserCartSummaryResponse {
  success: boolean;
  message: string;
  data: UserCartSummaryData;
}

export interface GetCartParams {
  modeId?: string | number;
  modeSlug?: string;
}

export interface AddToCartPayload {
  productId: string | number;
  quantity: number;
  notes?: string | null;
  modeId?: string | number;
}

import { useModeStore } from "../../store/mode";

export interface ClearCartParams {
  modeId?: string | number;
  clearAll?: boolean;
}

/**
 * Fetch cart for a specific mode (or current default mode)
 */
export const fetchUserCart = async (
  params?: GetCartParams
): Promise<UserCartData> => {
  const currentModeId = params?.modeId ?? useModeStore.getState().selectedMode?.id;
  const mergedParams = {
    ...params,
    modeId: currentModeId ? String(currentModeId) : undefined,
  };
  const { data } = await api.get<UserCartResponse>("/user/cart/all", { params: mergedParams });
  return data.data;
};

/**
 * Fetch multi-mode cart summary across all modes
 */
export const fetchUserCartSummary = async (): Promise<UserCartSummaryData> => {
  const { data } = await api.get<UserCartSummaryResponse>("/user/cart/summary");
  return data.data;
};

/**
 * TanStack Query hook to fetch user's cart for a given mode
 */
export const useUserCart = (
  params?: GetCartParams,
  options?: Omit<UseQueryOptions<UserCartData, Error>, "queryKey" | "queryFn">
) => {
  const selectedMode = useModeStore((s) => s.selectedMode);
  const activeModeId = params?.modeId ?? selectedMode?.id ?? "default";

  return useQuery<UserCartData, Error>({
    queryKey: ["cart", String(activeModeId), params?.modeSlug],
    queryFn: () => fetchUserCart({ ...params, modeId: activeModeId }),
    ...options,
  });
};

/**
 * TanStack Query hook to fetch multi-mode cart summary (item counts, badges)
 */
export const useUserCartSummary = (
  options?: Omit<
    UseQueryOptions<UserCartSummaryData, Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<UserCartSummaryData, Error>({
    queryKey: ["cart-summary"],
    queryFn: fetchUserCartSummary,
    ...options,
  });
};

/**
 * TanStack Mutation hook to add / update product in cart
 */
export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddToCartPayload) => {
      const modeId = payload.modeId ?? useModeStore.getState().selectedMode?.id;
      const { data } = await api.post("/user/cart/add", {
        ...payload,
        modeId: modeId ? Number(modeId) : undefined,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-summary"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

/**
 * TanStack Mutation hook to clear cart
 */
export const useClearCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params?: ClearCartParams) => {
      const modeId = params?.modeId ?? useModeStore.getState().selectedMode?.id;
      const { data } = await api.delete("/user/cart/clear", {
        params: {
          ...params,
          modeId: modeId ? String(modeId) : undefined,
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-summary"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
