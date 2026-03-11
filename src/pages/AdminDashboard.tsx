import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Package, ShoppingCart, TrendingUp, BarChart3, Settings, Calendar } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

// Components
import { AnalyticsDashboard } from './Dashboard/Analytics/AnalyticsDashboard.tsx';
import { DashboardStats } from './Dashboard/components/DashboardStats';
import { OrdersTable } from './Dashboard/components/OrdersTable';
import { ProductsTable } from './Dashboard/components/ProductsTable';
import { SettingsTab } from './Dashboard/components/SettingsTab';
import { ProductModal } from './Dashboard/components/ProductModal';

// Hooks & Context
import { useProducts } from '../context/ProductContext';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useOrders } from '../hooks/useOrders';

// Types
import type { Tab, FormShape, Order } from './Dashboard/types';

const API_URL = import.meta.env.VITE_API_URL || '';

const DEFAULT_FORM: FormShape = {
    name: '', category: 'Unisex', price: '', price30ml: '', price50ml: '', price100ml: '',
    oldPrice: '', oldPrice30ml: '', oldPrice50ml: '', oldPrice100ml: '',
    description: '', notesTop: '', notesHeart: '', notesBase: '',
    imageFiles: [], imagePreviews: [], existingImages: [], editingId: null,
};

export const AdminDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') as Tab;

    const { products, loading: productsLoading, refreshProducts, deleteProduct } = useProducts();
    const { orders, loading: ordersLoading, updateOrderStatus, deleteOrder, refreshOrders } = useOrders();
    const { t } = useLanguage();
    const { settings, refreshSettings } = useSiteSettings();

    const [activeTab, setActiveTab] = useState<Tab>(
        tabParam && ['dashboard', 'orders', 'products', 'settings', 'analytics'].includes(tabParam) ? tabParam : 'products'
    );

    useEffect(() => {
        const tabUrl = searchParams.get('tab') as Tab;
        if (tabUrl && ['dashboard', 'orders', 'products', 'settings', 'analytics'].includes(tabUrl) && tabUrl !== activeTab) {
            setActiveTab(tabUrl);
        }
    }, [searchParams]);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<FormShape>(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [settingsUploading, setSettingsUploading] = useState<string | null>(null);

    // ── Memoized Calculations ─────────────────────────────────────────────
    const statsData = useMemo(() => {
        const confirmedStatuses = ['تم تأكيده', 'تم توصيله', 'Processing', 'Delivered'];
        const activeOrders = orders.filter((o: Order) => confirmedStatuses.includes(o.status));
        const totalRevenue = activeOrders.reduce((acc: number, order: Order) => acc + (order.total || 0), 0);
        const averageOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;

        // Today's stats
        const today = new Date().toDateString();
        const todayOrders = orders.filter((o: Order) => new Date(o.created_at).toDateString() === today);
        const todayRevenue = todayOrders.filter((o: Order) => o.status !== 'لم يتم').reduce((acc: number, o: Order) => acc + (o.total || 0), 0);

        // Status counts
        const pendingCount = orders.filter((o: Order) => !o.status || o.status === 'معلق' || o.status === 'Pending').length;
        const confirmedCount = orders.filter((o: Order) => o.status === 'تم تأكيده' || o.status === 'Processing').length;
        const deliveredCount = orders.filter((o: Order) => o.status === 'تم توصيله' || o.status === 'Delivered').length;
        const returnedCount = orders.filter((o: Order) => o.status === 'تم ارجاعه' || o.status === 'Shipped').length;
        const failedCount = orders.filter((o: Order) => o.status === 'لم يتم' || o.status === 'Cancelled').length;

        // Best seller logic
        let topScent = 'None';
        const productCounts: Record<string, number> = {};
        if (activeOrders.length > 0) {
            activeOrders.forEach((o: Order) => {
                o.cart?.forEach((item: any) => {
                    const name = item.name || item.product?.name || 'Unknown';
                    productCounts[name] = (productCounts[name] || 0) + (item.quantity || 1);
                });
            });
            const bestSeller = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];
            if (bestSeller) topScent = bestSeller[0];
        }

        const stats = [
            { label: t('admin.stats.totalRevenue'), value: `${totalRevenue.toLocaleString()} EGP`, icon: <TrendingUp className="text-primary" size={24} />, color: 'text-primary' },
            { label: t('admin.stats.totalOrders'), value: orders.length.toString(), icon: <ShoppingCart className="text-primary" size={24} />, color: 'text-primary' },
            { label: t('admin.stats.topSelling'), value: topScent, icon: <Package className="text-primary" size={24} />, color: 'text-primary' },
            { label: t('admin.stats.avgOrder'), value: `${Math.round(averageOrderValue).toLocaleString()} EGP`, icon: <Calendar className="text-primary" size={24} />, color: 'text-primary' },
        ];

        const statusCards = [
            { label: t('admin.stats.pending'), count: pendingCount, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            { label: t('admin.stats.confirmed'), count: confirmedCount, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: t('admin.stats.delivered'), count: deliveredCount, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
            { label: t('admin.stats.returned'), count: returnedCount, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
            { label: t('admin.stats.failed'), count: failedCount, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
        ];

        return {
            stats,
            statusCards,
            todayOrdersCount: todayOrders.length,
            todayRevenue,
            conversionRate: orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 0
        };
    }, [orders]);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleOpenModal = (product?: any) => {
        if (product) {
            setForm({
                name: product.name,
                category: product.category,
                price: product.price,
                price30ml: product.price30ml || '',
                price50ml: product.price50ml || '',
                price100ml: product.price100ml || '',
                oldPrice: product.oldPrice || '',
                oldPrice30ml: product.oldPrice30ml || '',
                oldPrice50ml: product.oldPrice50ml || '',
                oldPrice100ml: product.oldPrice100ml || '',
                description: product.description || '',
                notesTop: product.notesTop || '',
                notesHeart: product.notesHeart || '',
                notesBase: product.notesBase || '',
                imageFiles: [],
                imagePreviews: [],
                existingImages: product.images || [],
                editingId: product.id,
            });
        } else {
            setForm(DEFAULT_FORM);
        }
        setSubmitError('');
        setIsModalOpen(true);
    };

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const previews = files.map(f => URL.createObjectURL(f));
        setForm(prev => ({
            ...prev,
            imageFiles: [...prev.imageFiles, ...files],
            imagePreviews: [...prev.imagePreviews, ...previews],
        }));
    };

    const removeExistingImage = (index: number) => {
        setForm((prev: FormShape) => ({
            ...prev,
            existingImages: prev.existingImages.filter((_, i: number) => i !== index),
        }));
    };

    const removeNewImage = (index: number) => {
        setForm((prev: FormShape) => {
            // F3 FIX: Revoke blob URL to free memory
            if (prev.imagePreviews[index]) {
                URL.revokeObjectURL(prev.imagePreviews[index]);
            }
            return {
                ...prev,
                imageFiles: prev.imageFiles.filter((_: File, i: number) => i !== index),
                imagePreviews: prev.imagePreviews.filter((_: string, i: number) => i !== index),
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');

        try {
            const fd = new FormData();
            fd.append('name', form.name);
            fd.append('category', form.category);
            fd.append('price', form.price);
            fd.append('price30ml', form.price30ml);
            fd.append('price50ml', form.price50ml);
            fd.append('price100ml', form.price100ml);
            fd.append('oldPrice', form.oldPrice);
            fd.append('oldPrice30ml', form.oldPrice30ml);
            fd.append('oldPrice50ml', form.oldPrice50ml);
            fd.append('oldPrice100ml', form.oldPrice100ml);
            fd.append('description', form.description);
            fd.append('notesTop', form.notesTop);
            fd.append('notesHeart', form.notesHeart);
            fd.append('notesBase', form.notesBase);
            fd.append('existingImages', JSON.stringify(form.existingImages));
            form.imageFiles.forEach(file => fd.append('images', file));

            const url = form.editingId ? `${API_URL}/api/products/${form.editingId}` : `${API_URL}/api/products`;
            const method = form.editingId ? 'PUT' : 'POST';
            const token = localStorage.getItem('lalen_admin_token');
            const headers: HeadersInit = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(url, { method, body: fd, headers });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Request failed');
            }

            await refreshProducts();

            setIsModalOpen(false);
            setForm(DEFAULT_FORM);
        } catch (err: unknown) {
            setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSettingUpload = async (key: string, file: File) => {
        setSettingsUploading(key);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const token = localStorage.getItem('lalen_admin_token');
            const res = await fetch(`${API_URL}/api/settings/${key}`, {
                method: 'PUT',
                body: fd,
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error('Upload failed');
            await refreshSettings();
        } catch (err) {
            console.error(`Failed to upload ${key}:`, err);
        } finally {
            setSettingsUploading(null);
        }
    };

    const handleExportOrders = () => {
        const token = localStorage.getItem('lalen_admin_token');
        fetch(`${API_URL}/api/admin/orders/export`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        })
            .then(res => res.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `lalen-orders-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            })
            .catch(err => { console.error(err); alert('Export failed'); });
    };

    const handleClearAllOrders = async () => {
        if (orders.length === 0) { alert('No orders to clear.'); return; }
        const token = localStorage.getItem('lalen_admin_token');
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

        try {
            const res = await fetch(`${API_URL}/api/admin/orders/export`, { headers });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lalen-orders-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { alert('Export failed — orders NOT deleted.'); return; }

        if (!confirm(`⚠️ Warning!\n\n${orders.length} orders downloaded. Delete all?`)) return;
        if (!confirm(`🔴 Final confirmation. Delete all ${orders.length} orders?`)) return;

        try {
            const res = await fetch(`${API_URL}/api/admin/orders/clear-all`, { method: 'DELETE', headers });
            if (!res.ok) throw new Error('Delete failed');
            alert('✅ Orders cleared.');
            refreshOrders();
        } catch (err: any) { alert(`❌ Failed: ${err.message}`); }
    };

    return (
        <div className="max-w-7xl mx-auto relative">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-text-primary tracking-widest uppercase mb-2">{t('admin.dashboard')}</h1>
                <p className="text-text-secondary">{t('admin.welcome')}</p>
            </div>

            {/* Tabs Navigation - Scrollable on mobile */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 pb-1 -mx-4 px-4 md:mx-0 md:px-0">
                {[
                    { id: 'dashboard', label: t('admin.tab.dashboard'), icon: <TrendingUp size={16} /> },
                    { id: 'orders', label: t('admin.tab.orders'), icon: <ShoppingCart size={16} /> },
                    { id: 'products', label: t('admin.tab.products'), icon: <Package size={16} /> },
                    { id: 'analytics', label: t('admin.tab.analytics'), icon: <BarChart3 size={16} /> },
                    { id: 'settings', label: t('admin.tab.settings'), icon: <Settings size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as Tab)}
                        className={`
                            flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] md:text-sm font-black tracking-[0.15em] uppercase transition-all whitespace-nowrap border
                            ${activeTab === tab.id
                                ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20 scale-105 z-10'
                                : 'text-text-secondary border-border-color/10 hover:border-primary/30 hover:text-primary active:scale-95'
                            }
                        `}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content with Suspense */}
            <div className="min-h-[400px]">
                <Suspense fallback={<div className="p-20 text-center text-primary animate-pulse">Loading Tab Content...</div>}>
                    {activeTab === 'dashboard' && (
                        <DashboardStats
                            stats={statsData.stats}
                            statusCards={statsData.statusCards}
                            todayOrdersCount={statsData.todayOrdersCount}
                            todayRevenue={statsData.todayRevenue}
                            conversionRate={statsData.conversionRate}
                        />
                    )}

                    {activeTab === 'orders' && (
                        <OrdersTable
                            orders={orders}
                            loading={ordersLoading}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            onExport={handleExportOrders}
                            onClearAll={handleClearAllOrders}
                            onUpdateStatus={updateOrderStatus}
                            onDeleteOrder={deleteOrder}
                        />
                    )}

                    {activeTab === 'products' && (
                        <ProductsTable
                            products={products}
                            loading={productsLoading}
                            t={t}
                            onAddProduct={() => handleOpenModal()}
                            onEditProduct={handleOpenModal}
                            onDeleteProduct={(id, name) => {
                                if (window.confirm(`Delete "${name}"?`)) deleteProduct(id);
                            }}
                        />
                    )}

                    {activeTab === 'analytics' && <AnalyticsDashboard />}

                    {activeTab === 'settings' && (
                        <SettingsTab
                            settings={settings}
                            settingsUploading={settingsUploading}
                            refreshSettings={refreshSettings}
                            handleSettingUpload={handleSettingUpload}
                            API_URL={API_URL}
                        />
                    )}
                </Suspense>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                submitting={submitting}
                submitError={submitError}
                removeExistingImage={removeExistingImage}
                removeNewImage={removeNewImage}
                handleFilesChange={handleFilesChange}
                fileInputRef={fileInputRef}
                t={t}
            />
        </div>
    );
};
export default AdminDashboard;