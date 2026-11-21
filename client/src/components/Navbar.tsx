import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, LogOut, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // If in admin view, the AdminLayout sidebar handles navigation
  if (role === 'admin' && location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold font-mono text-sm tracking-tighter shadow-sm group-hover:bg-zinc-800 transition-colors">
              W/
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-zinc-900 group-hover:text-zinc-700 transition-colors">
                workroom
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-600">
                Workspace Hub
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-zinc-200">
              {role === 'admin' ? (
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-zinc-100 text-zinc-900 font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Admin Panel</span>
                  </span>
                </Link>
              ) : (
                <Link
                  to="/portal"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    location.pathname.startsWith('/portal')
                      ? 'bg-zinc-100 text-zinc-900 font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-zinc-500" />
                    <span>My Projects</span>
                  </span>
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-zinc-900 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 flex items-center space-x-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'admin' ? 'bg-sky-500' : 'bg-emerald-500'}`} />
                  <span>{user.role}</span>
                </span>
              </div>

              <div className="w-8 h-8 rounded-full border border-zinc-200 bg-zinc-100 flex items-center justify-center text-xs font-mono font-medium text-zinc-800">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
