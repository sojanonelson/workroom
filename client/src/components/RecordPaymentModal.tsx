import React, { useState } from 'react';
import { X, CreditCard, Upload } from 'lucide-react';
import { transactionApi } from '../services/api';
import { Transaction } from '../types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  defaultCurrency?: string;
  onRecorded: (txn: Transaction) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  projectId,
  defaultCurrency = 'USD',
  onRecorded,
}) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [paymentMethod, setPaymentMethod] = useState('Direct Bank Transfer');
  const [transactionReference, setTransactionReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('verified');
  const [notes, setBankNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) {
      setError('Please provide a valid payment amount.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('currency', currency);
      formData.append('payment_method', paymentMethod);
      formData.append('transaction_reference', transactionReference.trim());
      formData.append('payment_date', paymentDate);
      formData.append('status', status);
      formData.append('notes', notes.trim());

      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const res = await transactionApi.recordManual(projectId, formData);
      onRecorded(res.transaction);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to record payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Manually Record Payment</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Add direct payments, bank wires, cash receipts, or offline settlements to the ledger.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Amount Paid *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="2500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-100 text-xs font-mono focus:border-zinc-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-100 text-xs font-mono focus:border-zinc-500 focus:outline-none"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-100 text-xs focus:border-zinc-500 focus:outline-none"
              >
                <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                <option value="Wire / SWIFT">Wire / SWIFT</option>
                <option value="QR Code / UPI">QR Code / UPI</option>
                <option value="Cash / Cheque">Cash / Cheque</option>
                <option value="Online / Card">Online / Card</option>
                <option value="Escrow / Platform">Escrow / Platform</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-100 text-xs focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Transaction / Reference ID (UTR / Txn Ref)
            </label>
            <input
              type="text"
              placeholder="e.g. UTR8472910398412 or Wire-Ref-90"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder-zinc-500 text-xs font-mono focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Ledger Status
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="verified"
                  checked={status === 'verified'}
                  onChange={() => setStatus('verified')}
                  className="text-emerald-500 focus:ring-0"
                />
                <span>Verified / Completed</span>
              </label>
              <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={status === 'pending'}
                  onChange={() => setStatus('pending')}
                  className="text-amber-500 focus:ring-0"
                />
                <span>Pending Clearance</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Upload Payment Receipt / Proof (Optional, Cloudinary)
            </label>
            <label className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 cursor-pointer text-xs text-zinc-300 hover:bg-zinc-900">
              <Upload className="w-4 h-4 text-zinc-400" />
              <span>{receiptFile ? receiptFile.name : 'Choose receipt image or PDF'}</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => e.target.files && setReceiptFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Notes
            </label>
            <input
              type="text"
              placeholder="e.g. 50% milestone installment confirmed in bank account"
              value={notes}
              onChange={(e) => setBankNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder-zinc-500 text-xs focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-medium text-xs hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Recording...' : 'Add to Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
