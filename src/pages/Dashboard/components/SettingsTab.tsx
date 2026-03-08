import React from 'react';
import { Megaphone, Edit2, Layout, Home, User, Users, Image as ImageLucide, Upload, Zap } from 'lucide-react';

interface SettingsTabProps {
    settings: any;
    settingsUploading: string | null;
    refreshSettings: () => Promise<void>;
    handleSettingUpload: (key: string, file: File) => Promise<void>;
    API_URL: string;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
    settings,
    settingsUploading,
    refreshSettings,
    handleSettingUpload,
    API_URL
}) => {
    const settingsSections = [
        {
            id: 'general',
            title: 'General Settings',
            icon: <Layout size={20} />,
            items: [
                { key: 'logo_url', label: 'Website Logo', desc: 'Main logo shown in header & footer', type: 'image' },
            ]
        },
        {
            id: 'home',
            title: 'Home Page',
            icon: <Home size={20} />,
            items: [
                { key: 'hero_bg', label: 'Home Hero Background', desc: 'Background image for the hero section', type: 'image' },
            ]
        },
        {
            id: 'men',
            title: "Men's Collection",
            icon: <User size={20} />,
            items: [
                { key: 'men_bg', label: "Background Image", desc: 'Background for Men category page', type: 'image' },
                { key: 'men_title', label: "Collection Title", desc: 'Custom title for Men collection', type: 'text' },
                { key: 'men_description', label: "Collection Description", desc: 'Custom description for Men collection', type: 'text' },
            ]
        },
        {
            id: 'women',
            title: "Women's Collection",
            icon: <User size={20} />,
            items: [
                { key: 'women_bg', label: "Background Image", desc: 'Background for Women category page', type: 'image' },
                { key: 'women_title', label: "Collection Title", desc: 'Custom title for Women collection', type: 'text' },
                { key: 'women_description', label: "Collection Description", desc: 'Custom description for Women collection', type: 'text' },
            ]
        },
        {
            id: 'unisex',
            title: 'Unisex Collection',
            icon: <Users size={20} />,
            items: [
                { key: 'unisex_bg', label: 'Background Image', desc: 'Background for Unisex category page', type: 'image' },
                { key: 'unisex_title', label: "Collection Title", desc: 'Custom title for Unisex collection', type: 'text' },
                { key: 'unisex_description', label: "Collection Description", desc: 'Custom description for Unisex collection', type: 'text' },
            ]
        }
    ];

    return (
        <div className="space-y-12 pb-10">
            {/* ── Announcement Banner ── */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border-color pb-4">
                    <Megaphone size={22} className="text-primary" />
                    <h2 className="text-xl font-bold text-text-primary tracking-widest uppercase">Marketing Banner</h2>
                </div>
                <div className="bg-background-card rounded-xl border border-border-color overflow-hidden">
                    <div className="p-6 border-b border-border-color bg-background-dark/30 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-text-primary text-sm tracking-wider uppercase">Banner Visibility</h3>
                            <p className="text-xs text-text-secondary mt-1">Enable/disable the announcement bar at the top of the site</p>
                        </div>
                        <button
                            onClick={async () => {
                                const newVal = settings.banner_active === 'true' ? 'false' : 'true';
                                const token = localStorage.getItem('lalen_admin_token');
                                await fetch(`${API_URL}/api/settings/banner_active`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                                    },
                                    body: JSON.stringify({ value: newVal }),
                                });
                                await refreshSettings();
                            }}
                            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${settings.banner_active === 'true' ? 'bg-primary' : 'bg-gray-600'}`}
                        >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.banner_active === 'true' ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-xs uppercase tracking-widest text-text-secondary font-bold">Banner Message</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    defaultValue={settings.banner_text || ''}
                                    id="banner-text-input"
                                    placeholder="Special offer goes here..."
                                    className="flex-1 bg-white dark:bg-[#1A1C1D] text-gray-900 dark:text-white border border-border-color rounded p-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                />
                                <button
                                    onClick={async () => {
                                        const input = document.getElementById('banner-text-input') as HTMLInputElement;
                                        const token = localStorage.getItem('lalen_admin_token');
                                        await fetch(`${API_URL}/api/settings/banner_text`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                                            },
                                            body: JSON.stringify({ value: input.value }),
                                        });
                                        await refreshSettings();
                                    }}
                                    className="px-6 py-2 bg-primary text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-highlight transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs uppercase tracking-widest text-text-secondary font-bold">Live Preview</label>
                            {settings.banner_text ? (
                                <div className="bg-primary text-black text-center py-3 px-4 text-xs font-bold rounded uppercase tracking-widest shadow-lg">
                                    {settings.banner_text}
                                </div>
                            ) : (
                                <div className="border border-dashed border-border-color rounded py-3 px-4 text-xs text-text-secondary text-center italic">
                                    No message configured
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Asset Optimization ── */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border-color pb-4">
                    <Zap size={22} className="text-yellow-400" />
                    <h2 className="text-xl font-bold text-text-primary tracking-widest uppercase">Performance & Assets</h2>
                </div>
                <div className="bg-background-card rounded-xl border border-border-color p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                        <h3 className="font-bold text-text-primary text-sm tracking-wider uppercase mb-1">Image Optimization (WebP)</h3>
                        <p className="text-xs text-text-secondary">Compress all existing product images and convert them to WebP format for faster page loads. This may take a few minutes.</p>
                    </div>
                    <button
                        onClick={async (e) => {
                            if (!confirm('This will process all product images. Continue?')) return;
                            const btn = e.currentTarget;
                            const originalText = btn.innerHTML;
                            btn.disabled = true;
                            btn.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"></span> Processing...';
                            
                            try {
                                const token = localStorage.getItem('lalen_admin_token');
                                const res = await fetch(`${API_URL}/api/admin/compress-all`, {
                                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                                });
                                if (!res.ok) throw new Error('Optimization failed');
                                alert('✅ All images processed and optimized!');
                            } catch (err) {
                                console.error(err);
                                alert('❌ Optimization failed or timed out. Check server logs.');
                            } finally {
                                btn.disabled = false;
                                btn.innerHTML = originalText;
                            }
                        }}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xs uppercase tracking-widest px-6 py-3 rounded transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        <Zap size={16} /> Optimize All Images
                    </button>
                </div>
            </section>

            {/* ── Dynamic Sections ── */}
            {settingsSections.map(section => (
                <section key={section.id} className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-border-color pb-4">
                        <span className="text-primary">{section.icon}</span>
                        <h2 className="text-xl font-bold text-text-primary tracking-widest uppercase">{section.title}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {section.items.map(item => (
                            <div key={item.key} className="bg-background-card rounded-xl border border-border-color overflow-hidden">
                                <div className="p-4 border-b border-border-color bg-background-dark/30 flex items-center gap-3">
                                    {(item as any).type === 'image' ? <ImageLucide size={16} className="text-primary" /> : <Edit2 size={16} className="text-primary" />}
                                    <h3 className="font-bold text-text-primary text-[10px] tracking-widest uppercase">{item.label}</h3>
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-center">
                                    {(item as any).type === 'image' ? (
                                        <div className="space-y-4">
                                            {settings[item.key] ? (
                                                <div className="relative aspect-video rounded-lg overflow-hidden border border-border-color bg-background-dark group">
                                                    <img src={settings[item.key]} alt={item.label} className="w-full h-full object-contain p-2" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <p className="text-[10px] text-white font-bold uppercase tracking-widest">Current Image</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="aspect-video rounded-lg border-2 border-dashed border-border-color flex flex-col items-center justify-center text-text-secondary text-[10px] tracking-widest uppercase gap-2 bg-background-dark/20">
                                                    <ImageLucide size={20} className="opacity-20" />
                                                    <span>Empty</span>
                                                </div>
                                            )}

                                            <label className="cursor-pointer flex items-center justify-center gap-2 py-2 px-4 rounded bg-primary/10 hover:bg-primary hover:text-black text-primary transition-all text-[10px] font-bold tracking-widest uppercase border border-primary/20">
                                                {settingsUploading === item.key ? (
                                                    <>
                                                        <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload size={12} /> Replace Image
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleSettingUpload(item.key, file);
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Content</p>
                                                {item.key.includes('description') ? (
                                                    <textarea
                                                        defaultValue={settings[item.key] || ''}
                                                        id={`setting-input-${item.key}`}
                                                        rows={4}
                                                        className="w-full bg-background-dark text-text-primary border border-border-color rounded p-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        defaultValue={settings[item.key] || ''}
                                                        id={`setting-input-${item.key}`}
                                                        className="w-full bg-background-dark text-text-primary border border-border-color rounded p-3 text-sm focus:outline-none focus:border-primary transition-colors"
                                                    />
                                                )}
                                            </div>
                                            <button
                                                onClick={async (e) => {
                                                    const btn = e.currentTarget;
                                                    const input = document.getElementById(`setting-input-${item.key}`) as (HTMLInputElement | HTMLTextAreaElement);
                                                    const token = localStorage.getItem('lalen_admin_token');

                                                    btn.disabled = true;
                                                    const originalContent = btn.innerHTML;
                                                    btn.innerHTML = '<span class="animate-spin inline-block w-3 h-3 border-2 border-black border-t-transparent rounded-full font-bold"></span>';

                                                    try {
                                                        const res = await fetch(`${API_URL}/api/settings/${item.key}`, {
                                                            method: 'PUT',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                                                            },
                                                            body: JSON.stringify({ value: input.value }),
                                                        });
                                                        if (!res.ok) throw new Error('Save failed');
                                                        await refreshSettings();
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert('Failed to save settings');
                                                    } finally {
                                                        btn.disabled = false;
                                                        btn.innerHTML = originalContent;
                                                    }
                                                }}
                                                className="w-full py-2 bg-primary text-black font-bold text-[10px] uppercase tracking-widest rounded hover:bg-highlight transition-colors flex items-center justify-center min-h-[36px] mt-4"
                                            >
                                                Save Changes
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
};
