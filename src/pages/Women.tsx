
import { ProductCard } from '../components/ProductCard';
import { PageTransition } from '../components/PageTransition';
import { useProducts } from '../context/ProductContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useLanguage } from '../context/LanguageContext';

export const Women = () => {
    const { products } = useProducts();
    const { settings } = useSiteSettings();
    const { t } = useLanguage();
    const categoryProducts = products.filter(p => p.category === 'Women');

    return (
        <PageTransition>
            <div className="w-full pb-12">
                <div className="mb-12 border-b border-border-color pb-12 text-center pt-8 bg-background-card rounded-xl relative overflow-hidden">
                    {settings.women_bg && (
                        <>
                            <img
                                src={settings.women_bg}
                                alt="Women's collection background"
                                fetchPriority="high"
                                loading="eager"
                                className="absolute inset-0 w-full h-full object-cover z-0"
                            />
                            <div className="absolute inset-0 bg-black/60 z-0" />
                        </>
                    )}
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.2em] mb-4 text-primary">
                            {settings.women_title || "Women's Collection"}
                        </h1>
                        <p className="text-text-secondary max-w-xl mx-auto leading-relaxed tracking-wide">
                            {settings.women_description || "Elegant, captivating, and timeless fragrances designed for the modern woman."}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                    ))}
                </div>
                {categoryProducts.length === 0 && (
                    <div className="py-20 text-center text-text-secondary">{t('collection.empty')}</div>
                )}
            </div>
        </PageTransition>
    );
};
