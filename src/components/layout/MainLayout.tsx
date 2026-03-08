import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { WhatsAppButton } from '../WhatsAppButton';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { ShoppingBag, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Footer } from './Footer';

export const MainLayout: React.FC = () => {
    const { language, toggleLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { settings } = useSiteSettings();
    const { cartCount } = useCart();
    const { wishlistItems } = useWishlist();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hideBanner, setHideBanner] = useState(false);
    const location = useLocation();

    // Close mobile menu on route change
    React.useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const showBanner = settings.banner_active === 'true' && settings.banner_text && !hideBanner;

    return (
        <div className="min-h-screen flex flex-col bg-background-dark text-text-primary transition-colors">
            {showBanner && (
                <div className="bg-primary text-black py-2 px-4 text-center relative text-xs md:text-sm font-bold tracking-wide z-50 animate-in fade-in slide-in-from-top-2 duration-500">
                    <p className="pr-6">{settings.banner_text}</p>
                    <button
                        onClick={() => setHideBanner(true)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
                        aria-label="Close banner"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
            <header className="py-3 border-b border-border-color bg-background-dark shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-7xl flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-text-primary hover:text-primary transition-colors p-1"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
                            {settings.logo_url ? (
                                <img src={settings.logo_url} alt="LALEN Perfumes Logo" fetchPriority="high" loading="eager" className="h-10 md:h-12 w-auto object-contain" />
                            ) : (
                                <span className="text-2xl font-bold text-primary tracking-[0.2em] uppercase">LALEN</span>
                            )}
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex gap-6 text-sm tracking-wide">
                            <Link to="/men" className="hover:text-primary transition-colors uppercase">{t('nav.men')}</Link>
                            <Link to="/women" className="hover:text-primary transition-colors uppercase">{t('nav.women')}</Link>
                            <Link to="/unisex" className="hover:text-primary transition-colors uppercase">{t('nav.unisex')}</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <button
                            onClick={toggleTheme}
                            className="hidden md:inline-flex text-sm font-medium hover:text-primary transition-colors border border-gray-700 rounded-full px-4 py-1.5 w-24 justify-center"
                        >
                            {theme === 'dark' ? t('nav.theme.dark') : t('nav.theme.light')}
                        </button>
                        <button
                            onClick={toggleLanguage}
                            className="hidden md:inline-flex text-sm font-medium hover:text-primary transition-colors border border-gray-700 rounded-full px-4 py-1.5 w-24 justify-center"
                        >
                            {language === 'EN' ? 'العربية' : 'EN'}
                        </button>

                        <div className="flex items-center gap-3 md:gap-5">
                            <Link to="/wishlist" className="hover:text-primary transition-colors relative" aria-label="View Wishlist">
                                <Heart size={20} />
                                {wishlistItems.length > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-primary text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {wishlistItems.length}
                                    </span>
                                )}
                            </Link>

                            <Link to="/checkout" className="hover:text-primary transition-colors relative" aria-label="View Shopping Cart">
                                <ShoppingBag size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-primary text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile menu — slide down */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-80 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
                        }`}
                >
                    <nav className="flex flex-col gap-1 pb-4 border-t border-border-color pt-4 px-4">
                        <Link to="/men" className="py-3 px-4 text-sm uppercase tracking-widest hover:text-primary hover:bg-primary/5 rounded transition-all">
                            {t('nav.men')}
                        </Link>
                        <Link to="/women" className="py-3 px-4 text-sm uppercase tracking-widest hover:text-primary hover:bg-primary/5 rounded transition-all">
                            {t('nav.women')}
                        </Link>
                        <Link to="/unisex" className="py-3 px-4 text-sm uppercase tracking-widest hover:text-primary hover:bg-primary/5 rounded transition-all">
                            {t('nav.unisex')}
                        </Link>

                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border-color/50 px-4">
                            <button
                                onClick={toggleTheme}
                                className="flex-1 text-xs font-medium hover:text-primary transition-colors border border-gray-700 rounded-full px-3 py-2"
                            >
                                {theme === 'dark' ? t('nav.theme.dark') : t('nav.theme.light')}
                            </button>
                            <button
                                onClick={toggleLanguage}
                                className="flex-1 text-xs font-medium hover:text-primary transition-colors border border-gray-700 rounded-full px-3 py-2"
                            >
                                {language === 'EN' ? 'العربية' : 'EN'}
                            </button>
                        </div>
                    </nav>
                </div>
            </header>

            <main className="flex-1 w-full flex flex-col container mx-auto px-6 md:px-12 lg:px-16 max-w-7xl">
                <Outlet />
            </main>

            <Footer />

            <WhatsAppButton />
        </div>
    );
};
