import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <SEO title="Sign In" />

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/10 rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-accent/10 rounded-lg rotate-45 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-black text-base leading-none">19</span>
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-2xl font-extrabold text-foreground">nineteen</span>
              <span className="text-2xl font-extrabold text-primary">.dev</span>
            </div>
          </a>
          <p className="text-gray-500 font-medium mt-2">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg p-8">
          {/* Header accent */}
          <div className="h-1 bg-primary rounded-full mb-8 -mt-1 mx-auto w-16" />

          <h1 className="text-2xl font-extrabold text-foreground mb-1">Sign In</h1>
          <p className="text-gray-500 text-sm mb-8">Access your nineteen.dev dashboard</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-md mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-flat border-2 border-transparent"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-flat border-2 border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center gap-2 mt-2 py-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} nineteen.dev
        </p>
      </div>
    </div>
  );
};

export default Login;
