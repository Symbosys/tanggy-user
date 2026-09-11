export interface ProductImage {
  id: string;
  image: {
    url: string;
    public_id: string;
  };
}

export interface Mode {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image: {
    public_id: string;
    secure_url: string;
    url?: string;
  };
  icon?: {
    public_id: string;
    secure_url: string;
    url?: string;
  } | null;
  badge?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  image: {
    url?: string;
    secure_url?: string;
    public_id: string;
  };
  description?: string | null;
  modeId?: string;
  mode?: Mode;
}

export interface SubCategory {
  id: string;
  name: string;
  image: {
    url?: string;
    secure_url?: string;
    public_id: string;
  };
  description?: string | null;
  categoryId: string;
  modeId?: string;
  category?: Category;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  marketPrice: number | null;
  sellingPrice: number;
  weight: string;
  pieces: string;
  isActive: boolean;
  isMandatory: boolean;
  categoryId: string;
  subCategoryId: string;
  modeId?: string;
  mode?: Mode;
  createdAt: string;
  updatedAt: string;
  category: Category;
  subCategory: SubCategory;
  images: ProductImage[];
  cartQuantity: number;
  isAvailable: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface GetAllProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    totalCount: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    pagination?: PaginationInfo;
    nearbyVendorsCount: number;
    hasLocation: boolean;
    rangeKm: number;
  };
}
