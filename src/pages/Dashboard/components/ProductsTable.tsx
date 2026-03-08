import React from 'react';
import { Plus, Edit2, Trash2, Package, Eye, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '../../../types';

interface ProductsTableProps {
    products: Product[];
    loading: boolean;
    t: (key: string) => string;
    onAddProduct: () => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (id: string, name: string) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
    products,
    loading,
    t,
    onAddProduct,
    onEditProduct,
    onDeleteProduct
}) => {
    return (
        <div className="bg-background-card rounded-2xl border border-border-color/50 overflow-hidden shadow-2xl">
            {/* Header Section */}
            <div className="p-8 border-b border-border-color/30 flex justify-between items-center bg-gradient-to-r from-background-dark to-background-card">
                <div>
                    <h2 className="text-2xl font-bold tracking-[0.2em] uppercase text-primary mb-1 flex items-center gap-3">
                        <Layers className="text-primary" size={24} />
                        Product Collection
                    </h2>
                    <p className="text-text-secondary text-xs tracking-widest uppercase">Manage your luxury perfume inventory</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAddProduct}
                    className="flex items-center gap-3 text-sm text-black bg-primary hover:bg-highlight transition-all px-6 py-3 rounded-xl font-bold tracking-widest uppercase shadow-lg shadow-primary/20"
                >
                    <Plus size={18} strokeWidth={3} /> {t('admin.add')}
                </motion.button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full"
                            />
                            <p className="text-text-secondary tracking-widest uppercase text-xs">Curating products...</p>
                        </div>
                    </div>
                ) : (
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-background-dark/50 text-text-secondary uppercase text-[10px] tracking-[0.2em] font-black border-b border-border-color/20">
                            <tr>
                                <th className="px-8 py-5">Essential Details</th>
                                <th className="px-8 py-5">Classification</th>
                                <th className="px-8 py-5">Valuation</th>
                                <th className="px-8 py-5">Inventory</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color/10">
                            <AnimatePresence>
                                {products.map((product, index) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={product.id}
                                        onClick={() => onEditProduct(product)}
                                        className="hover:bg-primary/[0.04] transition-colors group relative cursor-pointer"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="relative w-20 h-20 rounded-xl border border-border-color bg-background-dark overflow-hidden flex items-center justify-center p-2 group-hover:border-primary/50 transition-colors shadow-inner">
                                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Eye size={18} className="text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-lg font-bold tracking-wide block text-text-primary mb-1 group-hover:text-primary transition-colors">{product.name}</span>
                                                    {product.description && (
                                                        <span className="text-xs text-text-secondary line-clamp-1 italic max-w-xs">{product.description}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-[10px] text-primary font-black tracking-[0.15em] uppercase">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-highlight text-lg tracking-wider">{product.price}</span>
                                                {product.oldPrice && (
                                                    <span className="text-[10px] text-text-secondary line-through opacity-50">{product.oldPrice}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-text-secondary">
                                                <Package size={14} className="text-primary/60" />
                                                <span className="text-xs font-bold tracking-widest uppercase">{(product.images || []).length} Masterpieces</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(198, 166, 100, 0.1)' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditProduct(product);
                                                    }}
                                                    className="text-text-secondary hover:text-primary transition-colors p-3 rounded-xl border border-transparent hover:border-primary/20"
                                                    title="Edit Product"
                                                >
                                                    <Edit2 size={18} />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteProduct(product.id, product.name);
                                                    }}
                                                    className="text-text-secondary hover:text-red-500 transition-colors p-3 rounded-xl border border-transparent hover:border-red-500/20"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={18} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
                {!loading && products.length === 0 && (
                    <div className="p-24 text-center">
                        <div className="max-w-xs mx-auto space-y-4">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto border border-primary/10">
                                <Package size={32} className="text-primary/30" />
                            </div>
                            <h3 className="text-lg font-bold text-text-primary tracking-widest uppercase">No collections found</h3>
                            <p className="text-text-secondary text-sm">Begin your luxury journey by adding your first masterpiece to the collection.</p>
                            <button onClick={onAddProduct} className="text-primary font-bold text-xs tracking-widest uppercase hover:text-highlight transition-colors flex items-center gap-2 mx-auto mt-4">
                                <Plus size={14} /> Add Product
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
