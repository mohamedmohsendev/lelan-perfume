import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useLanguage } from '../../context/LanguageContext';

export const HeroSection = () => {
    const { settings } = useSiteSettings();
    const { t } = useLanguage();
    const heroRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
    const textY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

    return (
        <section
            ref={heroRef}
            className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden -mx-6 md:-mx-12 lg:-mx-16 flex items-center justify-center"
            style={{ width: 'calc(100% + 3rem)' }}
        >
            {/* Parallax Background */}
            <motion.div
                className="absolute inset-0 z-0"
                style={{ y: backgroundY }}
            >
                {settings.hero_bg ? (
                    <img
                        src={settings.hero_bg}
                        alt="LALEN Hero"
                        className="w-full h-[130%] object-cover"
                        loading="eager"
                        fetchPriority="high"
                    />
                ) : (
                    <div className="w-full h-[130%] bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
                )}
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-black/50 to-transparent" />
            </motion.div>

            {/* Content */}
            <motion.div
                className="relative z-10 text-center px-6 max-w-3xl mx-auto"
                style={{ y: textY, opacity }}
            >
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-primary text-xs md:text-sm tracking-[0.4em] uppercase font-bold mb-4"
                >
                    {t('hero.subtitle')}
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-[0.15em] uppercase mb-6 leading-tight"
                >
                    LALEN
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-gray-300 text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed tracking-wide"
                >
                    {t('hero.description')}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link
                        to="/men"
                        className="px-10 py-4 bg-primary text-black font-bold tracking-[0.2em] uppercase text-sm rounded hover:bg-highlight transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                    >
                        {t('hero.shopNow')}
                    </Link>
                    <Link
                        to="/women"
                        className="px-10 py-4 border border-white/30 text-white font-bold tracking-[0.2em] uppercase text-sm rounded hover:border-primary hover:text-primary transition-all duration-300 backdrop-blur-sm"
                    >
                        {t('hero.explore')}
                    </Link>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
                >
                    <div className="w-1 h-2 bg-white/60 rounded-full" />
                </motion.div>
            </motion.div>
        </section>
    );
};
