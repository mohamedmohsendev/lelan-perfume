import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';

export const Home = () => {
    const { products, loading } = useProducts();
    const [filter, setFilter] = useState<string>('All');
    const categories = ['All', 'Men', 'Women', 'Unisex'];

    const displayedProducts = filter === 'All'
        ? products
        : products.filter(p => p.category === filter);

    return (
        <div className="flex flex-col md:flex-row gap-8 w-full mt-4">
            <aside className="w-full md:w-56 flex-shrink-0">
                <div className="sticky top-28 border border-border-color/80 rounded-lg p-6 bg-background-card shadow-xl">
                    <h2 className="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-8">Collections</h2>
                    <div className="flex flex-col gap-2 font-medium text-sm">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`text-left uppercase tracking-widest py-3 px-4 rounded text-xs transition-all duration-300 ${cat === filter ? 'text-primary bg-primary/10 border border-primary/20' : 'text-text-secondary border border-transparent hover:text-text-primary hover:bg-white/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            <div className="flex-1">
                <div className="mb-8 flex items-end justify-between border-b border-border-color pb-4">
                    <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.15em]">{filter === 'All' ? 'Boutique Collection' : filter}</h1>
                    <span className="text-text-secondary text-sm font-semibold tracking-wider">{displayedProducts.length} Items</span>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-text-secondary font-medium tracking-wide">
                        <span className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-4" />
                        <p>Loading products...</p>
                    </div>
                ) : displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center text-text-secondary font-medium tracking-wide">
                        No products found. Check back soon!
                    </div>
                )}
            </div>
        </div>
    );
};
