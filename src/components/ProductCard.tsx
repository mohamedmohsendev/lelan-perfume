import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export interface Product {
    id: string;
    name: string;
    category: string;
    price: string;
    oldPrice: string;
    description: string;
    imageUrl: string;
    images: string[];
    notesTop: string;
    notesHeart: string;
    notesBase: string;
}

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <div className="group flex flex-col overflow-hidden rounded-lg border border-border-color/80 hover:border-primary/50 transition-all duration-300 bg-background-card hover:shadow-2xl hover:shadow-primary/5">
            <div className="relative aspect-[4/5] overflow-hidden bg-background-dark p-4 flex items-center justify-center">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-contain image-blend group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {product.oldPrice && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        Sale
                    </span>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1 border-t border-border-color/50 text-center items-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary mb-2 font-semibold">
                    {product.category}
                </span>
                <h3 className="text-lg font-bold text-text-primary tracking-wide mb-2 line-clamp-1">
                    {product.name}
                </h3>
                {product.description && (
                    <p className="text-sm text-text-secondary line-clamp-2 mb-4 leading-relaxed px-2">
                        {product.description}
                    </p>
                )}

                <div className="flex flex-col items-center gap-1 mb-6">
                    <p className="text-highlight font-bold tracking-widest text-xl">
                        {product.price}
                    </p>
                    {product.oldPrice && (
                        <p className="text-text-secondary text-sm line-through">
                            {product.oldPrice}
                        </p>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 w-full">
                    <Link
                        to={`/product/${product.id}`}
                        className="flex-1 flex items-center justify-center py-3 px-4 bg-transparent border border-primary/30 text-text-primary hover:bg-primary hover:text-black transition-all duration-300 rounded uppercase text-xs font-bold tracking-[0.15em] hover:border-primary"
                    >
                        Discover
                    </Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                        }}
                        className="w-12 h-12 flex items-center justify-center bg-transparent border border-primary/30 text-primary hover:bg-primary hover:text-black transition-all duration-300 rounded hover:border-primary shrink-0 group/btn"
                    >
                        <Plus size={20} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};
