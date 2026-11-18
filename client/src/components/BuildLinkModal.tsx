import React, { useState } from 'react';
import { X, Globe, ExternalLink } from 'lucide-react';
import { projectApi } from '../services/api';
import { Project } from '../types';

interface BuildLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onLinkUpdated: (updated: Project) => void;
}

export const BuildLinkModal: React.FC<BuildLinkModalProps> = ({
  isOpen,
  onClose,
  project,
  onLinkUpdated,
}) => {
  const [buildLink, setBuildLink] = useState(project.build_link || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const res = await projectApi.updateBuildLink(project.id, buildLink.trim(), note.trim());
      onLinkUpdated(res.project);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update build link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center space-x-2">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Live Development Build Link</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Dynamically display your latest deployment build directly in the customer status window.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Build / Staging URL
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://staging.workroom.dev/client-preview"
                value={buildLink}
                onChange={(e) => setBuildLink(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder-zinc-500 text-xs focus:border-zinc-500 focus:outline-none font-mono"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Supports Vercel preview URLs, TestFlight, staging servers, or sandbox builds.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Changelog / Note for Customer (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Staging v1.2 with new checkout drawer and responsive mobile navigation."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder-zinc-500 text-xs focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Sync Build Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
