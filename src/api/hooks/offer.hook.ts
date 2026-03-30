import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api";

// ── Types ───────────────────────────────────────────────────

export interface Offer {
  id: string; // BigInt IDs are normalized to string
  title?: string | null;
  description?: string | null;
  image: {
    public_id: string;
    url: string;
  };
  searchQuery?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// ── Hooks ───────────────────────────────────────────────────

export const useGetAllOffers = (isActive?: boolean) => {
  return useQuery<Offer[]>({
    queryKey: ["all-offers", isActive],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Offer[]>>("/admin/offers/all", {
        params: isActive !== undefined ? { isActive } : {},
      });
      return data.data;
    },
  });
};

export const useGetOfferById = (id?: string | number) => {
  return useQuery<Offer>({
    queryKey: ["offer", id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Offer>>(`/admin/offers/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};
