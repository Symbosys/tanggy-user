import api from "../api/api";
import { SubCategory } from "../types/product.type"; 

export interface GetAllSubCategoriesResponse {
  success: boolean;
  message: string;
  data: SubCategory[];
}

// ... (rest of the existing interfaces remain unchanged)

// Add this new interface (if not already in types)
export interface GetAllSubCategoriesParams {
  categoryId?: string;
}

// Add this new function
export const getAllSubCategories = async (
  params: GetAllSubCategoriesParams = {}
): Promise<GetAllSubCategoriesResponse> => {
  try {
    const response = await api.get<GetAllSubCategoriesResponse>(
      "/sub-category/all", // Assuming endpoint based on controller; adjust if different (e.g., /subCategory)
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching subcategories:", error);
    throw error;
  }
};