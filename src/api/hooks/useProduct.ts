import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { GetAllProductsResponse } from "../../types/product.type";
import api from "../api";

export type GetAllProductsData = GetAllProductsResponse["data"];

export interface GetAllProductsParams {
  categoryId?: string | number;
  subCategoryId?: string | number;
  maxPrice?: number;
  isActive?: boolean;
  isMandatory?: boolean;
  search?: string;
  lat?: number;
  lng?: number;
  rangeKm?: number;
  userId?: string | number;
  onlyAvailable?: boolean;
  marketPrice?: string | number | null;
  isBestSeller?: boolean;
  isRecommended?: boolean;
  offerId?: string | number;
}

/**
 * Fetch all products from API
 */
export const fetchAllProducts = async (
  params: GetAllProductsParams = {}
): Promise<GetAllProductsData> => {
  const response = await api.get<GetAllProductsResponse>("/product/all", {
    params,
  });
  return response.data.data;
};

/**
 * TanStack Query hook to fetch products with optional filters (e.g. category, search, offerId, location)
 */
export const useGetAllProducts = (
  params?: GetAllProductsParams,
  options?: Omit<
    UseQueryOptions<GetAllProductsData, Error, GetAllProductsData, any>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<GetAllProductsData, Error>({
    queryKey: ["products", params],
    queryFn: () => fetchAllProducts(params),
    ...options,
  });
};