import { useState, useRef } from 'react';
import { Users, Package, ShoppingCart, TrendingUp, Plus, Edit2, Trash2, X, Upload, ImageIcon, Settings, Image as ImageLucide } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

const API_URL = import.meta.env.VITE_API_URL || '';

interface FormShape {
    name: string;
    category: string;
    price: string;
    oldPrice: string;
    description: string;
    notesTop: string;
    notesHeart: string;
    notesBase: string;
    imageFiles: File[];
    imagePreviews: string[];
    existingImages: string[];
    editingId: string | null;
}

const DEFAULT_FORM: FormShape = {
    name: '', category: 'Unisex', price: '', oldPrice: '', description: '',
    notesTop: '', notesHeart: '', notesBase: '',
    imageFiles: [], imagePreviews: [], existingImages: [], editingId: null,
};

type Tab = 'products' | 'settings';

export const AdminDashboard = () => {
    const { products, loading, refreshProducts, deleteProduct } = useProducts();
    const { t } = useLanguage();
    const { settings, refreshSettings } = useSiteSettings();
    const [activeTab, setActiveTab] = useState<Tab>('products');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<FormShape>(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Settings state ────────────────────────────────────────────────────
    const [settingsUploading, setSettingsUploading] = useState<string | null>(null);

    const stats = [
        { label: 'Total Sales', value: '—', icon: <TrendingUp className="text-primary" size={24} /> },
        { label: 'Total Orders', value: '—', icon: <ShoppingCart className="text-primary" size={24} /> },
        { label: 'Active Products', value: products.length.toString(), icon: <Package className="text-primary" size={24} /> },
        { label: 'Total Customers', value: '—', icon: <Users className="text-primary" size={24} /> },
    ];

    // ── Product modal ─────────────────────────────────────────────────────
    const handleOpenModal = (product?: typeof products[0]) => {
        if (product) {
            setForm({
                name: product.name,
                category: product.category,
                price: product.price,
                oldPrice: product.oldPrice || '',
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
        setForm(prev => ({
            ...prev,
            existingImages: prev.existingImages.filter((_, i) => i !== index),
        }));
    };

    const removeNewImage = (index: number) => {
        setForm(prev => ({
            ...prev,
            imageFiles: prev.imageFiles.filter((_, i) => i !== index),
            imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
        }));
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
            fd.append('oldPrice', form.oldPrice);
            fd.append('description', form.description);
            fd.append('notesTop', form.notesTop);
            fd.append('notesHeart', form.notesHeart);
            fd.append('notesBase', form.notesBase);
            fd.append('existingImages', JSON.stringify(form.existingImages));

            form.imageFiles.forEach(file => fd.append('images', file));

            const url = form.editingId
                ? `${API_URL}/api/products/${form.editingId}`
                : `${API_URL}/api/products`;
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

    // ── Settings upload ───────────────────────────────────────────────────
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

    // ── Settings items config ─────────────────────────────────────────────
    const settingsItems = [
        { key: 'logo_url', label: 'Website Logo', desc: 'Main logo shown in header & footer' },
        { key: 'hero_bg', label: 'Home Hero Background', desc: 'Background image for the hero section' },
        { key: 'men_bg', label: "Men's Collection BG", desc: 'Background for Men category page' },
        { key: 'women_bg', label: "Women's Collection BG", desc: 'Background for Women category page' },
        { key: 'unisex_bg', label: 'Unisex Collection BG', desc: 'Background for Unisex category page' },
    ];

    return (
        <div className="max-w-7xl mx-auto relative">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-text-primary tracking-widest uppercase mb-2">Dashboard</h1>
                <p className="text-text-secondary">Welcome back, Admin.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-background-card p-6 rounded-xl border border-border-color flex items-center gap-6">
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-text-secondary text-sm uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-text-primary">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-background-card rounded-lg p-1 border border-border-color w-fit">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded text-sm font-bold tracking-wider uppercase transition-all ${activeTab === 'products' ? 'bg-primary text-black' : 'text-text-secondary hover:text-primary'}`}
                >
                    <Package size={16} /> Products
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded text-sm font-bold tracking-wider uppercase transition-all ${activeTab === 'settings' ? 'bg-primary text-black' : 'text-text-secondary hover:text-primary'}`}
                >
                    <Settings size={16} /> Site Settings
                </button>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* PRODUCTS TAB */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'products' && (
                <div className="bg-background-card rounded-xl border border-border-color overflow-hidden">
                    <div className="p-6 border-b border-border-color flex justify-between items-center bg-background-dark">
                        <h2 className="text-lg font-bold tracking-widest uppercase text-primary">Products</h2>
                        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 text-sm text-text-primary bg-primary/20 hover:bg-primary hover:text-black transition-colors px-4 py-2 rounded font-semibold tracking-wider uppercase">
                            <Plus size={16} /> {t('admin.add')}
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center text-text-secondary">Loading products...</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-background-dark text-text-secondary uppercase text-xs tracking-widest">
                                    <tr>
                                        <th className="p-6 font-semibold">Product</th>
                                        <th className="p-6 font-semibold">Category</th>
                                        <th className="p-6 font-semibold">Price</th>
                                        <th className="p-6 font-semibold">Images</th>
                                        <th className="p-6 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color">
                                    {products.map(product => (
                                        <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-6 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded border border-border-color bg-background-dark overflow-hidden flex items-center justify-center">
                                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full image-blend object-contain" />
                                                </div>
                                                <div>
                                                    <span className="font-bold tracking-wide block">{product.name}</span>
                                                    {product.description && <span className="text-xs text-text-secondary line-clamp-1">{product.description}</span>}
                                                </div>
                                            </td>
                                            <td className="p-6 text-sm text-text-secondary tracking-wider uppercase">{product.category}</td>
                                            <td className="p-6">
                                                <span className="font-medium text-highlight">{product.price}</span>
                                                {product.oldPrice && <span className="text-xs text-text-secondary line-through ml-2">{product.oldPrice}</span>}
                                            </td>
                                            <td className="p-6 text-sm text-text-secondary">{(product.images || []).length} imgs</td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleOpenModal(product)} className="text-text-secondary hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => deleteProduct(product.id)} className="text-text-secondary hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!loading && products.length === 0 && (
                            <div className="p-12 text-center text-text-secondary">No products yet. Add your first product.</div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* SETTINGS TAB */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {activeTab === 'settings' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {settingsItems.map(item => (
                        <div key={item.key} className="bg-background-card rounded-xl border border-border-color overflow-hidden">
                            <div className="p-5 border-b border-border-color bg-background-dark flex items-center gap-3">
                                <ImageLucide size={18} className="text-primary" />
                                <div>
                                    <h3 className="font-bold text-text-primary text-sm tracking-wider">{item.label}</h3>
                                    <p className="text-xs text-text-secondary">{item.desc}</p>
                                </div>
                            </div>
                            <div className="p-5">
                                {settings[item.key] ? (
                                    <div className="mb-4 rounded-lg overflow-hidden border border-border-color bg-background-dark">
                                        <img src={settings[item.key]} alt={item.label} className="w-full h-32 object-contain p-2" />
                                    </div>
                                ) : (
                                    <div className="mb-4 h-32 rounded-lg border-2 border-dashed border-border-color flex items-center justify-center text-text-secondary text-xs tracking-wider">
                                        No image uploaded
                                    </div>
                                )}
                                <label className="cursor-pointer flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-primary/10 hover:bg-primary hover:text-black text-primary transition-colors text-xs font-bold tracking-wider uppercase">
                                    {settingsUploading === item.key ? (
                                        <>
                                            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={14} /> Upload Image
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) handleSettingUpload(item.key, file);
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* PRODUCT MODAL */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-background-dark w-full max-w-lg rounded-2xl border border-border-color shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-border-color flex justify-between items-center flex-shrink-0">
                            <h2 className="text-xl font-bold tracking-widest text-primary uppercase">
                                {form.editingId ? t('admin.edit') : t('admin.add')}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-primary transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Name */}
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">Product Name</label>
                                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} type="text" className="w-full bg-background-card border border-border-color rounded p-3 text-text-primary focus:outline-none focus:border-primary transition-colors" />
                            </div>

                            {/* Category + Price row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">Category</label>
                                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full bg-background-card border border-border-color rounded p-3 text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none">
                                        <option value="Men">Men</option>
                                        <option value="Women">Women</option>
                                        <option value="Unisex">Unisex</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">Price</label>
                                    <input required value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} type="text" placeholder="850 EGP" className="w-full bg-background-card border border-border-color rounded p-3 text-text-primary focus:outline-none focus:border-primary transition-colors" />
                                </div>
                            </div>

                            {/* Old Price */}
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">Old Price (optional — shows as crossed out)</label>
                                <input value={form.oldPrice} onChange={e => setForm(p => ({ ...p, oldPrice: e.target.value }))} type="text" placeholder="1,200 EGP" className="w-full bg-background-card border border-border-color rounded p-3 text-text-primary focus:outline-none focus:border-primary transition-colors" />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">Description</label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-background-card border border-border-color rounded p-3 text-text-primary focus:outline-none focus:border-primary transition-colors resize-none" placeholder="A masterful blend of the finest ingredients..." />
                            </div>

                            {/* Scent Notes */}
                            <div className="bg-background-card rounded-lg border border-border-color p-4 space-y-3">
                                <h4 className="text-xs uppercase tracking-widest text-primary font-bold">Scent Notes</h4>
                                <div>
                                    <label className="block text-xs text-text-secondary mb-1">Top Notes</label>
                                    <input value={form.notesTop} onChange={e => setForm(p => ({ ...p, notesTop: e.target.value }))} type="text" placeholder="Bergamot, Pink Pepper, Lemon" className="w-full bg-background-dark border border-border-color rounded p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs text-text-secondary mb-1">Heart Notes</label>
                                    <input value={form.notesHeart} onChange={e => setForm(p => ({ ...p, notesHeart: e.target.value }))} type="text" placeholder="Rose, Jasmine, Cardamom" className="w-full bg-background-dark border border-border-color rounded p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-xs text-text-secondary mb-1">Base Notes</label>
                                    <input value={form.notesBase} onChange={e => setForm(p => ({ ...p, notesBase: e.target.value }))} type="text" placeholder="Oud, Vanilla, Amber" className="w-full bg-background-dark border border-border-color rounded p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors" />
                                </div>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">Product Images (up to 5)</label>

                                {/* Existing images */}
                                {form.existingImages.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {form.existingImages.map((img, i) => (
                                            <div key={i} className="relative w-16 h-16 rounded border border-border-color overflow-hidden bg-background-card group">
                                                <img src={img} alt="" className="w-full h-full object-contain p-1" />
                                                <button type="button" onClick={() => removeExistingImage(i)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New image previews */}
                                {form.imagePreviews.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {form.imagePreviews.map((img, i) => (
                                            <div key={i} className="relative w-16 h-16 rounded border border-primary/40 overflow-hidden bg-background-card group">
                                                <img src={img} alt="" className="w-full h-full object-contain p-1" />
                                                <button type="button" onClick={() => removeNewImage(i)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400">
                                                    <X size={14} />
                                                </button>
                                                <span className="absolute top-0 right-0 bg-primary text-black text-[8px] font-bold px-1">NEW</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-border-color hover:border-primary rounded-lg p-4 flex flex-col items-center gap-2 transition-colors group"
                                >
                                    <ImageIcon size={28} className="text-text-secondary group-hover:text-primary transition-colors" />
                                    <span className="text-xs text-text-secondary group-hover:text-primary transition-colors tracking-wider">Click to add images</span>
                                </button>
                            </div>

                            {submitError && (
                                <p className="text-red-400 text-xs p-2 bg-red-500/10 rounded border border-red-500/20">{submitError}</p>
                            )}

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 border border-border-color hover:bg-white/5 text-text-primary transition-colors rounded uppercase text-xs font-bold tracking-[0.1em]">
                                    {t('admin.cancel')}
                                </button>
                                <button type="submit" disabled={submitting} className="flex-1 py-3 px-4 bg-primary text-black hover:bg-highlight disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded uppercase text-xs font-bold tracking-[0.1em] flex items-center justify-center gap-2">
                                    {submitting ? (
                                        <>
                                            <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                                            Uploading...
                                        </>
                                    ) : (
                                        form.editingId ? t('admin.save') : t('admin.add')
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
