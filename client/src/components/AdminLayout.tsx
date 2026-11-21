import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectApi } from '../services/api';
import type { Project } from '../types';
import { CreateProjectModal } from './CreateProjectModal';
import { AdminUsersModal } from './AdminUsersModal';
import { FirstTimePasswordModal } from './FirstTimePasswordModal';
import {
  FolderKanban, Plus, LogOut, ChevronRight, Menu, X, Globe, LayoutGrid, Users,
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    projectApi.getAll().then(setProjects).catch(console.error);
  }, [location.pathname]);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItem = (active: boolean) => `flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors ${active ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`;

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900 md:flex">
      <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur md:hidden">
        <Link to="/admin" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-[11px] font-bold tracking-tight text-white">W</span>
          <span className="text-sm font-semibold tracking-tight">workroom<span className="ml-1.5 text-xs font-normal text-slate-400">studio</span></span>
        </Link>
        <button aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {mobileMenuOpen && <button aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 z-40 bg-slate-950/30 md:hidden" />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-slate-200/80 bg-white transition-transform duration-200 md:sticky md:top-0 md:z-10 md:h-screen md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[72px] items-center gap-3 border-b border-slate-100 px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-xs font-bold text-white shadow-sm shadow-violet-200">W</span>
          <div><div className="text-[15px] font-semibold tracking-tight text-slate-900">workroom</div><div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">Studio workspace</div></div>
          <button aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 md:hidden"><X size={17} /></button>
        </div>

        <div className="px-4 pt-6">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Workspace</div>
          <button onClick={() => { setIsCreateModalOpen(true); setMobileMenuOpen(false); }} className="mb-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-[13px] font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"><Plus size={16} strokeWidth={2.5} /> Create project</button>
          <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={navItem(location.pathname === '/admin')}>
            <LayoutGrid size={17} strokeWidth={1.8} /><span className="flex-1">All projects</span><span className={`rounded-md px-2 py-0.5 text-[11px] ${location.pathname === '/admin' ? 'bg-white text-violet-700' : 'bg-slate-100 text-slate-500'}`}>{projects.length}</span>
          </Link>
          <button
            type="button"
            onClick={() => { setIsUsersModalOpen(true); setMobileMenuOpen(false); }}
            className={navItem(false)}
          >
            <Users size={17} strokeWidth={1.8} />
            <span className="flex-1 text-left">Team & Admins</span>
          </button>
        </div>

        <div className="mt-8 min-h-0 flex-1 px-4">
          <div className="mb-2 flex items-center justify-between px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400"><span>Recent projects</span><span className="font-medium tracking-normal">{projects.length}</span></div>
          <div className="max-h-[calc(100vh-360px)] space-y-0.5 overflow-y-auto">
            {projects.map((project) => {
              const active = location.pathname === `/admin/projects/${project.id}`;
              return <Link key={project.id} to={`/admin/projects/${project.id}`} onClick={() => setMobileMenuOpen(false)} className={`flex min-h-9 items-center gap-2.5 rounded-lg px-3 text-xs transition ${active ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}><FolderKanban size={15} className={active ? 'text-violet-600' : 'text-slate-400'} /><span className="flex-1 truncate">{project.name}</span>{active && <ChevronRight size={14} className="text-slate-400" />}</Link>;
            })}
            {projects.length === 0 && <p className="px-3 py-2 text-xs text-slate-400">Your projects will appear here.</p>}
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] font-medium text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span>All systems operational</span></div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
            <div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-slate-800">{user?.name || 'Admin'}</div><div className="truncate pt-0.5 text-[11px] text-slate-400">{user?.email || ''}</div></div>
            <button onClick={handleLogout} title="Sign out" aria-label="Sign out" className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>

      <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreated={(project) => { setProjects((current) => [project, ...current]); navigate(`/admin/projects/${project.id}`); }} />
      <AdminUsersModal isOpen={isUsersModalOpen} onClose={() => setIsUsersModalOpen(false)} />
      <FirstTimePasswordModal />
    </div>
  );
};
