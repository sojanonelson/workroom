import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectApi } from '../services/api';
import { WorkspaceData, Project } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { DeclarationModal } from '../components/DeclarationModal';
import { SubmitPaymentModal } from '../components/SubmitPaymentModal';
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileText,
  CreditCard,
  QrCode,
  Download,
  Copy,
  Check,
  DollarSign,
  AlertCircle,
  Building,
} from 'lucide-react';

export const CustomerProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeclarationModal, setShowDeclarationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-zinc-200 animate-spin mb-4" />
        <p className="text-xs font-mono text-zinc-400">Loading project status window...</p>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white">Project Access Restricted</h2>
          <p className="text-xs text-zinc-400 mt-2 mb-6">
            {error || 'You do not have authorization to view this workspace.'}
          </p>
          <Link
            to="/portal"
            className="inline-block px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-medium hover:bg-white"
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
        <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500">
          <Link to="/portal" className="hover:text-zinc-300 flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>My Projects</span>
          </Link>
          <span>/</span>
          <span className="text-zinc-300 font-medium">{project.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">{project.name}</h1>
              <StatusBadge status={project.development_status} size="lg" />
            </div>
            <p className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Category: <strong className="text-zinc-200">{project.category}</strong></span>
              {project.estimated_duration && <span>Target Timeline: <strong className="text-zinc-200">{project.estimated_duration}</strong></span>}
              {project.start_date && <span>Kickoff Date: <strong className="text-zinc-200">{new Date(project.start_date).toLocaleDateString()}</strong></span>}
            </p>
          </div>
        </div>
      </div>

      {/* DECLARATION BANNER */}
      {project.declaration_accepted ? (
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-emerald-400 flex items-center space-x-2">
                <span>Declaration Accepted — Project Development Will Start ASAP</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  CONFIRMED
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Terms and conditions signed by{' '}
                <strong className="text-zinc-200">{project.declaration_signee_name}</strong> on{' '}
                {project.declaration_accepted_at
                  ? new Date(project.declaration_accepted_at).toLocaleString()
                  : 'Kickoff'}.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl border border-amber-500/40 bg-amber-950/20 text-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-amber-300">
                Action Required: Please Review & Sign the Declaration
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Sign off on the project scope and terms to authorize development kickoff.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDeclarationModal(true)}
            className="px-4 py-2.5 rounded-lg bg-amber-400 text-zinc-950 font-semibold text-xs hover:bg-amber-300 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Review & Sign Declaration
          </button>
        </div>
      )}

      {/* DYNAMIC DEVELOPMENT BUILD LINK SECTION */}
      {project.build_link && (
        <div className="p-5 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/30 to-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-elevated">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400">
                Live Engineering Deployment
              </span>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Active Development Build Ready for Inspection
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono truncate max-w-md">
                {project.build_link}
              </p>
            </div>
          </div>

          <a
            href={project.build_link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-sky-400 text-zinc-950 font-semibold text-xs hover:bg-sky-300 transition-all flex items-center space-x-2 shadow-sm whitespace-nowrap"
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
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Project Development Updates</span>
              </h2>
              <span className="text-xs font-mono text-zinc-500">
                {updates.length} updates logged
              </span>
            </div>

            <div className="mt-6 space-y-6">
              {updates.length > 0 ? (
                updates.map((update) => (
                  <div key={update.id} className="relative pl-6 pb-6 last:pb-0 border-l border-zinc-800">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-zinc-950 bg-sky-400" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-200">{update.title}</span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {new Date(update.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed whitespace-pre-line">
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
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Documents, Invoices & Architecture Specs</span>
              </h2>
              <span className="text-xs font-mono text-zinc-500">
                {documents.length} files
              </span>
            </div>

            <div className="mt-4 divide-y divide-zinc-800/80">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-400 uppercase">
                        {doc.file_type || 'DOC'}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-zinc-200">{doc.title}</div>
                        <div className="text-[10px] text-zinc-500 font-mono flex items-center space-x-2 mt-0.5">
                          <span className="uppercase text-sky-400">{doc.category}</span>
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
                      className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
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
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Payment & Bank Details</span>
              </h2>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-2.5 py-1 rounded-md bg-sky-500 hover:bg-sky-400 text-zinc-950 text-[11px] font-semibold transition-colors"
              >
                Submit Payment Proof
              </button>
            </div>

            {/* QR Code */}
            {project.payment_qr_url && (
              <div className="flex flex-col items-center p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 text-center">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-2">
                  Scan to Pay (Cloudinary Verified)
                </span>
                <img
                  src={project.payment_qr_url}
                  alt="Payment QR"
                  className="w-36 h-36 object-contain rounded-lg border border-zinc-700 bg-white p-2 shadow-sm"
                />
              </div>
            )}

            {/* Bank details table */}
            <div className="space-y-2.5 text-xs">
              {project.bank_name && (
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-500">Bank Name</span>
                  <span className="font-medium text-zinc-200">{project.bank_name}</span>
                </div>
              )}
              {project.bank_account_name && (
                <div className="flex justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-500">Beneficiary</span>
                  <span className="font-medium text-zinc-200">{project.bank_account_name}</span>
                </div>
              )}
              {project.bank_account_number && (
                <div className="flex items-center justify-between py-1 border-b border-zinc-900">
                  <span className="text-zinc-500">Account No.</span>
                  <div className="flex items-center space-x-1 font-mono text-zinc-100">
                    <span>{project.bank_account_number}</span>
                    <button
                      onClick={() => handleCopy(project.bank_account_number!)}
                      className="p-1 hover:text-white"
                      title="Copy account number"
                    >
                      {copiedBank ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                    </button>
                  </div>
                </div>
              )}
              {project.bank_ifsc_swift && (
                <div className="flex justify-between py-1 border-b border-zinc-900 font-mono">
                  <span className="text-zinc-500">IFSC / SWIFT</span>
                  <span className="text-zinc-200">{project.bank_ifsc_swift}</span>
                </div>
              )}
              {project.bank_upi_iban && (
                <div className="flex justify-between py-1 border-b border-zinc-900 font-mono">
                  <span className="text-zinc-500">UPI / IBAN</span>
                  <span className="text-zinc-200">{project.bank_upi_iban}</span>
                </div>
              )}
              {project.bank_notes && (
                <div className="pt-2 text-[11px] text-zinc-400 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
                  {project.bank_notes}
                </div>
              )}
            </div>
          </div>

          {/* Transactions / Payments Ledger */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center justify-between pb-3 border-b border-zinc-800">
              <span>Transaction History</span>
              <span className="font-mono text-xs text-emerald-400">
                {financials.currency} {Number(financials.total_paid).toLocaleString()} Verified
              </span>
            </h2>

            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.map((txn) => (
                  <div key={txn.id} className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-200 font-mono">
                        {txn.currency} {Number(txn.amount).toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                          txn.status === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                      <span>{txn.payment_method}</span>
                      <span>{new Date(txn.payment_date).toLocaleDateString()}</span>
                    </div>
                    {txn.transaction_reference && (
                      <div className="text-[10px] font-mono text-zinc-500 truncate">
                        Ref: {txn.transaction_reference}
                      </div>
                    )}
                    {txn.receipt_url && (
                      <div className="pt-1">
                        <a
                          href={txn.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-sky-400 hover:underline flex items-center space-x-1"
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

      {/* Submit Payment Modal */}
      {showPaymentModal && (
        <SubmitPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          projectId={project.id}
          currency={project.currency}
          onSubmitted={(txn) => {
            setWorkspace({
              ...workspace,
              transactions: [txn, ...workspace.transactions],
            });
          }}
        />
      )}
    </div>
  );
};
