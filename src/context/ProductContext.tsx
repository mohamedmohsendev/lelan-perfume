import React, { createContext, useContext, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

interface ProductContextType {
    products: Product[];
    loading: boolean;
    refreshProducts: () => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();

    // Fetch products with React Query
    const { data: products = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: async (): Promise<Product[]> => {
            const res = await fetch(`${API_URL}/api/products`);
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Delete product mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = localStorage.getItem('lalen_admin_token');
            const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error('Failed to delete');
            return id;
        },
        onSuccess: () => {
            // Invalidate and refetch products immediately
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const contextValue = useMemo(() => ({
        products,
        loading,
        refreshProducts: async () => { await refetch(); },
        deleteProduct: async (id: string) => { await deleteMutation.mutateAsync(id); }
    }), [products, loading, refetch, deleteMutation]);

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const ctx = useContext(ProductContext);
    if (!ctx) throw new Error('useProducts must be used within ProductProvider');
    return ctx;
};
