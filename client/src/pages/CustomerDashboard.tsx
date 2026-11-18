import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../services/api';
import { Project } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  FolderKanban,
  ExternalLink,
  ShieldCheck,
  Clock,
  Layers,
  ArrowRight,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectApi.getAll();
        setProjects(data);
      } catch (err) {
        console.error('Failed to load client projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800">
        <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400">
          Client Portal
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
          My Projects & Development Hub
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review development progress, access live preview builds, and download project deliverables.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-7 h-7 rounded-full border-2 border-zinc-700 border-t-zinc-200 animate-spin mb-3" />
          <p className="text-xs font-mono text-zinc-400">Loading your project workspaces...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-zinc-800/80 bg-zinc-950 p-8">
          <FolderKanban className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-white">No Projects Connected Yet</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Once an admin creates a project for your email address, your workspace and progress updates will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => {
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-zinc-800/90 bg-zinc-950 p-5 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400">
                      {p.category}
                    </span>
                    <StatusBadge status={p.development_status} size="sm" />
                  </div>

                  <Link
                    to={`/portal/projects/${p.id}`}
                    className="block group-hover:text-sky-400 transition-colors"
                  >
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center space-x-1.5">
                      <span>{p.name}</span>
                    </h2>
                  </Link>

                  <p className="text-xs text-zinc-400 mt-1">
                    Duration: <strong className="text-zinc-300">{p.estimated_duration || 'Scheduled'}</strong>
                  </p>

                  {/* Declaration Status Pill */}
                  <div className="mt-3">
                    {p.declaration_accepted ? (
                      <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Declaration Accepted</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        <AlertCircle className="w-3 h-3" />
                        <span>Declaration Pending</span>
                      </span>
                    )}
                  </div>

                  {/* Dynamic Build Link Pill if active */}
                  {p.build_link && (
                    <div className="mt-3 flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px]">
                      <span className="text-zinc-400 truncate max-w-[150px] font-mono">
                        {p.build_link}
                      </span>
                      <a
                        href={p.build_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1"
                      >
                        <span>Preview</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-500">
                    {p.updates_count || 0} updates • {p.documents_count || 0} files
                  </span>

                  <Link
                    to={`/portal/projects/${p.id}`}
                    className="text-xs font-medium text-white hover:text-sky-400 flex items-center space-x-1"
                  >
                    <span>Open Status View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
