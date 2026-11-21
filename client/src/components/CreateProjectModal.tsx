import React, { useState } from 'react';
import {
  X,
  Upload,
  Layers,
  Building,
  CreditCard,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Check,
  IndianRupee,
  Sparkles,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { projectApi } from '../services/api';
import type { Project } from '../types';

const PRESET_CATEGORIES = [
  'Web App',
  'Mobile App (iOS & Android)',
  'UI/UX Design',
  'Backend & Database',
  'SaaS Platform',
  'E-Commerce',
  'AI Integration',
  'DevOps & Cloud',
];

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Project Essentials
  const [name, setName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Web App']);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [developmentStatus, setDevelopmentStatus] = useState('Development Started');
  const [buildLink, setBuildLink] = useState('');

  // Step 2: Client Details
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');

  // Step 3: Budget & Payment Details
  const [budgetTotal, setBudgetTotal] = useState('');
  const currency = 'INR';
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscSwift, setBankIfscSwift] = useState('');
  const [bankUpiIban, setBankUpiIban] = useState('');
  const [bankNotes, setBankNotes] = useState('');
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setCurrentStep(1);
    setName('');
    setSelectedCategories(['Web App']);
    setCustomCategoryInput('');
    setEstimatedDuration('');
    setBuildLink('');
    setClientEmail('');
    setClientPhone('');
    setClientCompany('');
    setBudgetTotal('');
    setBankName('');
    setBankAccountName('');
    setBankAccountNumber('');
    setBankIfscSwift('');
    setBankUpiIban('');
    setBankNotes('');
    setQrFile(null);
    setQrPreview(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const removeQrFile = () => {
    setQrFile(null);
    setQrPreview(null);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((c) => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
    if (error) setError(null);
  };

  const removeCategory = (cat: string) => {
    if (selectedCategories.length === 1) {
      setError('Please keep at least one category or platform.');
      return;
    }
    setSelectedCategories((prev) => prev.filter((c) => c !== cat));
  };

  const addCustomCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (!trimmed) return;
    if (!selectedCategories.includes(trimmed)) {
      setSelectedCategories((prev) => [...prev, trimmed]);
    }
    setCustomCategoryInput('');
    if (error) setError(null);
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 1) {
      if (!name.trim()) {
        setError('Please enter a project name to continue.');
        return false;
      }
      if (selectedCategories.length === 0) {
        setError('Please select at least one platform or category.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!clientEmail.trim()) {
        setError('Please enter the client email address.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientEmail.trim())) {
        setError('Please provide a valid client email address.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!budgetTotal || isNaN(parseFloat(budgetTotal)) || parseFloat(budgetTotal) < 0) {
        setError('Please provide a valid project budget amount.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (Math.min(prev + 1, 3) as 1 | 2 | 3));
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => (Math.max(prev - 1, 1) as 1 | 2 | 3));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category', selectedCategories.join(', '));
      formData.append('client_email', clientEmail.trim().toLowerCase());
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
      handleClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to initialize workspace.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Project Info', desc: 'Name & timeline', icon: Layers },
    { number: 2, title: 'Client Details', desc: 'Contact & company', icon: Building },
    { number: 3, title: 'Budget & Payment', desc: 'INR (₹) & bank info', icon: CreditCard },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7 shadow-2xl text-zinc-900 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold">
                Step {currentStep} of 3
              </span>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900">
                Create Project Workspace
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {currentStep === 1 && 'Define project scope, category, and development milestones.'}
              {currentStep === 2 && 'Set client contact and organization information for access.'}
              {currentStep === 3 && 'Configure project budget in INR and receiving bank/QR details.'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="py-4 border-b border-zinc-100">
          <div className="grid grid-cols-3 gap-2">
            {steps.map((s) => {
              const Icon = s.icon;
              const isDone = currentStep > s.number;
              const isCurrent = currentStep === s.number;
              return (
                <div
                  key={s.number}
                  className={`flex items-center space-x-2.5 p-2 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-violet-50/80 border border-violet-200'
                      : isDone
                      ? 'bg-emerald-50/60 border border-emerald-100'
                      : 'bg-zinc-50/50 border border-zinc-100 opacity-60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 transition-colors ${
                      isCurrent
                        ? 'bg-violet-600 text-white'
                        : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1 hidden sm:block">
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-violet-900' : isDone ? 'text-emerald-900' : 'text-zinc-600'}`}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Step Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto mt-4 pr-1 space-y-4">
          {/* STEP 1: Project Essentials */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Apex FinTech Platform"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </div>

              {/* Multi-category & Platform Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Platforms & Categories <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Select all that apply (e.g. Web + Mobile)
                  </span>
                </div>

                {/* Selected Categories Display */}
                <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 mb-2.5 min-h-[44px] flex flex-wrap items-center gap-1.5">
                  {selectedCategories.length === 0 ? (
                    <span className="text-xs text-zinc-400 italic">No categories selected. Choose from below:</span>
                  ) : (
                    selectedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold shadow-2xs animate-in fade-in duration-100"
                      >
                        <span>{cat}</span>
                        <button
                          type="button"
                          onClick={() => removeCategory(cat)}
                          className="hover:text-rose-300 p-0.5 rounded transition-colors"
                          title="Remove category"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Quick Toggle Preset Pills */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {PRESET_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 border ${
                          isSelected
                            ? 'bg-violet-50 text-violet-800 border-violet-200 font-semibold shadow-2xs'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3 h-3 text-violet-600" />
                        ) : (
                          <Plus className="w-3 h-3 text-zinc-400" />
                        )}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Category Tag Input */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type custom platform or tag (e.g. Chrome Extension)..."
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomCategory();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-xs placeholder-zinc-400 focus:border-zinc-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomCategory}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-semibold text-zinc-700 transition-colors shadow-2xs"
                  >
                    Add Platform
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Estimated Duration <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6 Weeks / 3 Months"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Development Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Initial Development Status
                  </label>
                  <select
                    value={developmentStatus}
                    onChange={(e) => setDevelopmentStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm focus:border-zinc-900 focus:outline-none"
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
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Live Preview / Staging Build Link <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://staging.acme.com"
                    value={buildLink}
                    onChange={(e) => setBuildLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Client Details */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-sky-800 space-y-1">
                <p className="font-semibold flex items-center space-x-1.5">
                  <span>Client Access Provisioning</span>
                </p>
                <p className="text-sky-700 leading-relaxed text-[11px]">
                  When this workspace is created, a secure invite token is generated for this email. The client will be able to review milestone declarations and track builds.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Client Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="client@acme.inc"
                  value={clientEmail}
                  onChange={(e) => {
                    setClientEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Innovations Ltd."
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Client Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Budget & Payment Details */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Budget Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Total Project Budget <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-zinc-500 font-mono text-sm font-semibold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="e.g. 50000"
                      value={budgetTotal}
                      onChange={(e) => {
                        setBudgetTotal(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-sm focus:border-zinc-900 focus:outline-none font-mono placeholder:font-sans placeholder:text-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Currency</label>
                  <div className="flex items-center h-[42px] px-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 text-xs font-mono font-medium">
                    <IndianRupee className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    <span>INR (₹)</span>
                  </div>
                </div>
              </div>

              {/* QR Image / Project Brand Upload */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/80">
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center space-x-1.5">
                  <QrCode className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Payment QR Code / Project Brand Asset</span>
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center space-x-2 px-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-800 text-xs font-medium hover:bg-zinc-50 transition-colors shadow-sm">
                    <Upload className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Choose Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {qrFile && (
                    <div className="flex items-center space-x-2 text-xs font-mono text-zinc-700 bg-white px-2.5 py-1 rounded-lg border border-zinc-200">
                      <span className="truncate max-w-[160px]">{qrFile.name}</span>
                      <span className="text-zinc-400">({(qrFile.size / 1024).toFixed(0)} KB)</span>
                      <button
                        type="button"
                        onClick={removeQrFile}
                        className="text-zinc-400 hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {qrPreview && (
                    <img
                      src={qrPreview}
                      alt="Preview"
                      className="w-10 h-10 object-contain rounded-lg border border-zinc-300 bg-white p-0.5"
                    />
                  )}
                </div>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Receiving Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank / ICICI Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Account Beneficiary Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Workroom Studio Pvt Ltd"
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    placeholder="50200012345678"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">IFSC / SWIFT Code</label>
                  <input
                    type="text"
                    placeholder="HDFC0001234"
                    value={bankIfscSwift}
                    onChange={(e) => setBankIfscSwift(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">UPI ID / VPA</label>
                  <input
                    type="text"
                    placeholder="workroom@hdfcbank"
                    value={bankUpiIban}
                    onChange={(e) => setBankUpiIban(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Payment Instructions / Notes</label>
                  <input
                    type="text"
                    placeholder="Mention project name in transfer remarks"
                    value={bankNotes}
                    onChange={(e) => setBankNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-all shadow-sm"
                >
                  <span>{currentStep === 1 ? 'Next: Client Details' : 'Next: Budget & Payments'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <span>Launching Workspace...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Launch Project Workspace</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
