import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectApi, updateApi, documentApi, transactionApi } from '../services/api';
import { WorkspaceData, Project, ProjectUpdate, ProjectDocument, Transaction, DevelopmentStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { StatusUpdateModal } from '../components/StatusUpdateModal';
import { BuildLinkModal } from '../components/BuildLinkModal';
import { UploadDocModal } from '../components/UploadDocModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import {
  ArrowLeft,
  Copy,
  Check,
  Globe,
  Upload,
  Plus,
  Trash2,
  Download,
  CreditCard,
  Clock,
  FileText,
  Settings,
  ShieldCheck,
  ExternalLink,
  DollarSign,
  Building,
  Mail,
  Phone,
  QrCode,
  AlertCircle,
  Layers,
} from 'lucide-react';

export const AdminProjectWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'ledger' | 'settings'>('timeline');

  // Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isBuildLinkModalOpen, setIsBuildLinkModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);

  // New update post form
  const [newUpdateTitle, setNewUpdateTitle] = useState('');
  const [newUpdateContent, setNewUpdateContent] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  // Copy invite link feedback
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchWorkspace = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await projectApi.getById(id);
      setWorkspace(data);
    } catch (err) {
      console.error('Failed to fetch workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [id]);

  const handleCopyInvite = () => {
    if (!workspace) return;
    const inviteUrl = `${window.location.origin}/invite/${workspace.project.invite_token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newUpdateTitle.trim() || !newUpdateContent.trim()) return;

    try {
      setSubmittingUpdate(true);
      const res = await updateApi.create(id, {
        title: newUpdateTitle.trim(),
        content: newUpdateContent.trim(),
        status_snapshot: workspace?.project.development_status,
      });

      if (workspace) {
        setWorkspace({
          ...workspace,
          updates: [res.update, ...workspace.updates],
        });
      }
      setNewUpdateTitle('');
      setNewUpdateContent('');
    } catch (err) {
      console.error('Failed to post milestone update:', err);
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to remove this document from the workspace?')) return;
    try {
      await documentApi.delete(docId);
      if (workspace) {
        setWorkspace({
          ...workspace,
          documents: workspace.documents.filter((d) => d.id !== docId),
        });
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleVerifyTransaction = async (txnId: string, status: 'verified' | 'rejected') => {
    try {
      const res = await transactionApi.updateStatus(txnId, status);
      if (workspace) {
        const updatedTxns = workspace.transactions.map((t) => (t.id === txnId ? res.transaction : t));
        const totalPaid = updatedTxns
          .filter((t) => t.status === 'verified')
          .reduce((sum, t) => sum + parseFloat(String(t.amount || 0)), 0);

        setWorkspace({
          ...workspace,
          transactions: updatedTxns,
          financials: {
            ...workspace.financials,
            total_paid: totalPaid,
            balance_due: Math.max(0, workspace.financials.budget_total - totalPaid),
          },
        });
      }
    } catch (err) {
      console.error('Failed to update transaction status:', err);
    }
  };

  const handleDeleteProject = async () => {
    if (!id) return;
    const confirmName = prompt(`To confirm deletion, type the project name "${workspace?.project.name}":`);
    if (confirmName !== workspace?.project.name) return;

    try {
      await projectApi.delete(id);
      navigate('/admin');
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  if (loading || !workspace) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-zinc-200 animate-spin mb-4" />
        <p className="text-xs font-mono text-zinc-400">Loading project workspace...</p>
      </div>
    );
  }

  const { project, updates, documents, transactions, financials } = workspace;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header / Breadcrumb & Actions */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500">
          <Link to="/admin" className="hover:text-zinc-300 flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Workspaces</span>
          </Link>
          <span>/</span>
          <span className="text-zinc-300 font-medium">{project.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">{project.name}</h1>
              <button
                onClick={() => setIsStatusModalOpen(true)}
                title="Click to update status"
                className="cursor-pointer hover:opacity-90 transition-opacity"
              >
                <StatusBadge status={project.development_status} size="lg" />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Category: <strong className="text-zinc-200">{project.category}</strong></span>
              <span>Client: <strong className="text-zinc-200">{project.client_company || project.client_email}</strong></span>
              {project.estimated_duration && <span>Duration: <strong className="text-zinc-200">{project.estimated_duration}</strong></span>}
              {project.start_date && <span>Kickoff: <strong className="text-zinc-200">{new Date(project.start_date).toLocaleDateString()}</strong></span>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dynamic Build Link Button */}
            <button
              onClick={() => setIsBuildLinkModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800 text-xs font-medium transition-colors flex items-center space-x-2"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>{project.build_link ? 'Edit Build Link' : 'Add Build Link'}</span>
            </button>

            {/* Copy Client Invite Link */}
            <button
              onClick={handleCopyInvite}
              className="px-3.5 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-white transition-all shadow-sm flex items-center space-x-2"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Invite Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Share Client Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950">
          <div className="text-xs text-zinc-500 flex items-center justify-between">
            <span>Project Budget</span>
            <DollarSign className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">
            {financials.currency} {Number(financials.budget_total).toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950">
          <div className="text-xs text-zinc-500 flex items-center justify-between">
            <span>Total Collected</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-2">
            {financials.currency} {Number(financials.total_paid).toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950">
          <div className="text-xs text-zinc-500 flex items-center justify-between">
            <span>Balance Remaining</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-zinc-200 mt-2">
            {financials.currency} {Number(financials.balance_due).toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950">
          <div className="text-xs text-zinc-500 flex items-center justify-between">
            <span>Declaration Form</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-sm font-semibold mt-2">
            {project.declaration_accepted ? (
              <span className="text-emerald-400 font-mono">Accepted & Signed</span>
            ) : (
              <span className="text-amber-400 font-mono">Awaiting Client</span>
            )}
          </div>
          {project.declaration_signee_name && (
            <div className="text-[10px] text-zinc-400 truncate mt-0.5">
              by {project.declaration_signee_name}
            </div>
          )}
        </div>
      </div>

      {/* Live Build Preview Banner (if set) */}
      {project.build_link && (
        <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-950/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-xs font-semibold text-white">Live Development Build Active</span>
              <div className="text-xs text-sky-300 font-mono truncate max-w-lg mt-0.5">
                {project.build_link}
              </div>
            </div>
          </div>
          <a
            href={project.build_link}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-sky-400 text-zinc-950 text-xs font-semibold hover:bg-sky-300 transition-colors flex items-center space-x-1.5"
          >
            <span>Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Workspace Tabs Navigation */}
      <div className="border-b border-zinc-800 flex items-center space-x-1">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'timeline'
              ? 'border-sky-400 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timeline & Milestones ({updates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'documents'
              ? 'border-sky-400 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Document Vault ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'ledger'
              ? 'border-sky-400 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payments & Ledger ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'settings'
              ? 'border-sky-400 text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Workspace Settings</span>
        </button>
      </div>

      {/* TAB CONTENT: Timeline & Milestones */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Post Update Form */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase font-mono tracking-wider text-sky-400 mb-3 flex items-center space-x-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Broadcast Project Milestone Update</span>
            </h2>
            <form onSubmit={handlePostUpdate} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Update Title (e.g. Sprint 2 Complete: Database Schema & Authentication Live)"
                value={newUpdateTitle}
                onChange={(e) => setNewUpdateTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder-zinc-500 text-xs focus:border-zinc-500 focus:outline-none"
              />
              <textarea
                rows={3}
                required
                placeholder="Describe milestone achievements, staging changes, or next engineering steps..."
                value={newUpdateContent}
                onChange={(e) => setNewUpdateContent(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder-zinc-500 text-xs focus:border-zinc-500 focus:outline-none"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-500">
                  Published immediately to the client status view.
                </span>
                <button
                  type="submit"
                  disabled={submittingUpdate || !newUpdateTitle.trim() || !newUpdateContent.trim()}
                  className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-white transition-all disabled:opacity-50"
                >
                  {submittingUpdate ? 'Broadcasting...' : 'Publish Milestone'}
                </button>
              </div>
            </form>
          </div>

          {/* Timeline Feed */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-6">
            <h2 className="text-sm font-semibold text-white">Chronological Project Log</h2>
            <div className="space-y-6">
              {updates.map((update) => (
                <div key={update.id} className="relative pl-6 pb-6 last:pb-0 border-l border-zinc-800">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-zinc-950 bg-sky-400" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">{update.title}</span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {new Date(update.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed whitespace-pre-line">
                    {update.content}
                  </p>
                  {update.status_snapshot && (
                    <div className="mt-2">
                      <StatusBadge status={update.status_snapshot} size="sm" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Document Vault */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Document Vault & Cloudinary Storage</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload Invoices, Project Budget breakdowns, Architecture specifications, and Legal Agreements.
              </p>
            </div>
            <button
              onClick={() => setIsUploadDocModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-white transition-all flex items-center space-x-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-sky-400 uppercase">
                        {doc.file_type || 'FILE'}
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-zinc-200 truncate max-w-[180px]">
                          {doc.title}
                        </h3>
                        <span className="text-[10px] uppercase font-mono text-zinc-500">
                          {doc.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 flex items-center space-x-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
                <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <h3 className="text-xs font-medium text-white">No documents uploaded yet</h3>
                <p className="text-[11px] text-zinc-500 mt-1 mb-4">
                  Upload project invoices, budget sheets, and technical documents for the client.
                </p>
                <button
                  onClick={() => setIsUploadDocModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-medium hover:bg-white"
                >
                  Upload First Document
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Payments & Ledger */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">Payment Ledger & Direct Transactions</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Record direct bank transfers, offline settlements, cash payments, or verify client submissions.
              </p>
            </div>
            <button
              onClick={() => setIsRecordPaymentModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-semibold text-xs hover:bg-emerald-400 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manually Record Payment</span>
            </button>
          </div>

          {/* Ledger Table */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Payment Method</th>
                    <th className="px-5 py-3">Reference / UTR</th>
                    <th className="px-5 py-3">Receipt</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                  {transactions.length > 0 ? (
                    transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-zinc-400">
                          {new Date(txn.payment_date).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 font-mono font-semibold text-white">
                          {txn.currency} {Number(txn.amount).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">{txn.payment_method}</td>
                        <td className="px-5 py-3.5 font-mono text-zinc-400 truncate max-w-[150px]">
                          {txn.transaction_reference || '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          {txn.receipt_url ? (
                            <a
                              href={txn.receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-400 hover:underline flex items-center space-x-1"
                            >
                              <span>View Receipt</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold ${
                              txn.status === 'verified'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : txn.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          {txn.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerifyTransaction(txn.id, 'verified')}
                                className="px-2.5 py-1 rounded bg-emerald-500 text-zinc-950 font-medium text-[11px] hover:bg-emerald-400"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleVerifyTransaction(txn.id, 'rejected')}
                                className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-medium text-[11px] hover:bg-rose-500/30"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-zinc-500">
                        No transactions recorded in ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Settings & Details */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-6">
            <h2 className="text-base font-semibold text-white">Project Configuration & Routing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-mono tracking-wider text-sky-400">
                  Client Coordinates
                </h3>
                <div className="space-y-2 p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Email:</span>
                    <span className="text-zinc-200">{project.client_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Company:</span>
                    <span className="text-zinc-200">{project.client_company || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Phone:</span>
                    <span className="text-zinc-200">{project.client_phone || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs uppercase font-mono tracking-wider text-emerald-400">
                  Receiving Bank & QR
                </h3>
                <div className="space-y-2 p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Bank:</span>
                    <span className="text-zinc-200">{project.bank_name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Beneficiary:</span>
                    <span className="text-zinc-200">{project.bank_account_name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Account:</span>
                    <span className="font-mono text-zinc-200">{project.bank_account_number || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">SWIFT / IFSC:</span>
                    <span className="font-mono text-zinc-200">{project.bank_ifsc_swift || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-zinc-900 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-rose-400">Delete Project Workspace</h3>
                <p className="text-[11px] text-zinc-500">
                  Irreversibly removes all project updates, documents, and transaction history.
                </p>
              </div>
              <button
                onClick={handleDeleteProject}
                className="px-3.5 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
              >
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        project={project}
        onStatusUpdated={(updated) => {
          setWorkspace({
            ...workspace,
            project: updated,
          });
        }}
      />

      <BuildLinkModal
        isOpen={isBuildLinkModalOpen}
        onClose={() => setIsBuildLinkModalOpen(false)}
        project={project}
        onLinkUpdated={(updated) => {
          setWorkspace({
            ...workspace,
            project: updated,
          });
        }}
      />

      <UploadDocModal
        isOpen={isUploadDocModalOpen}
        onClose={() => setIsUploadDocModalOpen(false)}
        projectId={project.id}
        onUploaded={(doc) => {
          setWorkspace({
            ...workspace,
            documents: [doc, ...workspace.documents],
          });
        }}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentModalOpen}
        onClose={() => setIsRecordPaymentModalOpen(false)}
        projectId={project.id}
        defaultCurrency={project.currency}
        onRecorded={(txn) => {
          const updatedTxns = [txn, ...workspace.transactions];
          const totalPaid = updatedTxns
            .filter((t) => t.status === 'verified')
            .reduce((sum, t) => sum + parseFloat(String(t.amount || 0)), 0);

          setWorkspace({
            ...workspace,
            transactions: updatedTxns,
            financials: {
              ...workspace.financials,
              total_paid: totalPaid,
              balance_due: Math.max(0, workspace.financials.budget_total - totalPaid),
            },
          });
        }}
      />
    </div>
  );
};
