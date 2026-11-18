import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { publicApi, projectApi } from '../services/api';
import type { Project, WorkspaceData } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { DeclarationModal } from '../components/DeclarationModal';
import {
  Clock,
  ExternalLink,
  ShieldCheck,
  FileText,
  CreditCard,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
  Download,
} from 'lucide-react';

export const InviteLanding: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [fullWorkspace, setFullWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeclarationModal, setShowDeclarationModal] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  useEffect(() => {
    const fetchInviteProject = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const proj = await publicApi.getByInviteToken(token);
        setProject(proj);

        if (isAuthenticated) {
          try {
            const data = await projectApi.getById(proj.id);
            setFullWorkspace(data);
            setProject(data.project);
          } catch {
            console.log('User previewing invite');
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
    if (token) {
      publicApi.getByInviteToken(token).then((p) => setProject(p));
      if (isAuthenticated) {
        projectApi.getById(updatedProject.id).then(setFullWorkspace).catch(console.error);
      }
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin mb-4" />
        <p className="text-xs font-mono text-zinc-600">Loading Workroom project workspace...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-zinc-900">Project Invitation Not Found</h2>
          <p className="text-xs text-zinc-600 mt-2 mb-6">
            {error || 'This invitation link may have been revoked or expired.'}
          </p>
          <Link
            to="/login"
            className="inline-block px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800"
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
        <div className="max-w-xl w-full rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-md">
          <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-zinc-200">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white font-bold font-mono text-base flex items-center justify-center shadow-sm">
              W/
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-sky-700 font-semibold">
                Workspace Invitation
              </span>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                {project.name}
              </h1>
              <p className="text-xs text-zinc-600 mt-0.5">
                Invited client: <strong className="text-zinc-800">{project.client_email}</strong>
              </p>
            </div>
          </div>

          {/* Project Highlights */}
          <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl border border-zinc-200 bg-zinc-50">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-600 font-medium">Category</div>
              <div className="text-xs font-semibold text-zinc-900 mt-0.5">{project.category}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-600 font-medium">Duration</div>
              <div className="text-xs font-semibold text-zinc-900 mt-0.5">{project.estimated_duration || 'Scheduled'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-600 font-medium">Current Status</div>
              <div className="mt-1">
                <StatusBadge status={project.development_status} size="sm" />
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-600 font-medium">Budget</div>
              <div className="text-xs font-bold font-mono text-emerald-700 mt-0.5">
                {project.currency} {Number(project.budget_total).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-sky-200 bg-sky-50 mb-6 text-xs text-zinc-700 space-y-2">
            <p className="font-semibold text-sky-900 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-sky-700" />
              <span>Client Onboarding Required</span>
            </p>
            <p className="text-zinc-600 leading-relaxed">
              Please sign in or create an account with your invited email ({project.client_email}) to review the project declaration terms, track live builds, and access project invoices.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to={`/register?invite_token=${token}&email=${encodeURIComponent(project.client_email)}&redirect=${encodeURIComponent(`/invite/${token}`)}`}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-all shadow-sm flex items-center justify-center space-x-2"
            >
              <span>Create Client Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to={`/login?redirect=${encodeURIComponent(`/invite/${token}`)}`}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition-colors flex items-center justify-center space-x-2"
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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-600 mb-1">
            <span>Project Workspace</span>
            <span>/</span>
            <span className="text-zinc-900 font-medium">{project.category}</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center space-x-3">
            <span>{project.name}</span>
            <StatusBadge status={project.development_status} size="lg" />
          </h1>
          <p className="text-xs text-zinc-600 mt-1 flex items-center space-x-4">
            <span>Client: <strong className="text-zinc-900">{project.client_company || project.client_email}</strong></span>
            {project.estimated_duration && <span>Duration: <strong className="text-zinc-900">{project.estimated_duration}</strong></span>}
            {project.start_date && <span>Kickoff: <strong className="text-zinc-900">{new Date(project.start_date).toLocaleDateString()}</strong></span>}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/portal"
            className="px-3.5 py-2 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold transition-colors shadow-sm"
          >
            Manage All My Projects
          </Link>
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
                All milestones and staging builds will be continuously published here.
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
                Action Required: Project Declaration & Terms Form
              </h2>
              <p className="text-xs text-zinc-600 mt-1">
                Before development commences, please review and accept the project scope declaration and engagement terms.
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
                Live Engineering Deployment
              </span>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Active Development Build Ready for Inspection
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

      {/* 2-COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Timeline & Documents */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Development Milestones & Updates</span>
              </h2>
              <span className="text-xs font-mono text-zinc-600">
                {fullWorkspace?.updates.length || 0} updates logged
              </span>
            </div>

            <div className="mt-6 space-y-6">
              {fullWorkspace?.updates && fullWorkspace.updates.length > 0 ? (
                fullWorkspace.updates.map((update) => (
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
                  Project initialized. Updates will appear as engineering sprints progress.
                </div>
              )}
            </div>
          </div>

          {/* Project Documents */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Project Documents & Invoices</span>
              </h2>
              <span className="text-xs font-mono text-zinc-600">
                {fullWorkspace?.documents.length || 0} files attached
              </span>
            </div>

            <div className="mt-4 divide-y divide-zinc-100">
              {fullWorkspace?.documents && fullWorkspace.documents.length > 0 ? (
                fullWorkspace.documents.map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-mono font-bold text-zinc-800">
                        {doc.file_type ? doc.file_type.toUpperCase() : 'DOC'}
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

        {/* Right: Banking & Payments */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
            <div className="pb-4 border-b border-zinc-200">
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Payment & Banking Details</span>
              </h2>
            </div>

            {project.payment_qr_url && (
              <div className="flex flex-col items-center p-4 rounded-xl border border-zinc-200 bg-zinc-50 text-center">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-600 mb-2 font-medium">
                  Scan to Pay
                </span>
                <img
                  src={project.payment_qr_url}
                  alt="Payment QR"
                  className="w-36 h-36 object-contain rounded-lg border border-zinc-200 bg-white p-2 shadow-sm"
                />
              </div>
            )}

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

          {/* Transactions / Ledger */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center justify-between pb-3 border-b border-zinc-200">
              <span>Financial Overview</span>
              <span className="font-mono text-xs text-emerald-700 font-bold">
                {project.currency} {Number(fullWorkspace?.financials?.total_paid || 0).toLocaleString()} Paid
              </span>
            </h2>

            <div className="space-y-3">
              {fullWorkspace?.transactions && fullWorkspace.transactions.length > 0 ? (
                fullWorkspace.transactions.map((txn) => (
                  <div key={txn.id} className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 font-mono">
                        {txn.currency} {Number(txn.amount).toLocaleString()}
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

      {showDeclarationModal && (
        <DeclarationModal
          isOpen={showDeclarationModal}
          onClose={() => setShowDeclarationModal(false)}
          project={project}
          token={token}
          onAccepted={handleDeclarationAccepted}
        />
      )}
    </div>
  );
};
