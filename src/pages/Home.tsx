import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { useLanguage } from '../context/LanguageContext';

export const Home = () => {
    const { products, loading } = useProducts();
    const { t } = useLanguage();
    const [filter, setFilter] = useState<string>('All');

    // Using mapping to pass the right keys for translation while keeping filter logic simple
    const categories = [
        { id: 'All', labelKey: 'home.all' },
        { id: 'Men', labelKey: 'nav.men' },
        { id: 'Women', labelKey: 'nav.women' },
        { id: 'Unisex', labelKey: 'nav.unisex' }
    ];

    const displayedProducts = filter === 'All'
        ? products
        : products.filter(p => p.category === filter);

    return (
        <div className="flex flex-col md:flex-row-reverse gap-8 w-full mt-4 pb-12">
            <aside className="hidden md:block md:w-64 flex-shrink-0">
                <div className="sticky top-28 pe-6">
                    <h2 className="text-sm font-bold text-highlight tracking-[0.2em] uppercase mb-6 pb-4 border-b border-border-color">{t('home.collections')}</h2>
                    <div className="flex flex-col gap-1 font-medium text-sm">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setFilter(cat.id)}
                                className={`text-left uppercase tracking-widest py-3 px-4 transition-all duration-300 border-l-2 rtl:text-right ${cat.id === filter ? 'text-primary border-primary bg-primary/5 font-bold' : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-white/5 rtl:border-l-0 rtl:border-r-2'
                                    }`}
                            >
                                {t(cat.labelKey)}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            <div className="flex-1">
                <div className="mb-8 flex items-end justify-between border-b border-border-color pb-4">
                    <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.15em]">
                        {filter === 'All' ? t('home.title') : t(categories.find(c => c.id === filter)?.labelKey || '')}
                    </h1>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-text-secondary font-medium tracking-wide">
                        <span className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-4" />
                        <p>Loading products...</p>
                    </div>
                ) : displayedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} priority={index < 3} />
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
