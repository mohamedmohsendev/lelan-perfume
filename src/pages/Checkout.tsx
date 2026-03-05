import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Banknote, Smartphone } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '201029449717';
const VODAFONE_NUMBER = '01029449717';

export const Checkout = () => {
    const { products } = useProducts();
    const { t } = useLanguage();
    const location = useLocation();
    const { cartItems: globalCart, clearCart } = useCart();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const locationState = location.state as { productId: string; quantity: number } | null;

    let cartItems: any[] = globalCart.map(item => ({ ...item.product, quantity: item.quantity }));

    if (cartItems.length === 0) {
        if (locationState?.productId) {
            const p = products.find(prod => prod.id === locationState.productId);
            if (p) cartItems = [{ ...p, quantity: locationState.quantity }];
        } else if (products.length > 0) {
            // Fallback demo item
            cartItems = [{ ...products[0], quantity: 1 }];
        }
    }

    const total = cartItems.reduce((sum, item) => {
        const num = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
        return sum + (isNaN(num) ? 0 : num) * (item.quantity || 1);
    }, 0);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');

        try {
            // 1 — Persist order to Supabase via Express API
            const res = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    notes: formData.notes,
                    cart: cartItems,
                    total,
                }),
            });

            let orderId = 'N/A';
            if (res.ok) {
                const data = await res.json();
                orderId = data.id?.slice(0, 8).toUpperCase() ?? 'N/A';
            } else {
                console.warn('Order API failed, continuing with WhatsApp anyway');
            }

            // 2 — Open WhatsApp with user's requested template
            let msg = ` مرحباً بك في عالم LALEN العطري\n\n`;
            msg += `يسعدنا إبلاغكم باستلام طلب من حضرتك -ا/ : ${formData.name}\n\n`;
            msg += ` تفاصيل الشحنة:\n\n`;
            msg += `الكود: #${orderId}\n\n`;
            msg += `الموقع: ${formData.address}\n\n`;
            msg += `رقم التواصل: ${formData.phone}\n\n`;

            msg += `الطلب:\n`;
            cartItems.forEach(item => {
                msg += `- ${item.quantity}x ${item.name} (${item.price})\n`;
            });

            msg += `\n💰 القيمة الإجمالية: ${total.toLocaleString()} EGP\n\n`;

            if (formData.notes) {
                msg += `📝 ملاحظات: ${formData.notes}\n\n`;
            }

            msg += ` سيتم التواصل مع حضرتك في اسرع وقت لتأكيد الطلب  .`;

            const encoded = encodeURIComponent(msg);

            // clear the cart after generating the message
            clearCart();

            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
        } catch (err: unknown) {
            console.error('Order submission error:', err);
            setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold uppercase tracking-[0.2em] mb-12 border-b border-border-color pb-8 text-center">
                {t('checkout.title')}
            </h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* ─── Left: Form ─────────────────────────────────────────── */}
                <div className="w-full lg:w-2/3 space-y-6">
                    {/* Shipping Info */}
                    <div className="bg-background-card p-8 rounded-xl border border-border-color">
                        <h2 className="text-xl font-bold tracking-widest uppercase mb-8 text-primary">
                            {t('checkout.shipping')}
                        </h2>

                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-text-secondary uppercase tracking-wider font-semibold">
                                        {t('checkout.fullName')} *
                                    </label>
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-background-dark border border-gray-700 rounded p-4 text-text-primary focus:border-primary focus:outline-none transition-colors"
                                        placeholder=""
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-text-secondary uppercase tracking-wider font-semibold">
                                        {t('checkout.phone')} *
                                    </label>
                                    <input
                                        required
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        pattern="^01[0125][0-9]{8}$"
                                        title="أدخل رقم هاتف مصري صحيح يتكون من 11 رقم ويبدأ بـ 01"
                                        className="w-full bg-background-dark border border-gray-700 rounded p-4 text-text-primary focus:border-primary focus:outline-none transition-colors"
                                        placeholder="01xxxxxxxxx"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-text-secondary uppercase tracking-wider font-semibold">
                                    {t('checkout.address')} *
                                </label>
                                <input
                                    required
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full bg-background-dark border border-gray-700 rounded p-4 text-text-primary focus:border-primary focus:outline-none transition-colors"
                                    placeholder="123 شارع، المدينة / 123 St., City"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-text-secondary uppercase tracking-wider font-semibold">
                                    {t('checkout.notes')}
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full bg-background-dark border border-gray-700 rounded p-4 text-text-primary focus:border-primary focus:outline-none transition-colors resize-none"
                                    placeholder={t('checkout.notes.placeholder')}
                                />
                            </div>

                            {submitError && (
                                <p className="text-red-400 text-sm p-3 bg-red-500/10 rounded border border-red-500/20">
                                    {submitError}
                                </p>
                            )}
                        </form>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-background-card p-8 rounded-xl border border-border-color">
                        <h2 className="text-xl font-bold tracking-widest uppercase mb-6 text-primary">
                            {t('payment.title')}
                        </h2>
                        <div className="space-y-4">
                            {/* Cash on Delivery */}
                            <div className="flex items-start gap-4 p-4 rounded-lg border border-border-color bg-background-dark hover:border-primary/40 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Banknote size={20} className="text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-text-primary tracking-wide">{t('payment.cod')}</p>
                                    <p className="text-text-secondary text-sm mt-1">{t('payment.cod.desc')}</p>
                                </div>
                            </div>

                            {/* Vodafone Cash */}
                            <div className="flex items-start gap-4 p-4 rounded-lg border border-border-color bg-background-dark hover:border-primary/40 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Smartphone size={20} className="text-red-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-text-primary tracking-wide">{t('payment.vodafone')}</p>
                                    <p className="text-text-secondary text-sm mt-1">{t('payment.vodafone.desc')}</p>
                                    <p className="text-primary font-bold tracking-widest mt-1 text-lg">{VODAFONE_NUMBER}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit button (outside card for full width) */}
                    <button
                        type="submit"
                        form="checkout-form"
                        disabled={submitting}
                        className="w-full bg-[#25D366] text-white py-5 font-bold tracking-[0.15em] uppercase rounded flex items-center justify-center gap-3 hover:bg-[#128C7E] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg"
                    >
                        {submitting ? (
                            <>
                                <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                {t('checkout.submitting')}
                            </>
                        ) : (
                            <>
                                {t('checkout.submit')} <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>

                {/* ─── Right: Order Summary ────────────────────────────────── */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-background-card p-8 rounded-xl border border-border-color sticky top-28">
                        <h2 className="text-xl font-bold tracking-widest uppercase mb-8 text-primary flex items-center gap-2">
                            <ShoppingBag /> {t('checkout.summary')}
                        </h2>

                        <div className="space-y-6 mb-8">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-background-dark rounded p-1 border border-gray-700 flex-shrink-0">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain image-blend" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm tracking-wide truncate">{item.name}</h4>
                                        <p className="text-text-secondary text-xs mt-1 uppercase">Qty: {item.quantity || 1}</p>
                                    </div>
                                    <div className="text-highlight font-medium flex-shrink-0">{item.price}</div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-border-color pt-6 space-y-4">
                            <div className="flex justify-between text-text-secondary">
                                <span>{t('checkout.subtotal')}</span>
                                <span>{total.toLocaleString()} EGP</span>
                            </div>
                            <div className="flex justify-between text-text-secondary">
                                <span>{t('checkout.shipping.label')}</span>
                                <span className="text-xs text-right">{t('checkout.shipping.value')}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold pt-4 border-t border-border-color text-text-primary">
                                <span>{t('checkout.total')}</span>
                                <span className="text-highlight">{total.toLocaleString()} EGP</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
