// src/api/productsApi.ts
import axiosInstance from './axiosInstance';
import type { Product as BaseProduct } from '../hooks/useProducts';

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

// ✅ Matches BaseProduct's required variants property
export interface Product extends BaseProduct {
  variants: Variant[];
  defaultVariantId?: string;
}

export const productsApi = {
  rateProduct: async (productId: string, rating: number) => {
    console.log(`Rating product ${productId} with ${rating} stars...`);
    const { data } = await axiosInstance.post(
      `/customer/products/${productId}/rate`,
      { rating }
    );
    return data;
  },
};