import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminLogin } from '../../pages/AdminLogin';

export const AdminLayout: React.FC = () => {
    const { isAuthenticated, loading, logout } = useAuth();

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

    // Authenticated → show admin layout
    return (
        <div className="min-h-screen flex bg-background-dark text-text-primary">
            <aside className="w-64 border-r border-border-color p-6 flex flex-col gap-8 bg-background-card">
                <div className="text-xl font-bold text-primary tracking-[0.15em]">LALEN ADMIN</div>
                <nav className="flex flex-col gap-2 flex-1">
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded bg-primary/10 text-primary transition-colors">
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded text-text-secondary hover:text-primary transition-colors">
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

            <main className="flex-1 p-10 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};
