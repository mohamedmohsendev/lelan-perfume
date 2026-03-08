import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
    const { t } = useLanguage();

    return (
        <footer className="bg-background-dark border-t border-border-color pt-16 pb-8 mt-auto">
            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="flex flex-col gap-4">
                        <Link to="/" className="flex items-center gap-2 mb-2">
                            <span className="text-2xl font-black tracking-widest text-primary uppercase">
                                LALEN
                            </span>
                        </Link>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            {t('footer.desc')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-highlight font-bold tracking-wider uppercase text-sm mb-2">
                            {t('footer.quickLinks')}
                        </h3>
                        <nav className="flex flex-col gap-3">
                            <Link to="/" className="text-text-secondary hover:text-primary transition-colors text-sm w-fit">
                                {t('home.all')}
                            </Link>
                            <Link to="/men" className="text-text-secondary hover:text-primary transition-colors text-sm w-fit">
                                {t('nav.men')}
                            </Link>
                            <Link to="/women" className="text-text-secondary hover:text-primary transition-colors text-sm w-fit">
                                {t('nav.women')}
                            </Link>
                            <Link to="/unisex" className="text-text-secondary hover:text-primary transition-colors text-sm w-fit">
                                {t('nav.unisex')}
                            </Link>
                        </nav>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-highlight font-bold tracking-wider uppercase text-sm mb-2">
                            {t('footer.contact')}
                        </h3>
                        <ul className="flex flex-col gap-4 text-text-secondary text-sm">
                            <li className="flex items-start gap-3">
                                <Phone size={18} className="text-primary shrink-0 mt-0.5" />
                                <span dir="ltr">01029449717</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail size={18} className="text-primary shrink-0 mt-0.5" />
                                <span>info@lalenperfumes.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                                <span>Cairo, Egypt</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-highlight font-bold tracking-wider uppercase text-sm mb-2">
                            {t('footer.followUs')}
                        </h3>
                        <div className="flex gap-4">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border-color flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-all">
                                <Instagram size={18} />
                            </a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-border-color flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-all">
                                <Facebook size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-border-color/50 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-text-secondary">
                    <p>{t('footer.rights')}</p>
                </div>
            </div>
        </footer>
    );
};
