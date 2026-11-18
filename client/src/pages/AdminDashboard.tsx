import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../services/api';
import type { Project } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { AdminLayout } from '../components/AdminLayout';
import {
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  FolderKanban,
  DollarSign,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCopyInvite = (token: string, projectId: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedId(projectId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client_email.toLowerCase().includes(search.toLowerCase()) ||
      (p.client_company && p.client_company.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalProjects = projects.length;
  const inDevProjects = projects.filter(
    (p) => p.development_status === 'Development Started' || p.development_status === 'In Progress'
  ).length;
  const totalBudget = projects.reduce((sum, p) => sum + parseFloat(String(p.budget_total || 0)), 0);
  const totalPaid = projects.reduce((sum, p) => sum + parseFloat(String(p.total_paid || 0)), 0);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-sky-700 font-semibold">
              Project Overview
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-0.5">
              Workspaces & Client Engagements
            </h1>
            <p className="text-xs text-zinc-600 mt-1">
              Manage client sprint development, dynamic live build links, invoices, and direct payments.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-all shadow-sm flex items-center space-x-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Project Workspace</span>
          </button>
        </div>

        {/* KPI Cards (Clean White) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
            <div className="flex items-center justify-between text-zinc-600 text-xs font-medium">
              <span>Total Projects</span>
              <Layers className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 mt-2 font-mono">{totalProjects}</div>
            <div className="text-[11px] text-zinc-600 mt-1">Across all clients</div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
            <div className="flex items-center justify-between text-zinc-600 text-xs font-medium">
              <span>In Development</span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">{inDevProjects}</div>
            <div className="text-[11px] text-zinc-600 mt-1">Active sprints</div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
            <div className="flex items-center justify-between text-zinc-600 text-xs font-medium">
              <span>Pipeline Budget</span>
              <DollarSign className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 mt-2 font-mono">
              ${totalBudget.toLocaleString()}
            </div>
            <div className="text-[11px] text-zinc-600 mt-1">Total contract value</div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
            <div className="flex items-center justify-between text-zinc-600 text-xs font-medium">
              <span>Collected Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">
              ${totalPaid.toLocaleString()}
            </div>
            <div className="text-[11px] text-zinc-600 mt-1">Verified payments</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search projects, client email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-zinc-600" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-700 text-xs focus:border-zinc-900 focus:outline-none shadow-sm"
            >
              <option value="ALL">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile App (iOS & Android)">Mobile App</option>
              <option value="SaaS Architecture">SaaS Architecture</option>
              <option value="UI/UX Product Design">UI/UX Design</option>
              <option value="AI Integration & LLMs">AI Integration</option>
            </select>
          </div>
        </div>

        {/* Projects List Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-7 h-7 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin mb-3" />
            <p className="text-xs font-mono text-zinc-600">Loading workspaces from Neon...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <FolderKanban className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-zinc-900">No Project Workspaces Found</h2>
            <p className="text-xs text-zinc-600 mt-1 mb-4">
              {search ? 'Try adjusting your search criteria.' : 'Create your first project workspace to get started.'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800"
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((p) => {
              const isCopied = copiedId === p.id;
              const paid = Number(p.total_paid || 0);
              const budget = Number(p.budget_total || 0);
              const progress = budget > 0 ? Math.min(100, Math.round((paid / budget) * 100)) : 0;

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between shadow-sm group"
                >
                  <div>
                    {/* Category & Status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-sky-700 font-semibold">
                        {p.category}
                      </span>
                      <StatusBadge status={p.development_status} size="sm" />
                    </div>

                    {/* Project Name & Company */}
                    <Link
                      to={`/admin/projects/${p.id}`}
                      className="block group-hover:text-sky-700 transition-colors"
                    >
                      <h2 className="text-base font-bold text-zinc-900 tracking-tight flex items-center space-x-1.5">
                        <span>{p.name}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400" />
                      </h2>
                    </Link>

                    <p className="text-xs text-zinc-600 mt-1 truncate">
                      {p.client_company ? `${p.client_company} • ` : ''}{p.client_email}
                    </p>

                    {/* Build Link Indicator */}
                    {p.build_link && (
                      <div className="mt-3 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-[11px] font-mono text-zinc-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="truncate max-w-[200px]">Live Build Active</span>
                      </div>
                    )}

                    {/* Financial Progress Bar */}
                    <div className="mt-5 pt-4 border-t border-zinc-100">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                        <span className="text-zinc-600 font-medium">Collected:</span>
                        <span className="text-zinc-900 font-semibold">
                          {p.currency} {paid.toLocaleString()} / {budget.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <button
                      onClick={() => handleCopyInvite(p.invite_token, p.id)}
                      className="inline-flex items-center space-x-1.5 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200 hover:bg-zinc-50 transition-colors"
                      title="Copy client invite link"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Invite Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Client Link</span>
                        </>
                      )}
                    </button>

                    <Link
                      to={`/admin/projects/${p.id}`}
                      className="text-xs font-semibold text-zinc-900 hover:text-sky-700 flex items-center space-x-1"
                    >
                      <span>Open Workspace</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={(newProj) => {
            setProjects([newProj, ...projects]);
          }}
        />
      </div>
    </AdminLayout>
  );
};
