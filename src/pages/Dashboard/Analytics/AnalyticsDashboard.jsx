import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { KPICards } from './KPICards';
import { SalesTrendChart } from './SalesTrendChart';
import { TopProductsChart } from './TopProductsChart';
import { DateRangeFilter } from './DateRangeFilter';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export const AnalyticsDashboard = () => {
    const [dateRange, setDateRange] = useState([
        {
            startDate: subDays(new Date(), 30),
            endDate: new Date(),
            key: 'selection'
        }
    ]);

    const { data: dailySales, isLoading: isSalesLoading, isError: isSalesError, refetch: refetchSales } = useQuery({
        queryKey: ['dailySales', dateRange[0].startDate, dateRange[0].endDate],
        queryFn: async () => {
            const token = localStorage.getItem('lalen_admin_token'); // سحب التوكن
            const res = await fetch(`${API_URL}/api/admin/analytics/daily-sales?start=${dateRange[0].startDate.toISOString()}&end=${dateRange[0].endDate.toISOString()}`, {
                headers: { 'Authorization': `Bearer ${token}` } // إرسال التوكن للسيرفر
            });
            if (!res.ok) throw new Error('Failed to fetch daily sales');
            return res.json();
        }
    });

    const { data: topProducts, isLoading: isProductsLoading, isError: isProductsError, refetch: refetchProducts } = useQuery({
        queryKey: ['topProducts', dateRange[0].startDate, dateRange[0].endDate],
        queryFn: async () => {
            const token = localStorage.getItem('lalen_admin_token'); // سحب التوكن
            const res = await fetch(`${API_URL}/api/admin/analytics/top-products?start=${dateRange[0].startDate.toISOString()}&end=${dateRange[0].endDate.toISOString()}`, {
                headers: { 'Authorization': `Bearer ${token}` } // إرسال التوكن للسيرفر
            });
            if (!res.ok) throw new Error('Failed to fetch top products');
            return res.json();
        }
    });

    const kpiStats = useMemo(() => {
        if (!dailySales) return {};
        // تعديل أسماء الأعمدة لتتطابق مع Supabase مع تحويلها لأرقام
        const totalRevenue = dailySales.reduce((sum, d) => sum + (Number(d.revenue) || 0), 0);
        const totalOrders = dailySales.reduce((sum, d) => sum + (Number(d.total_orders) || 0), 0);
        const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            totalRevenue,
            totalOrders,
            aov,
            newCustomers: Math.round(totalOrders * 0.4), // Placeholder for demo
        };
    }, [dailySales]);

    const isLoading = isSalesLoading || isProductsLoading;
    const isError = isSalesError || isProductsError;

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-color pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-1">Analytics Overview</h2>
                    <p className="text-text-secondary text-sm">Real-time performance metrics and sales trends.</p>
                </div>
                <div className="flex items-center gap-4">
                    <DateRangeFilter range={dateRange} setRange={setDateRange} />
                    <button
                        onClick={() => { refetchSales(); refetchProducts(); }}
                        className="p-2.5 bg-[#1a1a1a] border border-border-color rounded-lg text-primary hover:bg-primary/10 transition-colors shadow-md"
                        title="Refresh Data"
                    >
                        <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {isError && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
                    <AlertTriangle size={20} />
                    <p className="text-sm font-medium">Failed to load analytics data. Please check your connection and try again.</p>
                </div>
            )}

            <KPICards stats={kpiStats} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <SalesTrendChart data={dailySales || []} />
                <TopProductsChart data={topProducts || []} />
            </div>

            <div className="bg-[#1a1a1a] p-8 rounded-xl border border-border-color shadow-lg text-center">
                <p className="text-text-secondary text-sm italic">
                    More advanced reporting features are coming soon in Phase 2.
                </p>
            </div>
        </div>
    );
};