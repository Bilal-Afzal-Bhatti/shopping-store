// src/api/productsApi.ts
import axiosInstance from './axiosInstance';
import type { Product, Variant, Ratings } from '../hooks/useProducts';

// Re-export so imports from productsApi continue working seamlessly
export type { Product, Variant, Ratings };

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