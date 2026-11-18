import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectApi } from '../services/api';
import type { Project } from '../types';
import { CreateProjectModal } from './CreateProjectModal';
import {
  FolderKanban,
  Plus,
  LogOut,
  Layers,
  Database,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  CreditCard,
  FileText,
  UserCheck,
  Globe,
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    projectApi.getAll().then(setProjects).catch(console.error);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold font-mono text-xs">
            W/
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-900">workroom</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
            Admin
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-zinc-200 flex flex-col justify-between transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
            <Link to="/admin" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold font-mono text-sm tracking-tighter shadow-sm">
                W/
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-zinc-900">workroom</span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-600">
                  Studio Admin
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 rounded-md text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action: New Workspace Button */}
          <div className="p-4">
            <button
              onClick={() => {
                setIsCreateModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-xl bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 space-y-1">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                location.pathname === '/admin'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FolderKanban className="w-4 h-4 text-zinc-500" />
                <span>All Projects</span>
              </div>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-200/80 text-zinc-700">
                {projects.length}
              </span>
            </Link>

            <Link
              to="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              <Globe className="w-4 h-4 text-zinc-500" />
              <span>Client Portal View</span>
            </Link>
          </div>

          {/* Workspace Jumper Section */}
          <div className="mt-6 px-4">
            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-600 mb-2 flex items-center justify-between">
              <span>Active Workspaces</span>
              <span>{projects.length}</span>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {projects.map((proj) => {
                const isActive = location.pathname === `/admin/projects/${proj.id}`;
                return (
                  <Link
                    key={proj.id}
                    to={`/admin/projects/${proj.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-2.5 py-1.5 rounded-lg text-xs truncate transition-colors ${
                      isActive
                        ? 'bg-zinc-900 text-white font-medium shadow-sm'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{proj.name}</span>
                      {isActive && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer: User Card & DB Status */}
        <div className="p-4 border-t border-zinc-200 bg-white space-y-3">
          {/* Neon DB Indicator */}
          <div className="flex items-center space-x-2 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate">Neon PostgreSQL Live</span>
          </div>

          {/* Profile Card */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-mono font-medium flex-shrink-0 shadow-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-zinc-900 truncate">
                  {user?.name || 'Admin'}
                </div>
                <div className="text-[10px] font-mono text-zinc-600 truncate">
                  {user?.email || 'admin@workroom.io'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#fafafa]">
        {children}
      </main>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newProj) => {
          setProjects([newProj, ...projects]);
          navigate(`/admin/projects/${newProj.id}`);
        }}
      />
    </div>
  );
};
