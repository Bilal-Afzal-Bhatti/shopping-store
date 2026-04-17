import axiosInstance from './axiosInstance';

export interface ReviewRatings {
  average: number;
  count: number;
}

export interface ProductColor {
  name: string;
  hex: string;
  stock?: number;
}

export interface Product {
  _id: string; // From MongoDB
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  discount?: string;
  category: string;
  ratings?: ReviewRatings;
  colors?: ProductColor[];
  isActive: boolean;
}

// Example API calls for products
export const productsApi = {
  // Fetch all products (with optional query params for filtering/pagination)
  getAllProducts: async (params?: Record<string, any>): Promise<Product[]> => {
    const response = await axiosInstance.get('/api/customer/product/show', { params });
    // Assuming backend returns { success: true, data: [...] } structure
    return response.data?.data || response.data;
  },

  // Fetch a single product by ID
  getProductById: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get(`/api/customer/product/${id}`);
    return response.data?.data || response.data;
  },

  // Rate a product
  rateProduct: async (id: string, rating: number): Promise<any> => {
    const response = await axiosInstance.post(`/api/customer/product/${id}/rate`, { rating });
    return response.data;
  },
};
