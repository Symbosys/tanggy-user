import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api";

// ── Types ───────────────────────────────────────────────────

export interface Advertisement {
  id: string; // BigInt IDs are normalized to string
  title: string;
  description: string;
  image: {
    public_id: string;
    url: string;
  };
  link?: string | null;
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

export const useGetAllAdvertisements = (isActive?: boolean) => {
  return useQuery<Advertisement[]>({
    queryKey: ["all-advertisements", isActive],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Advertisement[]>>("/admin/ads/all", {
        params: isActive !== undefined ? { isActive } : {},
      });
      return data.data;
    },
  });
};

export const useGetAdvertisementById = (id?: string | number) => {
  return useQuery<Advertisement>({
    queryKey: ["advertisement", id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Advertisement>>(`/admin/ads/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};
