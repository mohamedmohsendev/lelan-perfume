
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const Men = () => {
    const { products } = useProducts();
    const { settings } = useSiteSettings();
    const categoryProducts = products.filter(p => p.category === 'Men');

    return (
        <div className="w-full pb-12">
            <div
                className="mb-12 border-b border-border-color pb-12 text-center pt-8 bg-background-card rounded-xl relative overflow-hidden"
                style={settings.men_bg ? { backgroundImage: `url(${settings.men_bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
                {settings.men_bg && <div className="absolute inset-0 bg-black/60 z-0" />}
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.2em] mb-4 text-primary">Men's Collection</h1>
                    <p className="text-text-secondary max-w-xl mx-auto leading-relaxed tracking-wide">Bold, commanding, and unforgettable signatures crafted for the modern man.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
            {categoryProducts.length === 0 && (
                <div className="py-20 text-center text-text-secondary">No products in this collection yet.</div>
            )}
        </div>
    );
};
