import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'lalen_admin_token';

interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<string | null>;
    logout: () => void;
    token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Check token validity on mount
    useEffect(() => {
        const stored = localStorage.getItem(TOKEN_KEY);
        if (!stored) {
            setLoading(false);
            return;
        }

        fetch(`${API_URL}/api/admin/verify`, {
            headers: { Authorization: `Bearer ${stored}` },
        })
            .then(res => {
                if (res.ok) {
                    setToken(stored);
                } else {
                    localStorage.removeItem(TOKEN_KEY);
                }
            })
            .catch(() => localStorage.removeItem(TOKEN_KEY))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email: string, password: string): Promise<string | null> => {
        try {
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                return data.error || 'Login failed';
            }

            localStorage.setItem(TOKEN_KEY, data.token);
            setToken(data.token);
            return null; // no error
        } catch {
            return 'Could not connect to server';
        }
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!token, loading, login, logout, token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
