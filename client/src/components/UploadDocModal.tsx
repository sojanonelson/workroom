import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { documentApi } from '../services/api';
import type { DocumentCategory, ProjectDocument } from '../types';

interface UploadDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onUploaded: (doc: ProjectDocument) => void;
}

const CATEGORIES: { value: DocumentCategory; label: string; icon: string }[] = [
  { value: 'invoice', label: 'Invoice & Billing Statement', icon: '💳' },
  { value: 'budget', label: 'Project Budget & Cost Breakdown', icon: '📊' },
  { value: 'technical', label: 'Technical Document & Architecture', icon: '⚙️' },
  { value: 'contract', label: 'Contract, SOW & Legal NDA', icon: '📜' },
  { value: 'other', label: 'Design Asset / Other Document', icon: '📁' },
];

export const UploadDocModal: React.FC<UploadDocModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onUploaded,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('invoice');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('title', title.trim() || file.name);
      formData.append('category', category);
      formData.append('file', file);

      const res = await documentApi.upload(projectId, formData);
      onUploaded(res.document);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl text-zinc-900">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div>
            <h2 className="text-base font-bold text-zinc-900 tracking-tight flex items-center space-x-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <span>Upload Workspace Document</span>
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Securely stored in Cloudinary folder &quot;workroom&quot; and published to customer workspace.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Document Category *
            </label>
            <div className="space-y-1.5">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                    category === cat.value
                      ? 'border-zinc-900 bg-zinc-900 text-white font-medium shadow-sm'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  {category === cat.value && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SOW-Phase-1-Invoice-001"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Choose Document File (PDF, DOCX, XLSX, PNG, etc.)
            </label>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 hover:border-zinc-400 rounded-xl bg-zinc-50/70 cursor-pointer transition-colors">
              <Upload className="w-6 h-6 text-zinc-400 mb-2" />
              <span className="text-xs text-zinc-800 font-medium">
                {file ? file.name : 'Click to select or drag document here'}
              </span>
              {file && (
                <span className="text-[11px] text-zinc-500 font-mono mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              )}
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-3 border-t border-zinc-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
