import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, LogOut, Shield, User as UserIcon, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold font-mono text-sm tracking-tighter group-hover:bg-sky-400 group-hover:text-zinc-950 transition-colors shadow-sm">
              W/
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                workroom
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                Workspace Hub
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-zinc-800/80">
              {role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-zinc-800/90 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-sky-400" />
                    <span>Admin Control</span>
                  </span>
                </Link>
              )}

              <Link
                to="/portal"
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  location.pathname.startsWith('/portal')
                    ? 'bg-zinc-800/90 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <span className="flex items-center space-x-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Client Projects</span>
                </span>
              </Link>
            </nav>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-medium text-zinc-200 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center space-x-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'admin' ? 'bg-sky-400' : 'bg-emerald-400'}`} />
                  <span>{user.role}</span>
                </span>
              </div>

              <div className="w-8 h-8 rounded-full border border-zinc-700/80 bg-zinc-900 flex items-center justify-center text-xs font-mono text-zinc-300">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white transition-all shadow-sm"
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
