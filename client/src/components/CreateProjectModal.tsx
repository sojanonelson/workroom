import React, { useState } from 'react';
import { X, Upload, Layers, Building, CreditCard, QrCode } from 'lucide-react';
import { projectApi } from '../services/api';
import type { Project } from '../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('6 Weeks');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [developmentStatus, setDevelopmentStatus] = useState('Development Started');
  const [buildLink, setBuildLink] = useState('');
  const [budgetTotal, setBudgetTotal] = useState('5000');
  const [currency, setCurrency] = useState('USD');

  // Banking & Payment Details
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscSwift, setBankIfscSwift] = useState('');
  const [bankUpiIban, setBankUpiIban] = useState('');
  const [bankNotes, setBankNotes] = useState('');
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !category.trim() || !clientEmail.trim()) {
      setError('Please provide project name, category, and client email.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category', category.trim());
      formData.append('client_email', clientEmail.trim());
      formData.append('client_phone', clientPhone.trim());
      formData.append('client_company', clientCompany.trim());
      formData.append('estimated_duration', estimatedDuration.trim());
      formData.append('start_date', startDate);
      formData.append('development_status', developmentStatus);
      formData.append('build_link', buildLink.trim());
      formData.append('budget_total', budgetTotal);
      formData.append('currency', currency);

      // Banking
      formData.append('bank_name', bankName.trim());
      formData.append('bank_account_name', bankAccountName.trim());
      formData.append('bank_account_number', bankAccountNumber.trim());
      formData.append('bank_ifsc_swift', bankIfscSwift.trim());
      formData.append('bank_upi_iban', bankUpiIban.trim());
      formData.append('bank_notes', bankNotes.trim());

      if (qrFile) {
        formData.append('payment_qr_file', qrFile);
      }

      const res = await projectApi.create(formData);
      onCreated(res.project);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to initialize workspace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl text-zinc-900 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-zinc-200">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              Create Project Workspace
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Initialize a dedicated workspace, configure client onboarding details, and payment routing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Section: Project Essentials */}
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider text-sky-700 font-semibold mb-3 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Project Essentials</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex FinTech Platform"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm focus:border-zinc-900 focus:outline-none"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App (iOS & Android)">Mobile App (iOS & Android)</option>
                  <option value="SaaS Architecture">SaaS Architecture</option>
                  <option value="UI/UX Product Design">UI/UX Product Design</option>
                  <option value="E-Commerce & Checkout">E-Commerce & Checkout</option>
                  <option value="AI Integration & LLMs">AI Integration & LLMs</option>
                  <option value="API & Backend Engineering">API & Backend Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Estimated Duration *</label>
                <input
                  type="text"
                  placeholder="e.g. 6 Weeks / 3 Months"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Development Starting Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Initial Status</label>
                <select
                  value={developmentStatus}
                  onChange={(e) => setDevelopmentStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm focus:border-zinc-900 focus:outline-none"
                >
                  <option value="Planning">Planning</option>
                  <option value="Requirements Approved">Requirements Approved</option>
                  <option value="Development Started">Development Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Alpha Build Ready">Alpha Build Ready</option>
                  <option value="Testing & QA">Testing & QA</option>
                  <option value="Ready for Launch">Ready for Launch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Live Development Build Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://staging.client.com"
                  value={buildLink}
                  onChange={(e) => setBuildLink(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Client Contact & Organization */}
          <div className="pt-4 border-t border-zinc-200">
            <h3 className="text-xs uppercase font-mono tracking-wider text-sky-700 font-semibold mb-3 flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>Client Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Client Email *</label>
                <input
                  type="email"
                  required
                  placeholder="client@acme.inc"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Client Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 349-2810"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Company Name</label>
                <input
                  type="text"
                  placeholder="Acme Innovations Ltd."
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Project Budget & Receiving Bank Details */}
          <div className="pt-4 border-t border-zinc-200">
            <h3 className="text-xs uppercase font-mono tracking-wider text-emerald-700 font-semibold mb-3 flex items-center space-x-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Budget & Payment Receiving Setup</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Total Project Budget *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={budgetTotal}
                  onChange={(e) => setBudgetTotal(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm focus:border-zinc-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm focus:border-zinc-900 focus:outline-none font-mono"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>

            {/* Bank details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Receiving Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. JPMorgan Chase / HDFC Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Account Beneficiary Name</label>
                <input
                  type="text"
                  placeholder="e.g. Workroom Studio LLC"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Account Number</label>
                <input
                  type="text"
                  placeholder="0098482019481"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">IFSC / SWIFT / Routing Code</label>
                <input
                  type="text"
                  placeholder="CHASUS33 / HDFC000123"
                  value={bankIfscSwift}
                  onChange={(e) => setBankIfscSwift(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">UPI ID / IBAN (Optional)</label>
                <input
                  type="text"
                  placeholder="workroom@upi / GB29NWBK60161331926819"
                  value={bankUpiIban}
                  onChange={(e) => setBankUpiIban(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Payment Instructions / Notes</label>
                <input
                  type="text"
                  placeholder="Include project name in wire memo"
                  value={bankNotes}
                  onChange={(e) => setBankNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>
            </div>

            {/* QR Code Upload */}
            <div className="mt-4 p-4 rounded-xl border border-zinc-200 bg-zinc-50">
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center space-x-1.5">
                <QrCode className="w-3.5 h-3.5 text-zinc-500" />
                <span>Payment QR Code (Saved to Cloudinary &quot;workroom&quot; folder)</span>
              </label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer inline-flex items-center space-x-2 px-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-800 text-xs font-medium hover:bg-zinc-50 transition-colors shadow-sm">
                  <Upload className="w-4 h-4 text-zinc-500" />
                  <span>Choose QR Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {qrFile && (
                  <span className="text-xs text-zinc-600 font-mono">
                    {qrFile.name} ({(qrFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
                {qrPreview && (
                  <img
                    src={qrPreview}
                    alt="QR Preview"
                    className="w-12 h-12 object-contain rounded border border-zinc-300 bg-white p-1"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Creating Workspace...' : 'Launch Project Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
