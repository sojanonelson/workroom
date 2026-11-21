import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login({
        email: email.trim(),
        password,
      });

      login(res.token, res.user);

      if (redirectUrl) {
        navigate(redirectUrl);
      } else if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/portal');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#fafafa]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 text-white font-bold font-mono text-lg mb-3 shadow-sm">
            W/
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Welcome to Workroom
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Sign in to access your projects, development builds, and deliverables.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-5 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>



          <div className="mt-6 pt-5 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-600">
              New client onboarding?{' '}
              <Link
                to={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                className="text-zinc-900 font-semibold hover:underline"
              >
                Create your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
