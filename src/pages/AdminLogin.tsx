import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export const AdminLogin: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const err = await login(email, password);
        if (err) {
            setError(err);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-primary tracking-[0.25em] uppercase">LALEN</h1>
                    <p className="text-text-secondary text-sm tracking-wider mt-2 uppercase">Admin Panel</p>
                </div>

                <div className="bg-background-card rounded-2xl border border-border-color p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                            <Lock size={18} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary tracking-wide">Sign In</h2>
                            <p className="text-xs text-text-secondary tracking-wider">Enter your admin credentials</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@lalen.com"
                                    className="w-full bg-background-dark border border-border-color rounded p-3 pl-10 text-text-primary focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-text-secondary font-semibold mb-2">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    required
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-background-dark border border-border-color rounded p-3 pl-10 pr-10 text-text-primary focus:outline-none focus:border-primary transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-400 text-xs p-3 bg-red-500/10 rounded border border-red-500/20 tracking-wide">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary text-black font-bold tracking-[0.15em] uppercase rounded hover:bg-highlight disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-text-secondary text-xs mt-6 tracking-wider">
                    © {new Date().getFullYear()} LALEN Perfumes
                </p>
            </div>
        </div>
    );
};
