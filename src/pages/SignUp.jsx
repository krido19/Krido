import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Scene from '../components/Scene';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                // Create a profile record for the new user
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([{ id: data.user.id, username: email.split('@')[0] }]);

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    // Continue even if profile creation fails, user can update later
                }

                alert('Registration successful! Please check your email for verification.');
                navigate('/login');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden font-mono">
            {/* Background Scene */}
            <div className="fixed inset-0 z-0">
                <Scene />
            </div>

            <div className="absolute top-4 right-4 flex space-x-2 z-20">
                <button
                    onClick={() => changeLanguage('en')}
                    className={`px-3 py-1 text-xs font-bold rounded border transition-all ${i18n.language === 'en' ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-black/50 text-gray-400 border-gray-700 hover:border-cyan-500 hover:text-cyan-400'}`}
                >
                    EN
                </button>
                <button
                    onClick={() => changeLanguage('id')}
                    className={`px-3 py-1 text-xs font-bold rounded border transition-all ${i18n.language === 'id' ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-black/50 text-gray-400 border-gray-700 hover:border-cyan-500 hover:text-cyan-400'}`}
                >
                    ID
                </button>
            </div>

            <div className="w-full max-w-md p-8 space-y-8 bg-black/60 backdrop-blur-md border border-gray-800 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] relative z-10">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 animate-pulse tracking-wider mb-2">{t('signup_title')}</h1>
                    <p className="text-gray-400 text-sm tracking-wide">{t('signup_subtitle')}</p>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-cyan-400 mb-2">
                            {t('email')}
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-600 transition-all duration-300"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-cyan-400 mb-2">
                            {t('password')}
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 bg-black/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white placeholder-gray-600 transition-all duration-300"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex justify-center w-full px-4 py-3 text-sm font-bold text-black uppercase tracking-wider bg-cyan-500 rounded-lg hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] clip-path-polygon"
                            style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                        >
                            {loading ? t('loading') : t('signup_button')}
                        </button>
                    </div>
                </form>

                <div className="text-sm text-center pt-4 border-t border-gray-800">
                    <p className="text-gray-500">
                        {t('have_account')}{' '}
                        <Link to="/login" className="font-bold text-pink-500 hover:text-pink-400 transition-colors">
                            {t('signin')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
