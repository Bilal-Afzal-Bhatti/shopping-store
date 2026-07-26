// src/api/productsApi.ts
import axiosInstance from './axiosInstance';
import type { Product } from '../hooks/useProducts'; // ✅ single type definition

export type { Product };  // re-export so other files don't break

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

export const productsApi = {
  rateProduct: async (productId: string, rating: number) => {
    console.log(`Rating product ${productId} with ${rating} stars...`);
    const { data } = await axiosInstance.post(
      `/customer/products/${productId}/rate`,
      { rating }
    );
    return data; // { success, message, average, count }
  },
};