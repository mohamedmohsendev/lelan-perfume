import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import type { Product } from '../types';

export type { Product };

export const ProductCard: React.FC<{ product: Product, priority?: boolean }> = React.memo(({ product, priority = false }) => {
    const { addToCart } = useCart();
    const { t } = useLanguage();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const displayPrice = product.price || product.price30ml || product.price50ml || product.price100ml;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();

        let selectedSize: string | undefined;
        let finalPrice = product.price;

        if (!product.price) {
            if (product.price30ml) { selectedSize = '30ml'; finalPrice = product.price30ml; }
            else if (product.price50ml) { selectedSize = '50ml'; finalPrice = product.price50ml; }
            else if (product.price100ml) { selectedSize = '100ml'; finalPrice = product.price100ml; }
        }

        addToCart(product, 1, selectedSize, finalPrice);
    };

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border border-border-color hover:border-border-color/80 transition-all duration-300 bg-background-card">
            {/* Top: Image Area */}
            <div className="relative aspect-[4/5] bg-gray-100 dark:bg-[#1a1c1d] flex items-center justify-center p-6 overflow-hidden">
                <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center block">
                    <img
                        src={product.imageUrl}
                        alt={product.name || "LALEN Perfume"}
                        loading={priority ? "eager" : "lazy"}
                        fetchPriority={priority ? "high" : "auto"}
                        width={400}
                        height={500}
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                </Link>

                {/* Sale Badge */}
                {product.oldPrice && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded shadow-sm z-10" dir="ltr">
                        {(() => {
                            const oldP = parseInt(product.oldPrice.replace(/\D/g, ''));
                            const newP = parseInt((displayPrice || '').replace(/\D/g, ''));
                            if (oldP && newP && oldP > newP) {
                                const percent = Math.round(((oldP - newP) / oldP) * 100);
                                return `-${percent}%`;
                            }
                            return 'Sale';
                        })()}
                    </span>
                )}

                {/* Hover Icons (Center) */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                    <Link to={`/product/${product.id}`} className="w-12 h-12 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-lg hover:bg-gray-50 hover:scale-110 transition-all pointer-events-auto">
                        <Eye size={20} />
                    </Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (isInWishlist(product.id)) {
                                removeFromWishlist(product.id);
                            } else {
                                addToWishlist(product);
                            }
                        }}
                        className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-50 hover:scale-110 transition-all pointer-events-auto ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-800'}`}
                    >
                        <Heart size={20} className={isInWishlist(product.id) ? 'fill-current' : ''} />
                    </button>
                </div>

                {/* Add to Cart Button (Slide UP from bottom) */}
                <button
                    onClick={handleAddToCart}
                    className="absolute bottom-0 left-0 right-0 bg-primary hover:bg-highlight text-black py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2 font-bold z-20"
                >
                    <span className="text-sm uppercase tracking-widest">{t('product.addToCart')}</span>
                    <ShoppingBag size={18} />
                </button>
            </div>

            {/* Bottom: Text Info */}
            <div className="p-5 flex flex-col items-center text-center bg-white dark:bg-background-card relative z-30">
                <Link to={`/product/${product.id}`} className="block">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-text-primary mb-1 line-clamp-1">
                        {product.name}
                    </h3>
                </Link>
                {product.description && (
                    <p className="text-sm text-gray-600 dark:text-text-secondary mb-3 line-clamp-1">
                        {product.description}
                    </p>
                )}

                <div className="flex flex-row-reverse justify-center items-center gap-3 w-full" dir="ltr">
                    <div className="font-bold text-highlight flex items-baseline gap-1">
                        <span className="text-sm">ج.م</span>
                        <span className="text-xl">{displayPrice?.replace(/\D/g, '')}</span>
                    </div>
                    {product.oldPrice && (
                        <div className="text-gray-400 dark:text-gray-500 line-through flex items-baseline gap-1">
                            <span className="text-xs">ج.م</span>
                            <span className="text-sm">{product.oldPrice.replace(/\D/g, '')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
