import React, { useState } from 'react';
import { ShieldCheck, FileCheck2 } from 'lucide-react';
import type { Project } from '../types';
import { projectApi, publicApi } from '../services/api';

interface DeclarationModalProps {
  isOpen: boolean;
  onClose?: () => void;
  project: Project;
  token?: string;
  onAccepted: (project: Project) => void;
}

export const DeclarationModal: React.FC<DeclarationModalProps> = ({
  isOpen,
  onClose,
  project,
  token,
  onAccepted,
}) => {
  const [signeeName, setSigneeName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('You must accept the terms and conditions to proceed.');
      return;
    }
    if (!signeeName.trim()) {
      setError('Please provide your full legal name as authorized signee.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      let updatedProject: Project;

      if (token) {
        const res = await publicApi.acceptDeclaration(token, signeeName.trim());
        updatedProject = res.project;
      } else {
        const res = await projectApi.acceptDeclaration(project.id, signeeName.trim());
        updatedProject = res.project;
      }

      onAccepted(updatedProject);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit declaration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl text-zinc-900 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 pb-5 border-b border-zinc-200">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900">
              Project Onboarding & Declaration Acceptance
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Review project parameters and sign the declaration to authorize development kickoff.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Project Snapshot Card */}
        <div className="mt-6 p-4 rounded-xl border border-zinc-200 bg-zinc-50 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-600 font-medium">Project Name</div>
            <div className="text-xs font-bold text-zinc-900 mt-0.5 truncate">{project.name}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-600 font-medium">Category</div>
            <div className="text-xs font-bold text-zinc-900 mt-0.5 truncate">{project.category}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-600 font-medium">Duration</div>
            <div className="text-xs font-bold text-zinc-900 mt-0.5 truncate">{project.estimated_duration || 'Scheduled'}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-600 font-medium">Budget</div>
            <div className="text-xs font-bold font-mono text-emerald-700 mt-0.5">
              ₹{Number(project.budget_total).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Terms Container */}
        <div className="mt-6 border border-zinc-200 rounded-xl bg-zinc-50/70 p-4 text-xs text-zinc-700 space-y-3 max-h-52 overflow-y-auto leading-relaxed">
          <p className="font-bold text-zinc-900">
            DECLARATION OF PROJECT SCOPE & TERMS OF ENGAGEMENT
          </p>
          <p>
            <strong>1. Scope of Work & Deliverables:</strong> Workroom agrees to engineer and deliver the software described in the project workspace, adhering to approved technical architecture documents and milestone timelines.
          </p>
          <p>
            <strong>2. Development Kickoff:</strong> Upon acceptance of this declaration, the engineering sprint will initialize ASAP. Live staging preview builds will be continuously published to your workspace window.
          </p>
          <p>
            <strong>3. Confidentiality & Proprietary Rights:</strong> All proprietary code, product roadmaps, and business assets remain strictly confidential under mutual non-disclosure obligations.
          </p>
          <p>
            <strong>4. Communication & Milestone Sign-Off:</strong> Regular updates, technical documents, and milestone notifications will be recorded in this Workroom portal.
          </p>
          <p>
            <strong>5. Payment Terms:</strong> Invoices and payment milestones must be settled per the bank routing or QR code details specified in the workspace ledger.
          </p>
        </div>

        {/* Signature & Agreement Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Authorized Signee Full Legal Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Eleanor Vance"
              value={signeeName}
              onChange={(e) => setSigneeName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none shadow-sm"
            />
          </div>

          <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-0"
            />
            <span className="text-xs text-zinc-700 leading-normal">
              I have thoroughly reviewed the project parameters, timeline, and terms. I accept this declaration on behalf of{' '}
              <strong className="text-zinc-900">{project.client_company || 'our organization'}</strong>, acknowledging that project development will commence immediately.
            </span>
          </label>

          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
            <div className="text-[11px] font-mono text-zinc-600 flex items-center space-x-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
              <span>Timestamped digital verification</span>
            </div>

            <button
              type="submit"
              disabled={loading || !agreeTerms || !signeeName.trim()}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>{loading ? 'Submitting...' : 'Accept Declaration & Kickoff'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
