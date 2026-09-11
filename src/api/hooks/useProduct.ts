import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  InfiniteData,
  QueryKey,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { GetAllProductsResponse, Product } from "../../types/product.type";
import api from "../api";

export type GetAllProductsData = GetAllProductsResponse["data"];

export interface GetAllProductsParams {
  categoryId?: string | number;
  subCategoryId?: string | number;
  modeId?: string | number;
  modeSlug?: string;
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
  page?: number;
  limit?: number;
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
 * Fetch a single product by ID
 */
export const fetchProductById = async (
  id: string | number
): Promise<Product> => {
  const response = await api.get<{ success: boolean; data: Product }>(
    `/product/${id}`
  );
  return response.data.data;
};

/**
 * TanStack Infinite Query hook to fetch products with pagination and filters (including modeId/modeSlug).
 * If client is not sending the limit then by default it will be 25.
 */
export const useGetAllProducts = (
  params?: Omit<GetAllProductsParams, "page">,
  options?: Omit<
    UseInfiniteQueryOptions<
      GetAllProductsData,
      Error,
      InfiniteData<GetAllProductsData>,
      QueryKey,
      number
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >
) => {
  const limit = params?.limit ?? 25;

  return useInfiniteQuery<
    GetAllProductsData,
    Error,
    InfiniteData<GetAllProductsData>,
    QueryKey,
    number
  >({
    queryKey: ["products", { ...params, limit }],
    queryFn: ({ pageParam = 1 }) =>
      fetchAllProducts({
        ...params,
        page: pageParam as number,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPage =
        lastPage.page ?? (lastPage.pagination?.page ?? allPages.length);
      const totalPages =
        lastPage.totalPages ??
        lastPage.pagination?.totalPages ??
        Math.ceil(lastPage.totalCount / (lastPage.limit ?? limit));
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      const currentPage = firstPage.page ?? (firstPage.pagination?.page ?? 1);
      return currentPage > 1 ? currentPage - 1 : undefined;
    },
    ...options,
  });
};

/**
 * TanStack Query hook to fetch a single product by ID
 */
export const useGetProductById = (
  id?: string | number,
  options?: Omit<UseQueryOptions<Product, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<Product, Error>({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id!),
    enabled: Boolean(id) && options?.enabled !== false,
    ...options,
  });
};