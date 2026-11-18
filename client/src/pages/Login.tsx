import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { Shield, User, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'customer';

  const [roleTab, setRoleTab] = useState<'customer' | 'admin'>(initialRole);
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
        expected_role: roleTab,
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-100 text-zinc-950 font-bold font-mono text-lg mb-3 shadow-sm">
            W/
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome to Workroom
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Unified workspace portal for project development, status tracking, and deliverables.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {/* Role Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setRoleTab('customer');
                setError(null);
              }}
              className={`py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                roleTab === 'customer'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRoleTab('admin');
                setError(null);
              }}
              className={`py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                roleTab === 'admin'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Admin Access</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder={roleTab === 'admin' ? 'admin@workroom.io' : 'client@company.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder-zinc-500 text-xs focus:border-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder-zinc-500 text-xs focus:border-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-white transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : `Sign in as ${roleTab === 'admin' ? 'Admin' : 'Customer'}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Seed hint for quick local testing */}
          {roleTab === 'admin' && (
            <div className="mt-4 p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 text-[11px] text-zinc-400 font-mono">
              <span className="text-zinc-500">Default Admin:</span> admin@workroom.io / Admin@123
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-zinc-800 text-center">
            <p className="text-xs text-zinc-400">
              New client onboarding?{' '}
              <Link
                to={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                className="text-white hover:underline font-medium"
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
