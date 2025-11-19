import api from "../api/api";
import { GetAllProductsResponse } from "../types/product.type";


export interface GetAllProductsParams {
  categoryId?: string;
  subCategoryId?: string;
  maxPrice?: number;
  isActive?: boolean;
  isMandatory?: boolean;
  search?: string;
  lat?: number;
  lng?: number;
  rangeKm?: number;
  userId?: string;
  onlyAvailable?: boolean;
  isBestSeller?: boolean;
  isRecommended?: boolean;

  marketPrice?: number | null;
}

export const getAllProducts = async (
  params: GetAllProductsParams = {}
): Promise<GetAllProductsResponse> => {
  try {
    const response = await api.get<GetAllProductsResponse>(
      "/product/all",
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw error;
  }
};
