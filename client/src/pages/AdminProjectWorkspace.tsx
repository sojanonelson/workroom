import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectApi, updateApi, documentApi, transactionApi } from '../services/api';
import type { WorkspaceData } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { StatusUpdateModal } from '../components/StatusUpdateModal';
import { BuildLinkModal } from '../components/BuildLinkModal';
import { UploadDocModal } from '../components/UploadDocModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { AdminLayout } from '../components/AdminLayout';
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
      <AdminLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin mb-4" />
          <p className="text-xs font-mono text-zinc-600">Loading project workspace from Neon...</p>
        </div>
      </AdminLayout>
    );
  }

  const { project, updates, documents, transactions, financials } = workspace;

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Top Header / Breadcrumbs & Actions */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-600">
            <Link to="/admin" className="hover:text-zinc-900 flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Projects</span>
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-medium">{project.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{project.name}</h1>
                <button
                  onClick={() => setIsStatusModalOpen(true)}
                  title="Click to update status"
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <StatusBadge status={project.development_status} size="lg" />
                </button>
              </div>
              <p className="text-xs text-zinc-600 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Category: <strong className="text-zinc-900">{project.category}</strong></span>
                <span>Client: <strong className="text-zinc-900">{project.client_company || project.client_email}</strong></span>
                {project.estimated_duration && <span>Duration: <strong className="text-zinc-900">{project.estimated_duration}</strong></span>}
                {project.start_date && <span>Kickoff: <strong className="text-zinc-900">{new Date(project.start_date).toLocaleDateString()}</strong></span>}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dynamic Build Link Button */}
              <button
                onClick={() => setIsBuildLinkModalOpen(true)}
                className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 text-xs font-medium transition-colors shadow-sm flex items-center space-x-2"
              >
                <Globe className="w-3.5 h-3.5 text-sky-600" />
                <span>{project.build_link ? 'Edit Build Link' : 'Add Build Link'}</span>
              </button>

              {/* Copy Client Invite Link */}
              <button
                onClick={handleCopyInvite}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-all shadow-sm flex items-center space-x-2"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Invite Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Share Client Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Overview Metric Cards (White) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="text-xs text-zinc-600 font-medium flex items-center justify-between">
              <span>Project Budget</span>
              <DollarSign className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-xl font-bold font-mono text-zinc-900 mt-2">
              {financials.currency} {Number(financials.budget_total).toLocaleString()}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="text-xs text-zinc-600 font-medium flex items-center justify-between">
              <span>Total Collected</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-2">
              {financials.currency} {Number(financials.total_paid).toLocaleString()}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="text-xs text-zinc-600 font-medium flex items-center justify-between">
              <span>Balance Due</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-bold font-mono text-zinc-900 mt-2">
              {financials.currency} {Number(financials.balance_due).toLocaleString()}
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="text-xs text-zinc-600 font-medium flex items-center justify-between">
              <span>Declaration Status</span>
              <ShieldCheck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-sm font-semibold mt-2">
              {project.declaration_accepted ? (
                <span className="text-emerald-700 font-mono flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Accepted & Signed</span>
                </span>
              ) : (
                <span className="text-amber-700 font-mono flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Awaiting Client</span>
                </span>
              )}
            </div>
            {project.declaration_signee_name && (
              <div className="text-[10px] text-zinc-600 truncate mt-0.5">
                by {project.declaration_signee_name}
              </div>
            )}
          </div>
        </div>

        {/* Live Build Preview Banner (if configured) */}
        {project.build_link && (
          <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50/70 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-xs font-semibold text-sky-900">Live Development Build Active</span>
                <div className="text-xs text-sky-700 font-mono truncate max-w-lg mt-0.5">
                  {project.build_link}
                </div>
              </div>
            </div>
            <a
              href={project.build_link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <span>Preview</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Workspace Tabs Navigation */}
        <div className="border-b border-zinc-200 flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'timeline'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline & Milestones ({updates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'documents'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Document Vault ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'ledger'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Ledger & Direct Payments ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'settings'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* TAB 1: Timeline & Milestones */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {/* Post Milestone Form */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-semibold uppercase font-mono tracking-wider text-sky-700 mb-3 flex items-center space-x-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Broadcast Milestone Update</span>
              </h2>
              <form onSubmit={handlePostUpdate} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Update Title (e.g. Sprint 2: Core Payment Integration Complete)"
                  value={newUpdateTitle}
                  onChange={(e) => setNewUpdateTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none"
                />
                <textarea
                  rows={3}
                  required
                  placeholder="Describe sprint progress, staging updates, or next milestones for the client..."
                  value={newUpdateContent}
                  onChange={(e) => setNewUpdateContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-500">
                    Immediately published to the customer status window.
                  </span>
                  <button
                    type="submit"
                    disabled={submittingUpdate || !newUpdateTitle.trim() || !newUpdateContent.trim()}
                    className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-all shadow-sm disabled:opacity-50"
                  >
                    {submittingUpdate ? 'Broadcasting...' : 'Publish Update'}
                  </button>
                </div>
              </form>
            </div>

            {/* Timeline Feed */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-sm font-bold text-zinc-900">Project Milestone History</h2>
              <div className="space-y-6">
                {updates.map((update) => (
                  <div key={update.id} className="relative pl-6 pb-6 last:pb-0 border-l border-zinc-200">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-white bg-sky-600 shadow-sm" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">{update.title}</span>
                      <span className="text-[11px] font-mono text-zinc-600">
                        {new Date(update.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed whitespace-pre-line">
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

        {/* TAB 2: Document Vault */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900">Document Vault & Cloudinary Storage</h2>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Upload Invoices, Project Budget breakdowns, and Architecture specs to the <strong>workroom</strong> folder.
                </p>
              </div>
              <button
                onClick={() => setIsUploadDocModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-all shadow-sm flex items-center space-x-1.5"
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
                    className="rounded-2xl border border-zinc-200 bg-white p-5 flex flex-col justify-between space-y-4 hover:border-zinc-300 shadow-sm transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center font-mono text-xs font-bold text-zinc-800 uppercase">
                          {doc.file_type || 'DOC'}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-zinc-900 truncate max-w-[180px]">
                            {doc.title}
                          </h3>
                          <span className="text-[10px] uppercase font-mono text-sky-700 font-medium">
                            {doc.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-mono text-zinc-500">
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 flex items-center space-x-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                  <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                  <h3 className="text-xs font-semibold text-zinc-900">No documents uploaded yet</h3>
                  <p className="text-[11px] text-zinc-500 mt-1 mb-4">
                    Upload project invoices, budget sheets, and technical documents for the client.
                  </p>
                  <button
                    onClick={() => setIsUploadDocModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800"
                  >
                    Upload Document
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Payments & Ledger */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900">Direct Payment Ledger</h2>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Record direct bank transfers, cash payments, wire settlements, or verify client submissions.
                </p>
              </div>
              <button
                onClick={() => setIsRecordPaymentModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-500 transition-all shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manually Record Payment</span>
              </button>
            </div>

            {/* Ledger Table */}
            <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-mono uppercase text-[10px] tracking-wider">
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
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {transactions.length > 0 ? (
                      transactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-zinc-600">
                            {new Date(txn.payment_date).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 font-mono font-bold text-zinc-900">
                            {txn.currency} {Number(txn.amount).toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5 font-medium">{txn.payment_method}</td>
                          <td className="px-5 py-3.5 font-mono text-zinc-600 truncate max-w-[150px]">
                            {txn.transaction_reference || '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            {txn.receipt_url ? (
                              <a
                                href={txn.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-700 hover:underline flex items-center space-x-1 font-medium"
                              >
                                <span>View Receipt</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-zinc-400">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold ${
                                txn.status === 'verified'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : txn.status === 'rejected'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
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
                                  className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-medium text-[11px] hover:bg-emerald-500"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => handleVerifyTransaction(txn.id, 'rejected')}
                                  className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-medium text-[11px] hover:bg-rose-100"
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

        {/* TAB 4: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-zinc-900">Project Configuration & Banking Routing</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-mono tracking-wider text-sky-700 font-semibold">
                    Client Information
                  </h3>
                  <div className="space-y-2 p-4 rounded-xl border border-zinc-200 bg-zinc-50">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Email:</span>
                      <span className="text-zinc-900 font-medium">{project.client_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Company:</span>
                      <span className="text-zinc-900 font-medium">{project.client_company || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Phone:</span>
                      <span className="text-zinc-900 font-medium">{project.client_phone || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-mono tracking-wider text-emerald-700 font-semibold">
                    Receiving Bank & QR
                  </h3>
                  <div className="space-y-2 p-4 rounded-xl border border-zinc-200 bg-zinc-50">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Bank:</span>
                      <span className="text-zinc-900 font-medium">{project.bank_name || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Beneficiary:</span>
                      <span className="text-zinc-900 font-medium">{project.bank_account_name || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Account:</span>
                      <span className="font-mono text-zinc-900 font-semibold">{project.bank_account_number || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">SWIFT / IFSC:</span>
                      <span className="font-mono text-zinc-900 font-semibold">{project.bank_ifsc_swift || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-rose-700">Delete Project Workspace</h3>
                  <p className="text-[11px] text-zinc-500">
                    Permanently deletes all project records from Neon PostgreSQL and Cloudinary.
                  </p>
                </div>
                <button
                  onClick={handleDeleteProject}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors"
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
    </AdminLayout>
  );
};
