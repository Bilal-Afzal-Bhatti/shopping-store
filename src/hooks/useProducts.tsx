// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/admin/products');
      return data.data; // Assuming your API returns { success: true, data: [...] }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};