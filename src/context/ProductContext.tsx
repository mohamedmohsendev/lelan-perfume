import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Product } from '../components/ProductCard';

const API_URL = import.meta.env.VITE_API_URL || '';

interface ProductContextType {
    products: Product[];
    loading: boolean;
    refreshProducts: () => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/products`);
            if (!res.ok) throw new Error('Failed to fetch products');
            const data: Product[] = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('Could not fetch products:', err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: string) => {
        const token = localStorage.getItem('lalen_admin_token');
        try {
            const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error('Failed to delete');
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Failed to delete product:', err);
        }
    };

    useEffect(() => { refreshProducts(); }, []);

    return (
        <ProductContext.Provider value={{ products, loading, refreshProducts, deleteProduct }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const ctx = useContext(ProductContext);
    if (!ctx) throw new Error('useProducts must be used within ProductProvider');
    return ctx;
};
