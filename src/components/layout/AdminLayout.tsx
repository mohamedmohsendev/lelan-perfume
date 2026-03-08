import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Menu, X, ArrowLeft, LogOut, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminLogin } from '../../pages/AdminLogin';

export const AdminLayout: React.FC = () => {
    const { isAuthenticated, loading, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Show loading spinner while verifying token
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <span className="animate-spin inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    // Not logged in → show login page
    if (!isAuthenticated) {
        return <AdminLogin />;
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background-dark text-text-primary">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-background-card border-b border-border-color sticky top-0 z-50">
                <div className="text-xl font-bold text-primary tracking-[0.15em]">LALEN ADMIN</div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-text-primary"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 border-r border-border-color p-6 
                flex flex-col gap-8 bg-background-card transform transition-transform duration-300 md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="hidden md:block text-xl font-bold text-primary tracking-[0.15em]">LALEN ADMIN</div>
                <nav className="flex flex-col gap-2 flex-1 mt-8 md:mt-0">
                    <Link to="/admin?tab=dashboard" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-primary/5 text-text-primary transition-colors">
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link to="/admin?tab=products" className="flex items-center gap-3 px-4 py-3 rounded text-text-primary hover:bg-primary/5 transition-colors">
                        <Package size={18} /> Products
                    </Link>
                </nav>

                <div className="flex flex-col gap-2">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded text-text-secondary hover:text-primary transition-colors">
                        <ArrowLeft size={18} /> Back to Store
                    </Link>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 rounded text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-10 overflow-x-hidden w-full">
                <Outlet />
            </main>
        </div>
    );
};
