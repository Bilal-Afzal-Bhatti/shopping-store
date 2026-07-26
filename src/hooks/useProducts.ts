// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';

interface UseProductsOptions {
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Variant {
  _id: string;
  color: { name: string; hex: string };
  size: string;
  stock: number;
}

export interface Ratings {
  average: number;
  count: number;
  stars: Record<string, number>;
}

export interface Product {
  _id: string;
  productId?: string; // Optional alias for dispatch/cart actions
  variantId?: string; // Optional alias for cart actions
  name: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  image: string;
  discount?: string;
  category: string;
  variants?: Variant[]; // Made optional so products without variants don't throw type errors
  colors?: { name: string; hex: string; stock: number }[];
  ratings?: Ratings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── useProducts (list) ───────────────────────────────────────────────────────
export const useProducts = (options: UseProductsOptions = {}) => {
  const { category, page = 1, limit = 20, search, sort } = options;

  return useQuery<ProductsResponse>({
    queryKey: ['products', { category, page, limit, search, sort }],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit };
      if (category) params.category = category;
      if (search)   params.search   = search;
      if (sort)     params.sort     = sort;

      console.log('📦 [useProducts] hitting:', '/customer/products', '| params:', params);

      const { data } = await axiosInstance.get('/customer/products', { params });

      console.log('📦 [useProducts] response:', data);

      return {
        products:   Array.isArray(data.data) ? data.data : [],
        total:      data.total ?? 0,
        page:       data.page  ?? 1,
        totalPages: data.pages ?? 1,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ─── useProduct (single) ──────────────────────────────────────────────────────
export const useProduct = (id: string | undefined) => {
  return useQuery<Product>({
    queryKey: ['products', 'detail', id],
    queryFn: async () => {
      console.log('🔍 [useProduct] fetching id:', id);
      console.log('🔍 [useProduct] full URL:', `/customer/products/${id}`);

      const { data } = await axiosInstance.get(`/customer/products/${id}`);

      return data.data;
    },
    enabled:   !!id,
    staleTime: 1000 * 60 * 5,
  });
};