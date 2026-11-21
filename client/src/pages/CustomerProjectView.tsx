import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectApi } from '../services/api';
import type { WorkspaceData } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { DeclarationModal } from '../components/DeclarationModal';
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileText,
  CreditCard,
  Download,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';

export const CustomerProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeclarationModal, setShowDeclarationModal] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  const fetchWorkspace = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await projectApi.getById(id);
      setWorkspace(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load project workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [id]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin mb-4" />
        <p className="text-xs font-mono text-zinc-600">Loading project status window...</p>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-zinc-900">Project Access Restricted</h2>
          <p className="text-xs text-zinc-600 mt-2 mb-6">
            {error || 'You do not have authorization to view this workspace.'}
          </p>
          <Link
            to="/portal"
            className="inline-block px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 shadow-sm"
          >
            Back to My Projects
          </Link>
        </div>
      </div>
    );
  }

  const { project, updates, documents, transactions, financials } = workspace;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Title */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-zinc-600">
          <Link to="/portal" className="hover:text-zinc-900 flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>My Projects</span>
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-medium">{project.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{project.name}</h1>
              <StatusBadge status={project.development_status} size="lg" />
            </div>
            <p className="text-xs text-zinc-600 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5">
                <span>Platforms:</span>
                <span className="inline-flex flex-wrap gap-1">
                  {project.category ? (
                    project.category.split(',').map((cat, idx) => (
                      <span
                        key={idx}
                        className="font-semibold text-zinc-900 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-[11px]"
                      >
                        {cat.trim()}
                      </span>
                    ))
                  ) : (
                    <strong className="text-zinc-900">General</strong>
                  )}
                </span>
              </span>
              {project.estimated_duration && <span>Target Timeline: <strong className="text-zinc-900">{project.estimated_duration}</strong></span>}
              {project.start_date && <span>Kickoff Date: <strong className="text-zinc-900">{new Date(project.start_date).toLocaleDateString()}</strong></span>}
            </p>
          </div>
        </div>
      </div>

      {/* DECLARATION BANNER */}
      {project.declaration_accepted ? (
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 text-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-900 flex items-center space-x-2">
                <span>Declaration Accepted — Project Development Will Start ASAP</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  CONFIRMED
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                Terms and conditions signed by{' '}
                <strong className="text-zinc-900">{project.declaration_signee_name}</strong> on{' '}
                {project.declaration_accepted_at
                  ? new Date(project.declaration_accepted_at).toLocaleString()
                  : 'Kickoff'}.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/70 text-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-900">
                Action Required: Please Review & Sign the Declaration
              </h2>
              <p className="text-xs text-zinc-600 mt-1">
                Sign off on the project scope and terms to authorize development kickoff.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDeclarationModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-500 transition-colors whitespace-nowrap flex-shrink-0 shadow-sm"
          >
            Review & Sign Declaration
          </button>
        </div>
      )}

      {/* DYNAMIC DEVELOPMENT BUILD LINK SECTION */}
      {project.build_link && (
        <div className="p-5 rounded-2xl border border-sky-200 bg-sky-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-sky-700 font-semibold">
                Live Deployment Preview
              </span>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Active Staging Build Ready for Inspection
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5 font-mono truncate max-w-md">
                {project.build_link}
              </p>
            </div>
          </div>

          <a
            href={project.build_link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-xs hover:bg-sky-500 transition-all flex items-center space-x-2 shadow-sm whitespace-nowrap"
          >
            <span>Launch Staging Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* 2-COLUMN VIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Milestones Timeline & Document Vault */}
        <div className="lg:col-span-2 space-y-8">
          {/* Milestones Feed */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Project Development Updates</span>
              </h2>
              <span className="text-xs font-mono text-zinc-600">
                {updates.length} updates logged
              </span>
            </div>

            <div className="mt-6 space-y-6">
              {updates.length > 0 ? (
                updates.map((update) => (
                  <div key={update.id} className="relative pl-6 pb-6 last:pb-0 border-l border-zinc-200">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-white bg-sky-600 shadow-sm" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">{update.title}</span>
                      <span className="text-[11px] font-mono text-zinc-600">
                        {new Date(update.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed whitespace-pre-line">
                      {update.content}
                    </p>
                    {update.status_snapshot && (
                      <div className="mt-2">
                        <StatusBadge status={update.status_snapshot} size="sm" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  Project initialized. Updates will be broadcasted here by the development team.
                </div>
              )}
            </div>
          </div>

          {/* Documents & Invoices */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Documents, Invoices & Architecture Specs</span>
              </h2>
              <span className="text-xs font-mono text-zinc-600">
                {documents.length} files
              </span>
            </div>

            <div className="mt-4 divide-y divide-zinc-100">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-mono text-zinc-800 font-bold uppercase">
                        {doc.file_type || 'DOC'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900">{doc.title}</div>
                        <div className="text-[10px] text-zinc-600 font-mono flex items-center space-x-2 mt-0.5">
                          <span className="uppercase text-sky-700 font-semibold">{doc.category}</span>
                          <span>•</span>
                          <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No documents or invoices available yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Banking Details, QR Code & Ledger */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
            <div className="pb-4 border-b border-zinc-200">
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Payment & Bank Details</span>
              </h2>
            </div>

            {/* QR Code */}
            {project.payment_qr_url && (
              <div className="flex flex-col items-center p-4 rounded-xl border border-zinc-200 bg-zinc-50 text-center">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-600 mb-2 font-medium">
                  Scan to Pay (Cloudinary Verified)
                </span>
                <img
                  src={project.payment_qr_url}
                  alt="Payment QR"
                  className="w-36 h-36 object-contain rounded-lg border border-zinc-200 bg-white p-2 shadow-sm"
                />
              </div>
            )}

            {/* Bank details table */}
            <div className="space-y-2.5 text-xs">
              {project.bank_name && (
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-600">Bank Name</span>
                  <span className="font-semibold text-zinc-900">{project.bank_name}</span>
                </div>
              )}
              {project.bank_account_name && (
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-600">Beneficiary</span>
                  <span className="font-semibold text-zinc-900">{project.bank_account_name}</span>
                </div>
              )}
              {project.bank_account_number && (
                <div className="flex items-center justify-between py-1 border-b border-zinc-100">
                  <span className="text-zinc-600">Account No.</span>
                  <div className="flex items-center space-x-1 font-mono font-semibold text-zinc-900">
                    <span>{project.bank_account_number}</span>
                    <button
                      onClick={() => handleCopy(project.bank_account_number!)}
                      className="p-1 text-zinc-400 hover:text-zinc-800"
                      title="Copy account number"
                    >
                      {copiedBank ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}
              {project.bank_ifsc_swift && (
                <div className="flex justify-between py-1 border-b border-zinc-100 font-mono">
                  <span className="text-zinc-600">IFSC / SWIFT</span>
                  <span className="font-semibold text-zinc-900">{project.bank_ifsc_swift}</span>
                </div>
              )}
              {project.bank_upi_iban && (
                <div className="flex justify-between py-1 border-b border-zinc-100 font-mono">
                  <span className="text-zinc-600">UPI / IBAN</span>
                  <span className="font-semibold text-zinc-900">{project.bank_upi_iban}</span>
                </div>
              )}
              {project.bank_notes && (
                <div className="pt-2 text-[11px] text-zinc-600 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                  {project.bank_notes}
                </div>
              )}
            </div>
          </div>

          {/* Transactions / Payments Ledger */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center justify-between pb-3 border-b border-zinc-200">
              <span>Transaction History</span>
              <span className="font-mono text-xs text-emerald-700 font-bold">
                ₹{Number(financials.total_paid).toLocaleString('en-IN')} Verified
              </span>
            </h2>

            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.map((txn) => (
                  <div key={txn.id} className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 font-mono">
                        ₹{Number(txn.amount).toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-semibold ${
                          txn.status === 'verified'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-600 flex items-center justify-between">
                      <span>{txn.payment_method}</span>
                      <span>{new Date(txn.payment_date).toLocaleDateString()}</span>
                    </div>
                    {txn.transaction_reference && (
                      <div className="text-[10px] font-mono text-zinc-600 truncate">
                        Ref: {txn.transaction_reference}
                      </div>
                    )}
                    {txn.receipt_url && (
                      <div className="pt-1">
                        <a
                          href={txn.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-sky-700 hover:underline flex items-center space-x-1 font-medium"
                        >
                          <span>View Receipt</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-zinc-500">
                  No payment transactions recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Declaration Modal */}
      {showDeclarationModal && (
        <DeclarationModal
          isOpen={showDeclarationModal}
          onClose={() => setShowDeclarationModal(false)}
          project={project}
          onAccepted={(updated) => {
            setWorkspace({
              ...workspace,
              project: updated,
            });
            setShowDeclarationModal(false);
          }}
        />
      )}
    </div>
  );
};
