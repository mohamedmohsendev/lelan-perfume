import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order } from '../pages/Dashboard/types';

const API_URL = import.meta.env.VITE_API_URL || '';

export const useOrders = () => {
    const queryClient = useQueryClient();

    const fetchOrders = async (): Promise<Order[]> => {
        const token = localStorage.getItem('lalen_admin_token');
        const res = await fetch(`${API_URL}/api/admin/orders`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
    };

    const { data: orders = [], isLoading, error, refetch } = useQuery({
        queryKey: ['orders'],
        queryFn: fetchOrders,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const token = localStorage.getItem('lalen_admin_token');
            const res = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Update failed');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });

    const deleteOrderMutation = useMutation({
        mutationFn: async (id: string) => {
            const token = localStorage.getItem('lalen_admin_token');
            const res = await fetch(`${API_URL}/api/admin/orders/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error('Delete failed');
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });

    return {
        orders,
        loading: isLoading,
        error,
        refreshOrders: refetch,
        updateOrderStatus: (id: string, status: string) => updateStatusMutation.mutate({ id, status }),
        deleteOrder: (id: string) => deleteOrderMutation.mutate(id),
    };
};
