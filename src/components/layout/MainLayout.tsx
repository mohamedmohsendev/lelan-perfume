import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { WhatsAppButton } from '../WhatsAppButton';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { ShoppingBag } from 'lucide-react';

export const MainLayout: React.FC = () => {
    const { language, toggleLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const { settings } = useSiteSettings();

    return (
        <div className="min-h-screen flex flex-col bg-background-dark text-text-primary transition-colors">
            <header className="py-3 px-6 md:px-8 border-b border-border-color flex justify-between items-center bg-background-dark/95 backdrop-blur sticky top-0 z-40">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-3 flex-shrink-0">
                        {settings.logo_url ? (
                            <img src={settings.logo_url} alt="LALEN" className="h-10 md:h-12 w-auto object-contain" />
                        ) : (
                            <span className="text-2xl font-bold text-primary tracking-[0.2em] uppercase">LALEN</span>
                        )}
                    </Link>
                    <nav className="hidden md:flex gap-6 text-sm tracking-wide">
                        <Link to="/men" className="hover:text-primary transition-colors uppercase">{t('nav.men')}</Link>
                        <Link to="/women" className="hover:text-primary transition-colors uppercase">{t('nav.women')}</Link>
                        <Link to="/unisex" className="hover:text-primary transition-colors uppercase">{t('nav.unisex')}</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                    <button
                        onClick={toggleTheme}
                        className="text-sm font-medium hover:text-primary transition-colors border border-gray-700 rounded-full px-4 py-1.5 w-24"
                    >
                        {theme === 'dark' ? t('nav.theme.dark') : t('nav.theme.light')}
                    </button>
                    <button
                        onClick={toggleLanguage}
                        className="text-sm font-medium hover:text-primary transition-colors border border-gray-700 rounded-full px-4 py-1.5 w-24"
                    >
                        {language === 'EN' ? 'العربية' : 'EN'}
                    </button>
                    <Link to="/checkout" className="hover:text-primary transition-colors">
                        <ShoppingBag size={20} />
                    </Link>
                </div>
            </header>

            <main className="flex-1 w-full flex flex-col">
                <Outlet />
            </main>

            <footer className="py-12 border-t border-border-color text-center text-text-secondary bg-background-dark/20">
                {settings.logo_url && (
                    <img src={settings.logo_url} alt="LALEN" className="h-10 mx-auto mb-4 object-contain opacity-50" />
                )}
                <p className="tracking-widest uppercase text-sm">{t('footer.rights')}</p>
            </footer>

            <WhatsAppButton />
        </div>
    );
};
