import axiosInstance from './axiosInstance';

// Define the shape of a typical Product
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
}

// Example API calls for products
export const productsApi = {
  // Fetch all products (with optional query params for filtering/pagination)
  getAllProducts: async (params?: Record<string, any>): Promise<Product[]> => {
    const response = await axiosInstance.get('/products', { params });
    // Assuming backend returns { success: true, data: [...] } structure
    return response.data?.data || response.data;
  },

  // Fetch a single product by ID
  getProductById: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data?.data || response.data;
  },
};
