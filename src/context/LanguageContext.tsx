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
        'nav.wishlist': 'Wishlist',

        // Hero
        'hero.subtitle': 'Luxury Fragrances',
        'hero.description': 'Discover the art of fine perfumery with our exclusive collection of luxury fragrances crafted for elegance and distinction.',
        'hero.shopNow': 'Shop Now',
        'hero.explore': 'Explore Collection',

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
        'admin.dashboard': 'Dashboard',
        'admin.welcome': 'Welcome back, Admin.',
        'admin.uploading': 'Uploading...',
        'admin.productName': 'Product Name',
        'admin.basePrice': 'Base Price',
        'admin.oldPrice': 'Old Price (cross-out)',
        'admin.sizePrices': 'Size Variant Prices',
        'admin.optional': 'optional',
        'admin.price30ml': '30ml Price',
        'admin.price50ml': '50ml Price',
        'admin.price100ml': '100ml Price',
        'admin.oldPrice30ml': '30ml Old Price',
        'admin.oldPrice50ml': '50ml Old Price',
        'admin.oldPrice100ml': '100ml Old Price',
        'admin.description': 'Description',
        'admin.descriptionPlaceholder': 'A masterful blend of the finest ingredients...',
        'admin.scentNotes': 'Scent Notes',
        'admin.productImages': 'Product Images (up to 5)',
        'admin.addImages': 'Click to add images',
        'admin.tab.dashboard': 'Dashboard',
        'admin.tab.orders': 'Orders',
        'admin.tab.products': 'Products',
        'admin.tab.analytics': 'Analytics',
        'admin.tab.settings': 'Settings',
        'admin.stats.totalRevenue': 'Total Revenue',
        'admin.stats.totalOrders': 'Total Orders',
        'admin.stats.topSelling': 'Top Selling Scent',
        'admin.stats.avgOrder': 'Avg Order Value',
        'admin.stats.todayOrders': "Today's Orders",
        'admin.stats.todayRevenue': "Today's Revenue",
        'admin.stats.conversionRate': 'Conversion Rate',
        'admin.stats.deliveredTotal': 'Delivered / Total',
        'admin.stats.statusBreakdown': 'Order Status Breakdown',
        'admin.stats.pending': 'Pending',
        'admin.stats.confirmed': 'Confirmed',
        'admin.stats.delivered': 'Delivered',
        'admin.stats.returned': 'Returned',
        'admin.stats.failed': 'Failed',
        'admin.orders.title': 'Orders',
        'admin.orders.export': 'Export',
        'admin.orders.exportClear': 'Export & Clear',
        'admin.orders.searchPlaceholder': 'Search by ID, Name or Phone...',
        'admin.orders.loading': 'Curating orders...',
        'admin.orders.empty': 'No orders found.',
        'admin.orders.date': 'Order / Date',
        'admin.orders.customer': 'Customer',
        'admin.orders.items': 'Items',
        'admin.orders.total': 'Total',
        'admin.orders.status': 'Status',
        'admin.orders.deleteRecord': 'Delete record',
        'admin.orders.note': 'Note',
        'admin.products.title': 'Product Collection',
        'admin.products.subtitle': 'Manage your luxury perfume inventory',
        'admin.products.details': 'Essential Details',
        'admin.products.classification': 'Classification',
        'admin.products.valuation': 'Valuation',
        'admin.products.inventory': 'Inventory',
        'admin.products.actions': 'Actions',
        'admin.products.loading': 'Curating products...',
        'admin.products.empty': 'No collections found',
        'admin.products.emptyDesc': 'Begin your luxury journey by adding your first masterpiece to the collection.',
        'admin.products.variants': 'Variants',
        'admin.settings.banner': 'Marketing Banner',
        'admin.settings.bannerVisibility': 'Banner Visibility',
        'admin.settings.bannerDesc': 'Enable/disable the announcement bar at the top of the site',
        'admin.settings.bannerMessage': 'Banner Message',
        'admin.settings.bannerPlaceholder': 'Special offer goes here...',
        'admin.settings.livePreview': 'Live Preview',
        'admin.settings.noMessage': 'No message configured',
        'admin.settings.save': 'Save',
        'admin.settings.saveChanges': 'Save Changes',
        'admin.settings.performance': 'Performance & Assets',
        'admin.settings.optimizeTitle': 'Image Optimization (WebP)',
        'admin.settings.optimizeDesc': 'Compress all existing product images and convert them to WebP format for faster page loads.',
        'admin.settings.optimizeBtn': 'Optimize All Images',
        'admin.settings.replaceImage': 'Replace Image',
        'admin.settings.processing': 'Processing...',
        'admin.settings.currentImage': 'Current Image',
        'admin.settings.empty': 'Empty',
        'admin.settings.content': 'Content',
        'admin.settings.general': 'General Settings',
        'admin.settings.homePage': 'Home Page',
        'admin.settings.menCollection': "Men's Collection",
        'admin.settings.womenCollection': "Women's Collection",
        'admin.settings.unisexCollection': 'Unisex Collection',

        // Home & General
        'wishlist.empty': 'Your Wishlist is Empty',
        'wishlist.emptyDesc': 'Explore our collections and find your signature scent.',
        'home.title': 'Our Perfumes',
        'home.collections': 'Collections',
        'home.all': 'All',
        'product.addToCart': 'Add to cart',

        // F5 FIX: Previously hardcoded strings now translated
        'loading.products': 'Loading products...',
        'loading.product': 'Loading product...',
        'products.empty': 'No products found. Check back soon!',
        'product.notFound': 'Product Not Found',
        'product.backToCollection': '← Back to Collection',
        'product.limitedEdition': 'Limited Edition',
        'product.scentPyramid': 'Scent Pyramid',
        'product.topNotes': 'Top Notes',
        'product.heartNotes': 'Heart Notes',
        'product.baseNotes': 'Base Notes',
        'product.selectSize': 'Select Size',
        'product.standard': 'Standard',
        'product.freeShipping': 'Free shipping over 500 EGP',
        'product.authentic': 'Authentic Guarantee',
        'collection.empty': 'No products in this collection yet.',

        // Footer
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
        'nav.wishlist': 'المفضلة',

        // Hero
        'hero.subtitle': 'عطور فاخرة',
        'hero.description': 'اكتشف فن العطور الفاخرة مع تشكيلتنا الحصرية المصممة خصيصاً للأناقة والتميز.',
        'hero.shopNow': 'تسوق الآن',
        'hero.explore': 'استعرض المجموعة',

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
        'admin.price': 'السعر (مثال: 3,200 ج.م)',
        'admin.image': 'صورة المنتج',
        'admin.chooseFile': 'اختر ملف الصورة',
        'admin.dashboard': 'لوحة التحكم',
        'admin.welcome': 'مرحباً بعودتك، أدمن.',
        'admin.uploading': 'جاري الرفع...',
        'admin.productName': 'اسم المنتج',
        'admin.basePrice': 'السعر الأساسي',
        'admin.oldPrice': 'السعر القديم (مشطوب)',
        'admin.sizePrices': 'أسعار الأحجام',
        'admin.optional': 'اختياري',
        'admin.price30ml': 'سعر 30 مل',
        'admin.price50ml': 'سعر 50 مل',
        'admin.price100ml': 'سعر 100 مل',
        'admin.oldPrice30ml': 'سعر 30 مل القديم',
        'admin.oldPrice50ml': 'سعر 50 مل القديم',
        'admin.oldPrice100ml': 'سعر 100 مل القديم',
        'admin.description': 'الوصف',
        'admin.descriptionPlaceholder': 'مزيج رائع من أجود المكونات...',
        'admin.scentNotes': 'مكونات العطر',
        'admin.productImages': 'صور المنتج (حتى 5)',
        'admin.addImages': 'انقر لإضافة صور',
        'admin.tab.dashboard': 'لوحة التحكم',
        'admin.tab.orders': 'الطلبات',
        'admin.tab.products': 'المنتجات',
        'admin.tab.analytics': 'التحليلات',
        'admin.tab.settings': 'الإعدادات',
        'admin.stats.totalRevenue': 'إجمالي الإيرادات',
        'admin.stats.totalOrders': 'إجمالي الطلبات',
        'admin.stats.topSelling': 'الأكثر مبيعاً',
        'admin.stats.avgOrder': 'متوسط قيمة الطلب',
        'admin.stats.todayOrders': 'طلبات اليوم',
        'admin.stats.todayRevenue': 'إيرادات اليوم',
        'admin.stats.conversionRate': 'معدل التحويل',
        'admin.stats.deliveredTotal': 'مُسلَّم / الإجمالي',
        'admin.stats.statusBreakdown': 'تفاصيل حالة الطلبات',
        'admin.stats.pending': 'معلق',
        'admin.stats.confirmed': 'مؤكد',
        'admin.stats.delivered': 'تم التوصيل',
        'admin.stats.returned': 'مرتجع',
        'admin.stats.failed': 'فشل',
        'admin.orders.title': 'الطلبات',
        'admin.orders.export': 'تصدير',
        'admin.orders.exportClear': 'تصدير ومسح',
        'admin.orders.searchPlaceholder': 'ابحث بالرقم أو الاسم أو الهاتف...',
        'admin.orders.loading': 'جاري تحميل الطلبات...',
        'admin.orders.empty': 'لا توجد طلبات.',
        'admin.orders.date': 'الطلب / التاريخ',
        'admin.orders.customer': 'العميل',
        'admin.orders.items': 'المنتجات',
        'admin.orders.total': 'الإجمالي',
        'admin.orders.status': 'الحالة',
        'admin.orders.deleteRecord': 'حذف السجل',
        'admin.orders.note': 'ملاحظة',
        'admin.products.title': 'مجموعة المنتجات',
        'admin.products.subtitle': 'إدارة مخزون العطور الفاخرة',
        'admin.products.details': 'التفاصيل',
        'admin.products.classification': 'التصنيف',
        'admin.products.valuation': 'التسعير',
        'admin.products.inventory': 'المخزون',
        'admin.products.actions': 'إجراءات',
        'admin.products.loading': 'جاري تحميل المنتجات...',
        'admin.products.empty': 'لا توجد مجموعات',
        'admin.products.emptyDesc': 'ابدأ رحلتك الفاخرة بإضافة أول تحفة فنية.',
        'admin.products.variants': 'صور',
        'admin.settings.banner': 'بانر التسويق',
        'admin.settings.bannerVisibility': 'إظهار البانر',
        'admin.settings.bannerDesc': 'تفعيل/تعطيل شريط الإعلانات أعلى الموقع',
        'admin.settings.bannerMessage': 'رسالة البانر',
        'admin.settings.bannerPlaceholder': 'العرض الخاص هنا...',
        'admin.settings.livePreview': 'معاينة مباشرة',
        'admin.settings.noMessage': 'لم يتم تعيين رسالة',
        'admin.settings.save': 'حفظ',
        'admin.settings.saveChanges': 'حفظ التغييرات',
        'admin.settings.performance': 'الأداء والأصول',
        'admin.settings.optimizeTitle': 'ضغط الصور (WebP)',
        'admin.settings.optimizeDesc': 'ضغط جميع صور المنتجات وتحويلها إلى WebP لتحميل أسرع.',
        'admin.settings.optimizeBtn': 'ضغط جميع الصور',
        'admin.settings.replaceImage': 'استبدال الصورة',
        'admin.settings.processing': 'جاري المعالجة...',
        'admin.settings.currentImage': 'الصورة الحالية',
        'admin.settings.empty': 'فارغ',
        'admin.settings.content': 'المحتوى',
        'admin.settings.general': 'الإعدادات العامة',
        'admin.settings.homePage': 'الصفحة الرئيسية',
        'admin.settings.menCollection': 'مجموعة الرجال',
        'admin.settings.womenCollection': 'مجموعة النساء',
        'admin.settings.unisexCollection': 'مجموعة للجنسين',

        // Home & General
        'wishlist.empty': 'قائمة المفضلة فارغة',
        'wishlist.emptyDesc': 'اكتشف مجموعاتنا واختر عطرك المفضل.',
        'home.title': 'عطورنا',
        'home.collections': 'مجموعاتنا',
        'home.all': 'الكل',
        'product.addToCart': 'إضافة للسلة',

        // F5 FIX: Previously hardcoded strings now translated
        'loading.products': 'جاري تحميل المنتجات...',
        'loading.product': 'جاري تحميل المنتج...',
        'products.empty': 'لا توجد منتجات حالياً. تابعنا قريباً!',
        'product.notFound': 'المنتج غير موجود',
        'product.backToCollection': '→ العودة للمجموعة',
        'product.limitedEdition': 'إصدار محدود',
        'product.scentPyramid': 'هرم العطر',
        'product.topNotes': 'المقدمة',
        'product.heartNotes': 'القلب',
        'product.baseNotes': 'القاعدة',
        'product.selectSize': 'اختر الحجم',
        'product.standard': 'عادي',
        'product.freeShipping': 'شحن مجاني فوق 500 جنيه',
        'product.authentic': 'ضمان الأصالة',
        'collection.empty': 'لا توجد منتجات في هذه المجموعة حالياً.',

        // Footer
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
