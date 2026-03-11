import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Droplet, Wind, Sun, Heart, Minus, Plus, Truck, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { PageTransition } from '../components/PageTransition';

export const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, loading } = useProducts();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const product = products.find(p => p.id === id);

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const { t } = useLanguage();
    const liked = product ? isInWishlist(product.id) : false;

    // Size Selection
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    useEffect(() => {
        if (product && !selectedSize) {
            // Default select lowest available size if regular price isn't set, otherwise null
            if (!product.price && product.price30ml) setSelectedSize('30ml');
            else if (!product.price && product.price50ml) setSelectedSize('50ml');
            else if (!product.price && product.price100ml) setSelectedSize('100ml');
        }
    }, [product, selectedSize]);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto py-20 text-center">
                <span className="animate-spin inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="mt-4 text-text-secondary">{t('loading.product')}</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-6xl mx-auto py-20 text-center">
                <h1 className="text-3xl font-bold text-text-primary mb-4">{t('product.notFound')}</h1>
                <Link to="/" className="text-primary hover:underline uppercase tracking-wider text-sm">{t('product.backToCollection')}</Link>
            </div>
        );
    }

    // Build gallery: use images array, fallback to single imageUrl
    const gallery = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

    return (
        <PageTransition className="max-w-7xl mx-auto py-8">
            {/* Breadcrumb */}
            <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-8 uppercase text-xs tracking-widest font-semibold">
                <ArrowLeft size={14} /> {t('product.backToCollection')}
            </Link>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* ── LEFT: Image Gallery ──────────────────────────────────── */}
                <div className="w-full lg:w-1/2">
                    {/* Main Image */}
                    <div className="aspect-[4/5] bg-background-card border border-border-color rounded-2xl p-6 flex items-center justify-center relative overflow-hidden mb-4">
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
                        <motion.img
                            key={gallery[selectedImage]}
                            src={gallery[selectedImage]}
                            alt={product.name}
                            loading="eager"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            whileHover={{ scale: 1.05 }}
                            className="w-full h-full object-contain relative z-10"
                        />
                    </div>

                    {/* Thumbnails */}
                    {gallery.length > 1 && (
                        <div className="flex gap-3">
                            {gallery.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 bg-background-card p-1 ${i === selectedImage
                                        ? 'border-primary shadow-lg shadow-primary/20'
                                        : 'border-border-color hover:border-primary/50'
                                        }`}
                                    aria-label={`View image ${i + 1}`}
                                >
                                    <img src={img} alt={`${product.name} view ${i + 1}`} loading="lazy" className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Product Info ───────────────────────────────────── */}
                <div className="w-full lg:w-1/2 flex flex-col">
                    {/* Category breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-text-secondary mb-3">
                        <span className="text-primary tracking-[0.2em] uppercase font-bold">{product.category}</span>
                        <span>•</span>
                        <span className="tracking-wider uppercase">{t('product.limitedEdition')}</span>
                    </div>

                    {/* Name */}
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-wide mb-4 leading-tight">
                        {product.name}
                    </h1>

                    {/* Description */}
                    {product.description && (
                        <p className="text-text-secondary leading-relaxed mb-6 text-sm">
                            {product.description}
                        </p>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-4 mb-6">
                        <span className="text-3xl font-bold text-highlight tracking-wide">
                            {
                                selectedSize === '30ml' && product.price30ml ? product.price30ml :
                                    selectedSize === '50ml' && product.price50ml ? product.price50ml :
                                        selectedSize === '100ml' && product.price100ml ? product.price100ml :
                                            product.price
                            }
                        </span>
                        {(() => {
                            let oldPrice = '';
                            if (selectedSize === '30ml') {
                                oldPrice = product.oldPrice30ml || '';
                            } else if (selectedSize === '50ml') {
                                oldPrice = product.oldPrice50ml || '';
                            } else if (selectedSize === '100ml') {
                                oldPrice = product.oldPrice100ml || '';
                            } else {
                                oldPrice = product.oldPrice || '';
                            }
                            
                            return oldPrice ? (
                                <span className="text-lg text-text-secondary line-through">{oldPrice}</span>
                            ) : null;
                        })()}
                    </div>

                    {/* Size Selector */}
                    {(product.price30ml || product.price50ml || product.price100ml) && (
                        <div className="mb-8">
                            <h3 className="text-xs uppercase tracking-widest text-text-secondary font-semibold mb-3">{t('product.selectSize')}</h3>
                            <div className="flex flex-wrap gap-3">
                                {product.price && (
                                    <button
                                        onClick={() => setSelectedSize(null)}
                                        className={`px-6 py-2 border rounded transition-colors text-sm font-bold tracking-wider uppercase ${selectedSize === null ? 'border-primary text-primary bg-primary/10' : 'border-border-color text-text-secondary hover:border-primary/50 hover:text-text-primary'}`}
                                    >
                                        {t('product.standard')}
                                    </button>
                                )}
                                {product.price30ml && (
                                    <button
                                        onClick={() => setSelectedSize('30ml')}
                                        className={`px-6 py-2 border rounded transition-colors text-sm font-bold tracking-wider uppercase ${selectedSize === '30ml' ? 'border-primary text-primary bg-primary/10' : 'border-border-color text-text-secondary hover:border-primary/50 hover:text-text-primary'}`}
                                    >
                                        30 ML
                                    </button>
                                )}
                                {product.price50ml && (
                                    <button
                                        onClick={() => setSelectedSize('50ml')}
                                        className={`px-6 py-2 border rounded transition-colors text-sm font-bold tracking-wider uppercase ${selectedSize === '50ml' ? 'border-primary text-primary bg-primary/10' : 'border-border-color text-text-secondary hover:border-primary/50 hover:text-text-primary'}`}
                                    >
                                        50 ML
                                    </button>
                                )}
                                {product.price100ml && (
                                    <button
                                        onClick={() => setSelectedSize('100ml')}
                                        className={`px-6 py-2 border rounded transition-colors text-sm font-bold tracking-wider uppercase ${selectedSize === '100ml' ? 'border-primary text-primary bg-primary/10' : 'border-border-color text-text-secondary hover:border-primary/50 hover:text-text-primary'}`}
                                    >
                                        100 ML
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Scent Pyramid */}
                    {(product.notesTop || product.notesHeart || product.notesBase) && (
                        <div className="mb-8 bg-background-card rounded-xl border border-border-color overflow-hidden">
                            <h3 className="text-sm font-bold tracking-widest uppercase px-6 py-4 text-primary border-b border-border-color bg-background-dark">
                                {t('product.scentPyramid')}
                            </h3>
                            <div className="divide-y divide-border-color">
                                {product.notesTop && (
                                    <div className="flex items-center gap-4 px-6 py-4">
                                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20">
                                            <Sun size={16} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-text-primary text-xs uppercase tracking-widest">{t('product.topNotes')}</h4>
                                            <p className="text-text-secondary text-sm mt-0.5">{product.notesTop}</p>
                                        </div>
                                    </div>
                                )}
                                {product.notesHeart && (
                                    <div className="flex items-center gap-4 px-6 py-4">
                                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20">
                                            <Wind size={16} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-text-primary text-xs uppercase tracking-widest">{t('product.heartNotes')}</h4>
                                            <p className="text-text-secondary text-sm mt-0.5">{product.notesHeart}</p>
                                        </div>
                                    </div>
                                )}
                                {product.notesBase && (
                                    <div className="flex items-center gap-4 px-6 py-4">
                                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20">
                                            <Droplet size={16} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-text-primary text-xs uppercase tracking-widest">{t('product.baseNotes')}</h4>
                                            <p className="text-text-secondary text-sm mt-0.5">{product.notesBase}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Add to Cart Row */}
                    <div className="flex items-center gap-3 mb-6">
                        {/* Wishlist */}
                        <button
                            onClick={() => {
                                if (!product) return;
                                if (liked) {
                                    removeFromWishlist(product.id);
                                } else {
                                    addToWishlist(product);
                                }
                            }}
                            className={`w-12 h-12 rounded border flex items-center justify-center transition-all duration-200 flex-shrink-0 ${liked
                                ? 'border-red-500 bg-red-500/10 text-red-500'
                                : 'border-border-color text-text-secondary hover:border-primary hover:text-primary'
                                }`}
                            aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                        </button>

                        {/* Add to Cart */}
                        <button
                            onClick={() => {
                                const finalPrice =
                                    selectedSize === '30ml' && product.price30ml ? product.price30ml :
                                        selectedSize === '50ml' && product.price50ml ? product.price50ml :
                                            selectedSize === '100ml' && product.price100ml ? product.price100ml :
                                                product.price;

                                addToCart(product, quantity, selectedSize || undefined, finalPrice);
                                navigate('/checkout');
                            }}
                            className="flex-1 py-3.5 bg-primary text-black font-bold tracking-[0.12em] uppercase rounded flex items-center justify-center gap-2 hover:bg-highlight transition-colors text-sm shadow-lg shadow-primary/20"
                        >
                            <ShoppingBag size={16} />
                            {t('product.addToCart')}
                        </button>

                        {/* Quantity */}
                        <div className="flex items-center border border-border-color rounded overflow-hidden flex-shrink-0">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-10 h-12 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-white/5 transition-colors"
                                aria-label="Decrease quantity"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="w-10 h-12 flex items-center justify-center text-sm font-bold text-text-primary border-x border-border-color">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="w-10 h-12 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-white/5 transition-colors"
                                aria-label="Increase quantity"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap gap-4 text-xs text-text-secondary mt-auto pt-6 border-t border-border-color">
                        <span className="flex items-center gap-1.5">
                            <Truck size={14} className="text-primary" /> {t('product.freeShipping')}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-primary" /> {t('product.authentic')}
                        </span>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};
