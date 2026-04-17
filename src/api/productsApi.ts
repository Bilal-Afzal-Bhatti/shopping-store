import axiosInstance from './axiosInstance';

export interface ReviewRatings {
  average: number;
  count: number;
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
};
