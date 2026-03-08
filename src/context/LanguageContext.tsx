import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'EN' | 'AR';

const translations: Record<Language, Record<string, string>> = {
    EN: {
        // Nav
        'nav.men': 'Men',
        'nav.women': 'Women',
        'nav.unisex': 'Unisex',
        'nav.theme.dark': 'Light',
        'nav.theme.light': 'Dark',
        // Checkout
        'checkout.title': 'Secure Checkout',
        'checkout.shipping': 'Shipping Information',
        'checkout.fullName': 'Full Name',
        'checkout.phone': 'Phone Number',
        'checkout.address': 'Delivery Address',
        'checkout.notes': 'Order Notes (Optional)',
        'checkout.notes.placeholder': 'Any special requests...',
        'checkout.submit': 'Place Order via WhatsApp',
        'checkout.submitting': 'Processing...',
        'checkout.summary': 'Order Summary',
        'checkout.subtotal': 'Subtotal',
        'checkout.shipping.label': 'Shipping',
        'checkout.shipping.value': 'Calculated on WhatsApp',
        'checkout.total': 'Total',
        // Payment
        'payment.title': 'Payment Methods',
        'payment.cod': 'Cash on Delivery',
        'payment.cod.desc': 'Pay when your order arrives',
        'payment.vodafone': 'Vodafone Cash',
        'payment.vodafone.desc': 'Transfer before shipping to:',
        // Admin
        'admin.add': 'Add New',
        'admin.edit': 'Edit Product',
        'admin.save': 'Save Changes',
        'admin.cancel': 'Cancel',
        'admin.name': 'Product Name',
        'admin.category': 'Category',
        'admin.price': 'Price (e.g. 3,200 EGP)',
        'admin.image': 'Product Image',
        'admin.chooseFile': 'Choose Image File',
        // Home & General
        'nav.wishlist': 'Wishlist',
        'wishlist.empty': 'Your Wishlist is Empty',
        'wishlist.emptyDesc': 'Explore our collections and find your signature scent.',
        'home.title': 'Our Perfumes',
        'home.collections': 'Collections',
        'home.all': 'All',
        'product.addToCart': 'Add to cart',
        'footer.about': 'About Us',
        'footer.desc': 'Discover the art of fine perfumery with our exclusive collection of luxury fragrances crafted for elegance and distinction.',
        'footer.quickLinks': 'Quick Links',
        'footer.contact': 'Contact Us',
        'footer.followUs': 'Follow Us',
        'footer.rights': '© {year} LALEN Perfumes. All rights reserved.',
    },
    AR: {
        // Nav
        'nav.men': 'رجال',
        'nav.women': 'نساء',
        'nav.unisex': 'للجنسين',
        'nav.theme.dark': 'فاتح',
        'nav.theme.light': 'داكن',
        // Checkout
        'checkout.title': 'إتمام الطلب',
        'checkout.shipping': 'بيانات الشحن',
        'checkout.fullName': 'الاسم الكامل',
        'checkout.phone': 'رقم الهاتف',
        'checkout.address': 'عنوان التوصيل',
        'checkout.notes': 'ملاحظات الطلب (اختياري)',
        'checkout.notes.placeholder': 'أي طلبات خاصة...',
        'checkout.submit': 'إتمام الطلب عبر واتساب',
        'checkout.submitting': 'جارٍ المعالجة...',
        'checkout.summary': 'ملخص الطلب',
        'checkout.subtotal': 'الإجمالي الجزئي',
        'checkout.shipping.label': 'الشحن',
        'checkout.shipping.value': 'يُحدَّد عبر واتساب',
        'checkout.total': 'الإجمالي',
        // Payment
        'payment.title': 'طرق الدفع',
        'payment.cod': 'الدفع عند الاستلام',
        'payment.cod.desc': 'ادفع عند وصول طلبك',
        'payment.vodafone': 'فودافون كاش',
        'payment.vodafone.desc': 'حوّل قبل الشحن إلى:',
        // Admin
        'admin.add': 'إضافة جديد',
        'admin.edit': 'تعديل المنتج',
        'admin.save': 'حفظ التغييرات',
        'admin.cancel': 'إلغاء',
        'admin.name': 'اسم المنتج',
        'admin.category': 'الفئة',
        'admin.price': 'السعر (مثال: 3,200 EGP)',
        'admin.image': 'صورة المنتج',
        'admin.chooseFile': 'اختر ملف الصورة',
        // Home & General
        'nav.wishlist': 'المفضلة',
        'wishlist.empty': 'قائمة المفضلة فارغة',
        'wishlist.emptyDesc': 'اكتشف مجموعاتنا واختر عطرك المفضل.',
        'home.title': 'عطورنا',
        'home.collections': 'مجموعاتنا',
        'home.all': 'الكل',
        'product.addToCart': 'إضافة للسلة',
        'footer.about': 'من نحن',
        'footer.desc': 'اكتشف فن العطور الفاخرة مع تشكيلتنا الحصرية المصممة خصيصاً للأناقة والتميز.',
        'footer.quickLinks': 'روابط سريعة',
        'footer.contact': 'تواصل معنا',
        'footer.followUs': 'تابعنا',
        'footer.rights': '© {year} لالين للعطور. جميع الحقوق محفوظة.',
    },
};

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        return (localStorage.getItem('lalen-language') as Language) || 'EN';
    });

    useEffect(() => {
        document.documentElement.dir = language === 'AR' ? 'rtl' : 'ltr';
        document.documentElement.lang = language.toLowerCase();
        localStorage.setItem('lalen-language', language);
    }, [language]);

    const toggleLanguage = () => setLanguage(prev => (prev === 'EN' ? 'AR' : 'EN'));

    const t = (key: string): string => {
        const val = translations[language][key];
        if (!val) return key;
        return val.replace('{year}', String(new Date().getFullYear()));
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};
