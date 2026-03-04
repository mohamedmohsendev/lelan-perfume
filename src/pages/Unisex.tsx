
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const Unisex = () => {
    const { products } = useProducts();
    const { settings } = useSiteSettings();
    const categoryProducts = products.filter(p => p.category === 'Unisex');

    return (
        <div className="w-full pb-12">
            <div
                className="mb-12 border-b border-border-color pb-12 text-center pt-8 bg-background-card rounded-xl relative overflow-hidden"
                style={settings.unisex_bg ? { backgroundImage: `url(${settings.unisex_bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
                {settings.unisex_bg && <div className="absolute inset-0 bg-black/60 z-0" />}
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.2em] mb-4 text-primary">Unisex Collection</h1>
                    <p className="text-text-secondary max-w-xl mx-auto leading-relaxed tracking-wide">Harmonious and balanced scents designed to be worn by anyone, anywhere.</p>
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
