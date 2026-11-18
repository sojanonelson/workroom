import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { User, Shield, Building, Phone, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';
  const inviteToken = searchParams.get('invite_token') || '';
  const initialEmail = searchParams.get('email') || '';

  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('Please provide your name, email, and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        company_name: companyName.trim() || undefined,
        phone: phone.trim() || undefined,
        admin_secret: role === 'admin' ? adminSecret : undefined,
        invite_token: inviteToken || undefined,
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
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#fafafa]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 text-white font-bold font-mono text-lg mb-3 shadow-sm">
            W/
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Create Workroom Account
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Access your project workspaces, live development builds, and deliverables.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
          {/* Role selector */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-100 border border-zinc-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setRole('customer');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                role === 'customer'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                role === 'admin'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-sky-600" />
              <span>Admin Account</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="client@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">Company Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none shadow-sm"
                  />
                </div>
              </div>
            </div>

            {role === 'admin' && (
              <div>
                <label className="block text-xs font-semibold text-sky-700 mb-1.5">
                  Admin Passcode Secret *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter secret (default: workroom_admin_2026)"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs font-mono focus:border-zinc-900 focus:outline-none shadow-sm"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Register & Enter Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-600">
              Already have an account?{' '}
              <Link
                to={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                className="text-zinc-900 font-semibold hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
