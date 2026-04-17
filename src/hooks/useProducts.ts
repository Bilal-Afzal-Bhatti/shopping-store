import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';

export const useProducts = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAllProducts(params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProductById(id),
    enabled: !!id, // Only run the query if ID is truthy
  });
};
