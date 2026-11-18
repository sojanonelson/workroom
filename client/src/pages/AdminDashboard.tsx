import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../services/api';
import { Project } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CreateProjectModal } from '../components/CreateProjectModal';
import {
  Plus,
  Search,
  Filter,
  ExternalLink,
  Copy,
  Check,
  FolderKanban,
  DollarSign,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
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

  // KPI Calculations
  const totalProjects = projects.length;
  const inDevProjects = projects.filter(
    (p) => p.development_status === 'Development Started' || p.development_status === 'In Progress'
  ).length;
  const totalBudget = projects.reduce((sum, p) => sum + parseFloat(String(p.budget_total || 0)), 0);
  const totalPaid = projects.reduce((sum, p) => sum + parseFloat(String(p.total_paid || 0)), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400">
            Workroom Admin Control
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
            Project Workspaces & Client Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Oversee active client engineering sprints, milestone delivery, dynamic build links, and ledger entries.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-white transition-all shadow-md flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Project Workspace</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Total Projects</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">{totalProjects}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Across all clients</div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Active Development</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{inDevProjects}</div>
          <div className="text-[11px] text-zinc-400 mt-1">In active sprints</div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Pipeline Budget</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            ${totalBudget.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Total contract value</div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Ledger Collected</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            ${totalPaid.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Verified transactions</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search projects, client email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder-zinc-500 text-xs focus:border-zinc-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-xs focus:border-zinc-500 focus:outline-none"
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
          <div className="w-7 h-7 rounded-full border-2 border-zinc-700 border-t-zinc-200 animate-spin mb-3" />
          <p className="text-xs font-mono text-zinc-400">Loading project workspaces...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-zinc-800/80 bg-zinc-950 p-8">
          <FolderKanban className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-white">No Project Workspaces Found</h2>
          <p className="text-xs text-zinc-400 mt-1 mb-4">
            {search ? 'Try adjusting your search query.' : 'Get started by creating your first client workspace.'}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-white"
          >
            Create First Workspace
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
                className="rounded-2xl border border-zinc-800/90 bg-zinc-950 p-5 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-sm group"
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400">
                      {p.category}
                    </span>
                    <StatusBadge status={p.development_status} size="sm" />
                  </div>

                  {/* Project Name & Company */}
                  <Link
                    to={`/admin/projects/${p.id}`}
                    className="block group-hover:text-sky-400 transition-colors"
                  >
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center space-x-1.5">
                      <span>{p.name}</span>
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                  </Link>

                  <p className="text-xs text-zinc-400 mt-1 truncate">
                    {p.client_company ? `${p.client_company} • ` : ''}{p.client_email}
                  </p>

                  {/* Build Link Indicator if present */}
                  {p.build_link && (
                    <div className="mt-3 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="truncate max-w-[200px]">Live Build Linked</span>
                    </div>
                  )}

                  {/* Financial Bar */}
                  <div className="mt-5 pt-4 border-t border-zinc-900">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                      <span className="text-zinc-500">Collected:</span>
                      <span className="text-zinc-200">
                        {p.currency} {paid.toLocaleString()} / {budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-5 pt-4 border-t border-zinc-900 flex items-center justify-between">
                  <button
                    onClick={() => handleCopyInvite(p.invite_token, p.id)}
                    className="inline-flex items-center space-x-1.5 text-[11px] font-medium text-zinc-400 hover:text-white px-2.5 py-1 rounded-md border border-zinc-800 hover:bg-zinc-900 transition-colors"
                    title="Copy client invite link"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Invite Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Client Link</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/admin/projects/${p.id}`}
                    className="text-xs font-medium text-zinc-300 hover:text-white flex items-center space-x-1"
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

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newProj) => {
          setProjects([newProj, ...projects]);
        }}
      />
    </div>
  );
};
