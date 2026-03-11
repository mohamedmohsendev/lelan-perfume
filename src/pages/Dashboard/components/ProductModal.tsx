import React from 'react';
import { X, ImageIcon } from 'lucide-react';
import type { FormShape } from '../types';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    form: FormShape;
    setForm: React.Dispatch<React.SetStateAction<FormShape>>;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    submitting: boolean;
    submitError: string;
    removeExistingImage: (index: number) => void;
    removeNewImage: (index: number) => void;
    handleFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    t: (key: string) => string;
}

export const ProductModal: React.FC<ProductModalProps> = ({
    isOpen,
    onClose,
    form,
    setForm,
    onSubmit,
    submitting,
    submitError,
    removeExistingImage,
    removeNewImage,
    handleFilesChange,
    fileInputRef,
    t
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-background-dark w-full max-w-2xl rounded-2xl border border-border-color shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-border-color flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold tracking-widest text-primary uppercase">
                        {form.editingId ? t('admin.edit') : t('admin.add')}
                    </h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-primary transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                    {/* Name */}
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">{t('admin.productName')}</label>
                        <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} type="text" className="w-full bg-background-card border border-border-color rounded p-3 text-text-primary focus:outline-none focus:border-primary transition-colors" />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">{t('admin.category')}</label>
                        <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full bg-background-card border border-border-color rounded p-3 text-text-primary focus:outline-none focus:border-primary transition-colors appearance-none">
                            <option value="Men">{t('nav.men')}</option>
                            <option value="Women">{t('nav.women')}</option>
                            <option value="Unisex">{t('nav.unisex')}</option>
                        </select>
                    </div>

                    {/* Base Price + Old Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">{t('admin.basePrice')}</label>
                            <input required value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} type="text" placeholder="e.g. 500" className="w-full bg-background-card border border-border-color rounded p-3 text-text-primary focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">{t('admin.oldPrice')}</label>
                            <input value={form.oldPrice} onChange={e => setForm(p => ({ ...p, oldPrice: e.target.value }))} type="text" placeholder="e.g. 800" className="w-full bg-background-card border border-border-color rounded p-3 text-text-primary focus:outline-none focus:border-primary transition-colors" />
                        </div>
                    </div>

                    {/* Size Variant Prices — each with old price */}
                    <div className="border border-border-color rounded-xl p-4 bg-background-dark/30 space-y-4">
                        <h4 className="text-xs uppercase tracking-widest text-primary font-bold flex items-center justify-between">
                            <span>{t('admin.sizePrices')}</span>
                            <span className="text-primary/50 italic lowercase font-normal">{t('admin.optional')}</span>
                        </h4>

                        {/* 30ml */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">{t('admin.price30ml')}</label>
                                <input value={form.price30ml} onChange={e => setForm(p => ({ ...p, price30ml: e.target.value }))} type="text" placeholder="0" className="w-full bg-background-card border border-border-color rounded p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">{t('admin.oldPrice30ml')}</label>
                                <input value={form.oldPrice30ml} onChange={e => setForm(p => ({ ...p, oldPrice30ml: e.target.value }))} type="text" placeholder="0" className="w-full bg-background-card border border-border-color rounded p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors" />
                            </div>
                        </div>

                        {/* 50ml */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">{t('admin.price50ml')}</label>
                                <input value={form.price50ml} onChange={e => setForm(p => ({ ...p, price50ml: e.target.value }))} type="text" placeholder="0" className="w-full bg-background-card border border-border-color rounded p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">{t('admin.oldPrice50ml')}</label>
                                <input value={form.oldPrice50ml} onChange={e => setForm(p => ({ ...p, oldPrice50ml: e.target.value }))} type="text" placeholder="0" className="w-full bg-background-card border border-border-color rounded p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors" />
                            </div>
                        </div>

                        {/* 100ml */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">{t('admin.price100ml')}</label>
                                <input value={form.price100ml} onChange={e => setForm(p => ({ ...p, price100ml: e.target.value }))} type="text" placeholder="0" className="w-full bg-background-card border border-border-color rounded p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-text-secondary font-semibold mb-1.5">{t('admin.oldPrice100ml')}</label>
                                <input value={form.oldPrice100ml} onChange={e => setForm(p => ({ ...p, oldPrice100ml: e.target.value }))} type="text" placeholder="0" className="w-full bg-background-card border border-border-color rounded p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">{t('admin.description')}</label>
                        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-background-card border border-border-color rounded p-3 text-text-primary focus:outline-none focus:border-primary transition-colors resize-none" placeholder={t('admin.descriptionPlaceholder')} />
                    </div>

                    {/* Scent Notes */}
                    <div className="bg-background-card rounded-lg border border-border-color p-4 space-y-3">
                        <h4 className="text-xs uppercase tracking-widest text-primary font-bold">{t('admin.scentNotes')}</h4>
                        <div>
                            <label className="block text-xs text-text-secondary mb-1">{t('product.topNotes')}</label>
                            <input value={form.notesTop} onChange={e => setForm(p => ({ ...p, notesTop: e.target.value }))} type="text" placeholder="Bergamot, Pink Pepper, Lemon" className="w-full bg-background-dark border border-border-color rounded p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs text-text-secondary mb-1">{t('product.heartNotes')}</label>
                            <input value={form.notesHeart} onChange={e => setForm(p => ({ ...p, notesHeart: e.target.value }))} type="text" placeholder="Rose, Jasmine, Cardamom" className="w-full bg-background-dark border border-border-color rounded p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs text-text-secondary mb-1">{t('product.baseNotes')}</label>
                            <input value={form.notesBase} onChange={e => setForm(p => ({ ...p, notesBase: e.target.value }))} type="text" placeholder="Oud, Vanilla, Amber" className="w-full bg-background-dark border border-border-color rounded p-2.5 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors" />
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">{t('admin.productImages')}</label>

                        {form.existingImages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {form.existingImages.map((img, i) => (
                                    <div key={i} className="relative w-16 h-16 rounded border border-border-color overflow-hidden bg-background-card group">
                                        <img src={img} alt="" className="w-full h-full object-contain p-1" />
                                        <button type="button" onClick={() => removeExistingImage(i)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {form.imagePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {form.imagePreviews.map((img, i) => (
                                    <div key={i} className="relative w-16 h-16 rounded border border-primary/40 overflow-hidden bg-background-card group">
                                        <img src={img} alt="" className="w-full h-full object-contain p-1" />
                                        <button type="button" onClick={() => removeNewImage(i)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400">
                                            <X size={14} />
                                        </button>
                                        <span className="absolute top-0 right-0 bg-primary text-black text-[8px] font-bold px-1">NEW</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-border-color hover:border-primary rounded-lg p-4 flex flex-col items-center gap-2 transition-colors group"
                        >
                            <ImageIcon size={28} className="text-text-secondary group-hover:text-primary transition-colors" />
                            <span className="text-xs text-text-secondary group-hover:text-primary transition-colors tracking-wider">{t('admin.addImages')}</span>
                        </button>
                    </div>

                    {submitError && (
                        <p className="text-red-400 text-xs p-2 bg-red-500/10 rounded border border-red-500/20">{submitError}</p>
                    )}

                    <div className="pt-4 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 px-4 border border-border-color hover:bg-white/5 text-text-primary transition-colors rounded uppercase text-xs font-bold tracking-[0.1em]">
                            {t('admin.cancel')}
                        </button>
                        <button type="submit" disabled={submitting} className="flex-1 py-3 px-4 bg-primary text-black hover:bg-highlight disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded uppercase text-xs font-bold tracking-[0.1em] flex items-center justify-center gap-2">
                            {submitting ? (
                                <>
                                    <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                                    {t('admin.uploading')}
                                </>
                            ) : (
                                form.editingId ? t('admin.save') : t('admin.add')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
