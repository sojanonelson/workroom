import React, { useState } from 'react';
import { X, Send, Upload, AlertCircle } from 'lucide-react';
import { transactionApi } from '../services/api';
import type { Transaction } from '../types';

interface SubmitPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currency: string;
  onSubmitted: (txn: Transaction) => void;
}

export const SubmitPaymentModal: React.FC<SubmitPaymentModalProps> = ({
  isOpen,
  onClose,
  projectId,
  currency,
  onSubmitted,
}) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Direct Bank Transfer');
  const [reference, setReference] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) {
      setError('Please provide the transfer amount.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('currency', currency);
      formData.append('payment_method', paymentMethod);
      formData.append('transaction_reference', reference.trim());
      formData.append('notes', notes.trim());

      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const res = await transactionApi.submitProof(projectId, formData);
      onSubmitted(res.transaction);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit payment details.');
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
              <Send className="w-4 h-4 text-sky-600" />
              <span>Submit Payment Proof</span>
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Submit transaction details for admin verification and receipt acknowledgement.
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
          <div className="mt-3 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Amount Transferred ({currency}) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="1500.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-xs font-mono focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Payment Method Used *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 text-xs focus:border-zinc-900 focus:outline-none"
            >
              <option value="Direct Bank Transfer">Direct Bank Transfer</option>
              <option value="QR Code / UPI">QR Code / UPI</option>
              <option value="Wire / SWIFT">Wire / SWIFT</option>
              <option value="Cash / Cheque Deposit">Cash / Cheque Deposit</option>
              <option value="Other Transfer">Other Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Bank Reference / UTR Number
            </label>
            <input
              type="text"
              placeholder="e.g. UTR1029384756 or Wire Ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs font-mono focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Transfer Screenshot or Payment Receipt (Optional)
            </label>
            <label className="flex items-center space-x-2 px-3 py-2 rounded-xl border border-zinc-300 bg-zinc-50 cursor-pointer text-xs text-zinc-700 hover:bg-zinc-100 transition-colors">
              <Upload className="w-4 h-4 text-zinc-500" />
              <span>{receiptFile ? receiptFile.name : 'Upload proof receipt'}</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => e.target.files && setReceiptFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Additional Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Transferred from Acme Corp Chase account"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 text-xs focus:border-zinc-900 focus:outline-none"
            />
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
              {loading ? 'Submitting...' : 'Submit Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
