import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Droplet, Wind, Sun, Heart, Minus, Plus, Truck, ShieldCheck } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

export const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, loading } = useProducts();
    const { addToCart } = useCart();
    const product = products.find(p => p.id === id);

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [liked, setLiked] = useState(false);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto py-20 text-center">
                <span className="animate-spin inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="mt-4 text-text-secondary">Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-6xl mx-auto py-20 text-center">
                <h1 className="text-3xl font-bold text-text-primary mb-4">Product Not Found</h1>
                <Link to="/" className="text-primary hover:underline uppercase tracking-wider text-sm">← Back to Collection</Link>
            </div>
        );
    }

    // Build gallery: use images array, fallback to single imageUrl
    const gallery = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

    return (
        <div className="max-w-7xl mx-auto py-8">
            {/* Breadcrumb */}
            <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-8 uppercase text-xs tracking-widest font-semibold">
                <ArrowLeft size={14} /> Back to Collection
            </Link>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* ── LEFT: Image Gallery ──────────────────────────────────── */}
                <div className="w-full lg:w-1/2">
                    {/* Main Image */}
                    <div className="aspect-[4/5] bg-background-card border border-border-color rounded-2xl p-6 flex items-center justify-center relative overflow-hidden mb-4">
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
                        <img
                            src={gallery[selectedImage]}
                            alt={product.name}
                            loading="eager" // Eager for main image above fold
                            className="w-full h-full object-contain relative z-10 transition-all duration-500"
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
                                >
                                    <img src={img} alt="" loading="lazy" className="w-full h-full object-contain" />
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
                        <span className="tracking-wider uppercase">Limited Edition</span>
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
                    <div className="flex items-baseline gap-4 mb-8">
                        <span className="text-3xl font-bold text-highlight tracking-wide">{product.price}</span>
                        {product.oldPrice && (
                            <span className="text-lg text-text-secondary line-through">{product.oldPrice}</span>
                        )}
                    </div>

                    {/* Scent Pyramid */}
                    {(product.notesTop || product.notesHeart || product.notesBase) && (
                        <div className="mb-8 bg-background-card rounded-xl border border-border-color overflow-hidden">
                            <h3 className="text-sm font-bold tracking-widest uppercase px-6 py-4 text-primary border-b border-border-color bg-background-dark">
                                Scent Pyramid
                            </h3>
                            <div className="divide-y divide-border-color">
                                {product.notesTop && (
                                    <div className="flex items-center gap-4 px-6 py-4">
                                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20">
                                            <Sun size={16} className="text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-text-primary text-xs uppercase tracking-widest">Top Notes</h4>
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
                                            <h4 className="font-bold text-text-primary text-xs uppercase tracking-widest">Heart Notes</h4>
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
                                            <h4 className="font-bold text-text-primary text-xs uppercase tracking-widest">Base Notes</h4>
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
                            onClick={() => setLiked(!liked)}
                            className={`w-12 h-12 rounded border flex items-center justify-center transition-all duration-200 flex-shrink-0 ${liked
                                ? 'border-red-500 bg-red-500/10 text-red-500'
                                : 'border-border-color text-text-secondary hover:border-primary hover:text-primary'
                                }`}
                        >
                            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                        </button>

                        {/* Add to Cart */}
                        <button
                            onClick={() => {
                                addToCart(product, quantity);
                                navigate('/checkout');
                            }}
                            className="flex-1 py-3.5 bg-primary text-black font-bold tracking-[0.12em] uppercase rounded flex items-center justify-center gap-2 hover:bg-highlight transition-colors text-sm shadow-lg shadow-primary/20"
                        >
                            <ShoppingBag size={16} />
                            Add to Cart
                        </button>

                        {/* Quantity */}
                        <div className="flex items-center border border-border-color rounded overflow-hidden flex-shrink-0">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-10 h-12 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-white/5 transition-colors"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="w-10 h-12 flex items-center justify-center text-sm font-bold text-text-primary border-x border-border-color">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="w-10 h-12 flex items-center justify-center text-text-secondary hover:text-primary hover:bg-white/5 transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap gap-4 text-xs text-text-secondary mt-auto pt-6 border-t border-border-color">
                        <span className="flex items-center gap-1.5">
                            <Truck size={14} className="text-primary" /> Free shipping over 500 EGP
                        </span>
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-primary" /> Authentic Guarantee
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
