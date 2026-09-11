import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import api from "../api";
import { Category, SubCategory } from "../../types/product.type";

export interface GetAllCategoriesParams {
  modeId?: string | number;
}

export interface GetAllCategoriesResponse {
  success?: boolean;
  status?: number;
  message: string;
  data: Category[];
}

export interface GetCategoryResponse {
  success?: boolean;
  status?: number;
  message: string;
  data: Category;
}

export interface GetAllSubCategoriesParams {
  categoryId?: string | number;
  modeId?: string | number;
}

export interface GetAllSubCategoriesResponse {
  success?: boolean;
  status?: number;
  message: string;
  data: SubCategory[];
}

export interface GetSubCategoryResponse {
  success?: boolean;
  status?: number;
  message: string;
  data: SubCategory;
}

/**
 * Fetch all categories with optional modeId filter
 */
export const fetchAllCategories = async (
  params?: GetAllCategoriesParams
): Promise<Category[]> => {
  const { data } = await api.get<GetAllCategoriesResponse>("/category/all", {
    params,
  });
  return data.data;
};

/**
 * Fetch a single category by ID (includes subCategories)
 */
export const fetchCategoryById = async (
  id: string | number
): Promise<Category> => {
  const { data } = await api.get<GetCategoryResponse>(`/category/${id}`);
  return data.data;
};

/**
 * Fetch all subcategories with optional categoryId and/or modeId filters
 */
export const fetchAllSubCategories = async (
  params?: GetAllSubCategoriesParams
): Promise<SubCategory[]> => {
  const { data } = await api.get<GetAllSubCategoriesResponse>(
    "/sub-category/all",
    { params }
  );
  return data.data;
};

/**
 * Fetch a single subcategory by ID
 */
export const fetchSubCategoryById = async (
  id: string | number
): Promise<SubCategory> => {
  const { data } = await api.get<GetSubCategoryResponse>(`/sub-category/${id}`);
  return data.data;
};

/**
 * TanStack Query hook to fetch all categories, optionally filtered by modeId
 */
export const useGetAllCategories = (
  params?: GetAllCategoriesParams,
  options?: Omit<UseQueryOptions<Category[], Error>, "queryKey" | "queryFn">
) => {
  return useQuery<Category[], Error>({
    queryKey: ["categories", params],
    queryFn: () => fetchAllCategories(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * TanStack Query hook to fetch a single category by ID
 */
export const useGetCategoryById = (
  id?: string | number,
  options?: Omit<UseQueryOptions<Category, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<Category, Error>({
    queryKey: ["category", id],
    queryFn: () => fetchCategoryById(id!),
    enabled: Boolean(id) && options?.enabled !== false,
    ...options,
  });
};

/**
 * TanStack Query hook to fetch subcategories with optional categoryId/modeId filters
 */
export const useGetAllSubCategories = (
  params?: GetAllSubCategoriesParams,
  options?: Omit<UseQueryOptions<SubCategory[], Error>, "queryKey" | "queryFn">
) => {
  return useQuery<SubCategory[], Error>({
    queryKey: ["sub-categories", params],
    queryFn: () => fetchAllSubCategories(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * TanStack Query hook to fetch a single subcategory by ID
 */
export const useGetSubCategoryById = (
  id?: string | number,
  options?: Omit<UseQueryOptions<SubCategory, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<SubCategory, Error>({
    queryKey: ["sub-category", id],
    queryFn: () => fetchSubCategoryById(id!),
    enabled: Boolean(id) && options?.enabled !== false,
    ...options,
  });
};
