import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface SiteSettings {
    logo_url: string;
    hero_bg: string;
    men_bg: string;
    women_bg: string;
    unisex_bg: string;
    [key: string]: string;
}

interface SiteSettingsContextType {
    settings: SiteSettings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const defaults: SiteSettings = { logo_url: '', hero_bg: '', men_bg: '', women_bg: '', unisex_bg: '' };

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings>(defaults);
    const [loading, setLoading] = useState(true);

    const refreshSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/settings`);
            if (!res.ok) throw new Error('Failed to fetch settings');
            const data = await res.json();
            setSettings({ ...defaults, ...data });
        } catch (err) {
            console.error('Settings fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refreshSettings(); }, []);

    return (
        <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => {
    const ctx = useContext(SiteSettingsContext);
    if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
    return ctx;
};
