export interface Product {
    id: string;
    name: string;
    category: string;
    price: string;
    price30ml?: string;
    price50ml?: string;
    price100ml?: string;
    oldPrice?: string;
    oldPrice30ml?: string;
    oldPrice50ml?: string;
    oldPrice100ml?: string;
    description?: string;
    imageUrl: string;
    images?: string[];
    notesTop?: string;
    notesHeart?: string;
    notesBase?: string;
}
