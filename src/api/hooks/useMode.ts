import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "../api";
import { Mode } from "../../types/product.type";

export interface GetAllModesResponse {
  success: boolean;
  message: string;
  data: Mode[];
}

export interface GetModeResponse {
  success: boolean;
  message: string;
  data: Mode;
}

/**
 * Fetch all active modes from API
 */
export const fetchAllModes = async (): Promise<Mode[]> => {
  const { data } = await api.get<GetAllModesResponse>("/mode/all");
  return data.data;
};

/**
 * Fetch a single mode by numeric ID or string slug
 */
export const fetchModeByIdOrSlug = async (
  idOrSlug: string | number
): Promise<Mode> => {
  const { data } = await api.get<GetModeResponse>(`/mode/${idOrSlug}`);
  return data.data;
};

/**
 * TanStack Query hook to fetch all active modes (e.g. Chicken Biryani, South Indian, Veg)
 */
export const useGetAllModes = (
  options?: Omit<UseQueryOptions<Mode[], Error>, "queryKey" | "queryFn">
) => {
  return useQuery<Mode[], Error>({
    queryKey: ["modes", "all"],
    queryFn: fetchAllModes,
    staleTime: 5 * 60 * 1000, // 5 mins cache by default
    ...options,
  });
};

/**
 * TanStack Query hook to fetch a single mode by ID or slug
 */
export const useGetModeByIdOrSlug = (
  idOrSlug?: string | number,
  options?: Omit<UseQueryOptions<Mode, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<Mode, Error>({
    queryKey: ["mode", idOrSlug],
    queryFn: () => fetchModeByIdOrSlug(idOrSlug!),
    enabled: Boolean(idOrSlug) && options?.enabled !== false,
    ...options,
  });
};

export default useGetAllModes;
