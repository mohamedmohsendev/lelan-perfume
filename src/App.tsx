
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { MainLayout } from './components/layout/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Lazy load pages for performance
const Home = React.lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Men = React.lazy(() => import('./pages/Men').then(module => ({ default: module.Men })));
const Women = React.lazy(() => import('./pages/Women').then(module => ({ default: module.Women })));
const Unisex = React.lazy(() => import('./pages/Unisex').then(module => ({ default: module.Unisex })));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails').then(module => ({ default: module.ProductDetails })));
const Checkout = React.lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const Wishlist = React.lazy(() => import('./pages/Wishlist').then(module => ({ default: module.Wishlist })));

const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background-dark">
    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
  </div>
);

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <ProductProvider>
            <AuthProvider>
              <SiteSettingsProvider>
                <CartProvider>
                  <WishlistProvider>
                    <BrowserRouter>
                      <Suspense fallback={<SuspenseFallback />}>
                        <Routes>
                          <Route path="/" element={<MainLayout />}>
                            <Route index element={<Home />} />
                            <Route path="men" element={<Men />} />
                            <Route path="women" element={<Women />} />
                            <Route path="unisex" element={<Unisex />} />
                            <Route path="wishlist" element={<Wishlist />} />
                            <Route path="product/:id" element={<ProductDetails />} />
                            <Route path="checkout" element={<Checkout />} />
                          </Route>

                          <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                          </Route>
                        </Routes>
                      </Suspense>
                    </BrowserRouter>
                  </WishlistProvider>
                </CartProvider>
              </SiteSettingsProvider>
            </AuthProvider>
          </ProductProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
