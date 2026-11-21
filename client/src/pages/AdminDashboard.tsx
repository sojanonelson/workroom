import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../services/api';
import type { Project } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { AdminUsersModal } from '../components/AdminUsersModal';
import { AdminLayout } from '../components/AdminLayout';
import { ArrowDownRight, ArrowUpRight, Check, CircleDollarSign, Clock3, Copy, FolderKanban, Layers3, Plus, Search, SlidersHorizontal, Sparkles, Users, Trash2 } from 'lucide-react';

const money = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const AdminDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    projectApi.getAll().then(setProjects).catch((error) => console.error('Failed to load projects:', error)).finally(() => setLoading(false));
  }, []);

  const handleCopyInvite = async (token: string, projectId: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/invite/${token}`);
      setCopiedId(projectId);
      window.setTimeout(() => setCopiedId(null), 2200);
    } catch (error) {
      console.error('Could not copy invite link:', error);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete project "${name}"?\nThis will remove the project, all its milestones, documents, and payments.`)) {
      return;
    }

    try {
      await projectApi.delete(id);
      setProjects((current) => current.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      alert(err.response?.data?.error || 'Failed to delete project.');
    }
  };

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        [project.name, project.client_email, project.client_company || ''].some((value) =>
          value.toLowerCase().includes(query)
        );
      const projectCats = project.category
        ? project.category.split(',').map((c) => c.trim().toLowerCase())
        : [];
      const matchesCategory =
        categoryFilter === 'ALL' ||
        projectCats.includes(categoryFilter.toLowerCase()) ||
        project.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [projects, search, categoryFilter]);

  const inDevProjects = projects.filter((project) => ['Development Started', 'In Progress', 'Testing & QA', 'Alpha Build Ready'].includes(project.development_status)).length;
  const totalBudget = projects.reduce((sum, project) => sum + Number(project.budget_total || 0), 0);
  const totalPaid = projects.reduce((sum, project) => sum + Number(project.total_paid || 0), 0);
  const categories = Array.from(
    new Set(
      projects
        .flatMap((project) =>
          project.category ? project.category.split(',').map((c) => c.trim()) : []
        )
        .filter(Boolean)
    )
  );

  const metrics = [
    { label: 'Total projects', value: projects.length.toString(), note: 'Across all clients', icon: Layers3, tint: 'text-violet-600 bg-violet-50' },
    { label: 'In development', value: inDevProjects.toString(), note: 'Currently in progress', icon: Clock3, tint: 'text-amber-600 bg-amber-50' },
    { label: 'Total contract value', value: money(totalBudget), note: 'Project budgets', icon: CircleDollarSign, tint: 'text-blue-600 bg-blue-50' },
    { label: 'Collected revenue', value: money(totalPaid), note: 'Payments received', icon: ArrowDownRight, tint: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pt-10">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-violet-700"><Sparkles size={14} /> Studio overview</div>
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.035em] text-slate-950 sm:text-[32px]">Good to see you back.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Here’s what’s happening across your client projects today.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsUsersModalOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none"
            >
              <Users size={17} className="text-slate-500" />
              <span>Team & Admins</span>
            </button>
            <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"><Plus size={17} /> New project</button>
          </div>
        </div>

        <section aria-label="Workspace summary" className="mb-9 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {metrics.map(({ label, value, note, icon: Icon, tint }) => (
            <div key={label} className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
              <div className="flex items-start justify-between gap-2"><p className="text-[11px] font-medium text-slate-500 sm:text-xs">{label}</p><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tint}`}><Icon size={16} strokeWidth={1.8} /></span></div>
              <div className="mt-3 truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-[25px]">{value}</div>
              <p className="mt-1 text-[10px] text-slate-400 sm:text-[11px]">{note}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="projects-heading">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="flex items-center gap-2"><h2 id="projects-heading" className="text-base font-semibold tracking-tight text-slate-900">Your projects</h2><span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{filteredProjects.length}</span></div><p className="mt-1 text-xs text-slate-500">Track progress and manage your client workspaces.</p></div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <label className="relative min-w-0 flex-1 sm:w-[270px] sm:flex-none"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" aria-label="Search projects" placeholder="Search projects or clients…" value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100" /></label>
              <label className="relative flex min-w-0 items-center"><SlidersHorizontal size={14} className="pointer-events-none absolute left-3 text-slate-400" /><select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-xs font-medium text-slate-600 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 sm:w-[175px]"><option value="ALL">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><span className="pointer-events-none absolute right-3 text-[10px] text-slate-400">▾</span></label>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white"><div className="mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600" /><p className="text-xs text-slate-500">Loading your projects…</p></div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 text-center"><span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><FolderKanban size={20} /></span><h3 className="text-sm font-semibold text-slate-800">{projects.length ? 'No matching projects' : 'Your next great project starts here'}</h3><p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-500">{projects.length ? 'Try a different search or category.' : 'Create a workspace to keep your team and clients in sync.'}</p>{projects.length === 0 && <button onClick={() => setIsCreateModalOpen(true)} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white hover:bg-violet-700"><Plus size={15} /> Create your first project</button>}</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 xl:gap-4">
              {filteredProjects.map((project) => {
                const copied = copiedId === project.id;
                const paid = Number(project.total_paid || 0);
                const budget = Number(project.budget_total || 0);
                const progress = budget > 0 ? Math.min(100, Math.round((paid / budget) * 100)) : 0;
                return (
                  <article key={project.id} className="group min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-violet-200 hover:shadow-md sm:p-5">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-600">{project.name.trim().charAt(0).toUpperCase() || 'P'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex min-w-0 flex-wrap items-center gap-1.5">
                          {project.category ? (
                            project.category.split(',').map((cat, i) => (
                              <span
                                key={i}
                                className="max-w-full truncate text-[10px] font-semibold uppercase tracking-[0.09em] text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md"
                              >
                                {cat.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-400">
                              General
                            </span>
                          )}
                          {project.build_link && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live build
                            </span>
                          )}
                        </div>
                        <Link to={`/admin/projects/${project.id}`} className="block truncate text-[15px] font-semibold tracking-tight text-slate-900 hover:text-violet-700">
                          {project.name}
                        </Link>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {project.client_company ? `${project.client_company} · ` : ''}
                          {project.client_email}
                        </p>
                      </div>
                      <div className="max-w-[48%] shrink-0"><StatusBadge status={project.development_status} size="sm" /></div>
                    </div>

                    <div className="mt-5 rounded-lg bg-slate-50/80 px-3.5 py-3">
                      <div className="mb-2 flex items-center justify-between gap-3 text-[11px]"><span className="font-medium text-slate-500">Payments received</span><span className="truncate text-right font-semibold text-slate-800">{money(paid)} <span className="font-normal text-slate-400">of {money(budget)}</span></span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${progress}%` }} /></div>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyInvite(project.invite_token, project.id)}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                          title="Copy client invite link"
                        >
                          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          <span>{copied ? 'Link copied' : 'Copy invite'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(project.id, project.name)}
                          className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          title="Delete project"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                      <Link to={`/admin/projects/${project.id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-50">Open workspace <ArrowUpRight size={14} /></Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreated={(project) => setProjects((current) => [project, ...current])} />
        <AdminUsersModal isOpen={isUsersModalOpen} onClose={() => setIsUsersModalOpen(false)} />
      </div>
    </AdminLayout>
  );
};
