import React from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
    const location = useLocation();

    // Hide button on any admin routes
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <a
            href="https://wa.me/201029449717" // Placeholder, customized later in checkout 
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Contact us on WhatsApp"
        >
            <MessageCircle size={28} />
        </a>
    );
};
