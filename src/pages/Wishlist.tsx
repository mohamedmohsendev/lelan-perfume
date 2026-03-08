import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Wishlist: React.FC = () => {
    const { wishlistItems } = useWishlist();
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-4 md:px-8 py-12 max-w-7xl animate-in fade-in duration-500 min-h-[60vh]">
            <h1 className="text-3xl font-bold tracking-[0.15em] uppercase text-primary mb-8 border-b border-border-color pb-4">
                {t('nav.wishlist')}
            </h1>

            {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlistItems.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-background-card flex items-center justify-center text-text-secondary mb-4 border border-border-color">
                        <Heart size={40} className="opacity-50" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary">
                        {t('wishlist.empty')}
                    </h2>
                    <p className="text-text-secondary max-w-md">
                        {t('wishlist.emptyDesc')}
                    </p>
                    <Link
                        to="/"
                        className="mt-4 px-8 py-3 bg-primary text-black font-bold tracking-widest uppercase hover:bg-highlight transition-colors flex items-center gap-2"
                    >
                        {t('home.title')}
                    </Link>
                </div>
            )}
        </div>
    );
};
