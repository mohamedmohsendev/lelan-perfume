export interface Order {
    id: string;
    customer_name: string;
    phone: string;
    address: string;
    notes: string;
    cart: any[];
    total: number;
    status: string;
    created_at: string;
}

export type Tab = 'dashboard' | 'orders' | 'products' | 'settings' | 'analytics';

export interface FormShape {
    name: string;
    category: string;
    price: string;
    price30ml: string;
    price50ml: string;
    price100ml: string;
    oldPrice: string;
    description: string;
    notesTop: string;
    notesHeart: string;
    notesBase: string;
    imageFiles: File[];
    imagePreviews: string[];
    existingImages: string[];
    editingId: string | null;
}
