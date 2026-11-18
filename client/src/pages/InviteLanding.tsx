import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { publicApi, projectApi } from '../services/api';
import { Project, WorkspaceData, ProjectDocument, Transaction, ProjectUpdate } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { DeclarationModal } from '../components/DeclarationModal';
import { SubmitPaymentModal } from '../components/SubmitPaymentModal';
import {
  Layers,
  Calendar,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText,
  CreditCard,
  QrCode,
  DollarSign,
  Send,
  Building,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
  Download,
} from 'lucide-react';

export const InviteLanding: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [fullWorkspace, setFullWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeclarationModal, setShowDeclarationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  // Fetch project details via public invite token
  useEffect(() => {
    const fetchInviteProject = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const proj = await publicApi.getByInviteToken(token);
        setProject(proj);

        // If authenticated and user has access, fetch full workspace
        if (isAuthenticated) {
          try {
            const data = await projectApi.getById(proj.id);
            setFullWorkspace(data);
            setProject(data.project);
          } catch (workspaceErr) {
            console.log('User not yet attached to workspace, showing invite preview');
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || 'Invalid or expired invitation link.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchInviteProject();
    }
  }, [token, isAuthenticated, authLoading]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleDeclarationAccepted = (updatedProject: Project) => {
    setProject(updatedProject);
    setShowDeclarationModal(false);
    // Reload full workspace if authenticated
    if (token) {
      publicApi.getByInviteToken(token).then((p) => {
        setProject(p);
      });
      if (isAuthenticated) {
        projectApi.getById(updatedProject.id).then(setFullWorkspace).catch(console.error);
      }
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-zinc-200 animate-spin mb-4" />
        <p className="text-xs font-mono text-zinc-400">Loading Workroom project workspace...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white">Project Invitation Not Found</h2>
          <p className="text-xs text-zinc-400 mt-2 mb-6">
            {error || 'This invitation link may have been revoked or expired.'}
          </p>
          <Link
            to="/login"
            className="inline-block px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-medium hover:bg-white"
          >
            Go to Workroom Login
          </Link>
        </div>
      </div>
    );
  }

  // CASE 1: Client is NOT logged in -> Ask to create account or login
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="max-w-xl w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-zinc-800">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-950 font-bold font-mono text-base flex items-center justify-center">
              W/
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400">
                Workspace Invitation
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {project.name}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Invited client: <strong className="text-zinc-200">{project.client_email}</strong>
              </p>
            </div>
          </div>

          {/* Project Highlights */}
          <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Category</div>
              <div className="text-xs font-medium text-zinc-200 mt-0.5">{project.category}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Duration</div>
              <div className="text-xs font-medium text-zinc-200 mt-0.5">{project.estimated_duration || 'Scheduled'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Current Status</div>
              <div className="mt-1">
                <StatusBadge status={project.development_status} size="sm" />
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">Budget</div>
              <div className="text-xs font-semibold font-mono text-emerald-400 mt-0.5">
                {project.currency} {Number(project.budget_total).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-950/20 mb-6 text-xs text-zinc-300 space-y-2">
            <p className="font-medium text-sky-300 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4" />
              <span>Client Onboarding Required</span>
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Please sign in or create an account with your invited email ({project.client_email}) to review the project declaration terms, track development builds, and access project invoices.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to={`/register?invite_token=${token}&email=${encodeURIComponent(project.client_email)}&redirect=${encodeURIComponent(`/invite/${token}`)}`}
              className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-white transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <span>Create Client Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to={`/login?redirect=${encodeURIComponent(`/invite/${token}`)}`}
              className="w-full py-2.5 px-4 rounded-lg border border-zinc-800 text-zinc-300 font-medium text-xs hover:text-white hover:bg-zinc-900 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Sign In to Existing Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: Client IS logged in -> Show Project Status View Window & Declaration status
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Project Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 mb-1">
            <span>Project Workspace</span>
            <span>/</span>
            <span className="text-zinc-200">{project.category}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-3">
            <span>{project.name}</span>
            <StatusBadge status={project.development_status} size="lg" />
          </h1>
          <p className="text-xs text-zinc-400 mt-1 flex items-center space-x-4">
            <span>Client: <strong className="text-zinc-200">{project.client_company || project.client_email}</strong></span>
            {project.estimated_duration && <span>Duration: <strong className="text-zinc-200">{project.estimated_duration}</strong></span>}
            {project.start_date && <span>Kickoff: <strong className="text-zinc-200">{new Date(project.start_date).toLocaleDateString()}</strong></span>}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/portal"
            className="px-3.5 py-2 rounded-lg border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 text-xs font-medium transition-colors"
          >
            Manage All My Projects
          </Link>
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
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Terms and conditions signed by{' '}
                <strong className="text-zinc-200">{project.declaration_signee_name}</strong> on{' '}
                {project.declaration_accepted_at
                  ? new Date(project.declaration_accepted_at).toLocaleString()
                  : 'Kickoff'}.
                All milestones and staging builds will be continuously published here.
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
                Action Required: Project Declaration & Terms Form
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Before development commences, please review and accept the project scope declaration and engagement terms.
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

      {/* 2-COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Timeline & Documents */}
        <div className="lg:col-span-2 space-y-8">
          {/* Timeline & Milestones Feed */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Development Milestones & Updates</span>
              </h2>
              <span className="text-xs font-mono text-zinc-500">
                {fullWorkspace?.updates.length || 0} updates logged
              </span>
            </div>

            <div className="mt-6 space-y-6">
              {fullWorkspace?.updates && fullWorkspace.updates.length > 0 ? (
                fullWorkspace.updates.map((update, idx) => (
                  <div key={update.id} className="relative pl-6 pb-6 last:pb-0 border-l border-zinc-800">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-zinc-950 bg-sky-400" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-200">
                        {update.title}
                      </span>
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
                  Project initialized. Updates will appear as engineering sprints progress.
                </div>
              )}
            </div>
          </div>

          {/* Project Documents Vault */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Project Documents & Invoices</span>
              </h2>
              <span className="text-xs font-mono text-zinc-500">
                {fullWorkspace?.documents.length || 0} files attached
              </span>
            </div>

            <div className="mt-4 divide-y divide-zinc-800/80">
              {fullWorkspace?.documents && fullWorkspace.documents.length > 0 ? (
                fullWorkspace.documents.map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono text-zinc-400">
                        {doc.file_type ? doc.file_type.toUpperCase() : 'DOC'}
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
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No invoices or technical documents published yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Banking, QR Code & Payments */}
        <div className="space-y-8">
          {/* Banking & QR Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Payment & Banking Details</span>
              </h2>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-medium transition-colors"
              >
                Submit Proof
              </button>
            </div>

            {/* QR Code */}
            {project.payment_qr_url && (
              <div className="flex flex-col items-center p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 text-center">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-2">
                  Scan to Pay
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

          {/* Financials & Transaction Ledger */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center justify-between pb-3 border-b border-zinc-800">
              <span>Financial Overview</span>
              <span className="font-mono text-xs text-emerald-400">
                {project.currency} {Number(fullWorkspace?.financials?.total_paid || 0).toLocaleString()} Paid
              </span>
            </h2>

            <div className="space-y-3">
              {fullWorkspace?.transactions && fullWorkspace.transactions.length > 0 ? (
                fullWorkspace.transactions.map((txn) => (
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
          token={token}
          onAccepted={handleDeclarationAccepted}
        />
      )}

      {/* Submit Payment Proof Modal */}
      {showPaymentModal && (
        <SubmitPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          projectId={project.id}
          currency={project.currency}
          onSubmitted={(txn) => {
            if (fullWorkspace) {
              setFullWorkspace({
                ...fullWorkspace,
                transactions: [txn, ...fullWorkspace.transactions],
              });
            }
          }}
        />
      )}
    </div>
  );
};
