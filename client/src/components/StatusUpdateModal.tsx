import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { projectApi } from '../services/api';
import { DevelopmentStatus, Project } from '../types';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onStatusUpdated: (updated: Project) => void;
}

const STATUS_OPTIONS: { value: DevelopmentStatus; label: string; desc: string }[] = [
  { value: 'Planning', label: 'Planning', desc: 'Architecture review & initial scoping phase' },
  { value: 'Requirements Approved', label: 'Requirements Approved', desc: 'Specifications signed off by stakeholders' },
  { value: 'Development Started', label: 'Development Started', desc: 'Active engineering & sprint initialization' },
  { value: 'In Progress', label: 'In Progress', desc: 'Core feature development and module integration' },
  { value: 'Alpha Build Ready', label: 'Alpha Build Ready', desc: 'Staging deployment ready for internal inspection' },
  { value: 'Testing & QA', label: 'Testing & QA', desc: 'Quality assurance, regression, and security testing' },
  { value: 'Ready for Launch', label: 'Ready for Launch', desc: 'Final sign-off, production build deployment' },
  { value: 'Completed', label: 'Completed', desc: 'Delivered & transitioned to maintenance' },
  { value: 'On Hold', label: 'On Hold', desc: 'Temporarily paused awaiting input or assets' },
];

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  project,
  onStatusUpdated,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<DevelopmentStatus>(project.development_status);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(false);
      setLoading(true);
      const res = await projectApi.updateStatus(project.id, selectedStatus, note.trim());
      onStatusUpdated(res.project);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Update Development Status
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Reflects immediately on the customer project view and records a timeline milestone.
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
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {STATUS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                onClick={() => setSelectedStatus(opt.value)}
                className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === opt.value
                    ? 'border-sky-500/60 bg-sky-950/20 text-white shadow-sm'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 text-zinc-300'
                }`}
              >
                <div>
                  <div className="text-xs font-medium tracking-tight flex items-center space-x-2">
                    <span>{opt.label}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {opt.desc}
                  </div>
                </div>
                {selectedStatus === opt.value && (
                  <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                )}
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Milestone Log Note (Visible to Customer)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Completed API authentication modules; initialized staging pipeline."
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
              {loading ? 'Updating...' : 'Publish Status Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
