import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Shield,
  ShieldCheck,
  User as UserIcon,
  Search,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Mail,
  Lock,
} from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminUsersModal: React.FC<AdminUsersModalProps> = ({ isOpen, onClose }) => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form to create/invite new admin
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('Admin@123');
  const [submittingNewAdmin, setSubmittingNewAdmin] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authApi.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load user roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = async (targetUser: User, newRole: 'admin' | 'customer') => {
    if (targetUser.id === currentUser?.id) {
      alert('You cannot change your own admin status.');
      return;
    }

    const confirmMsg =
      newRole === 'admin'
        ? `Grant full Admin access to ${targetUser.name || targetUser.email}? They will have full access to all workspaces and financials.`
        : `Revoke Admin access from ${targetUser.name || targetUser.email}? They will be converted to a customer account.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setError(null);
      const res = await authApi.updateUserRole(targetUser.id, newRole);
      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(null), 3500);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to change role.');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      setError('Name and email are required to create an admin account.');
      return;
    }

    try {
      setSubmittingNewAdmin(true);
      setError(null);
      const res = await authApi.createAdmin({
        name: newAdminName.trim(),
        email: newAdminEmail.trim(),
        password: newAdminPassword.trim() || 'Admin@123',
      });

      setSuccessMsg(res.message);
      setTimeout(() => setSuccessMsg(null), 4000);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('Admin@123');
      setShowAddAdminForm(false);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to create admin.');
    } finally {
      setSubmittingNewAdmin(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7 shadow-2xl text-zinc-900 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Team & Admin Roles</h2>
              <p className="text-xs text-zinc-500">
                Promote existing users to Admin or invite new administrators
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mt-3 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="flex-1 font-medium">{successMsg}</span>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-300 bg-white text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddAdminForm(!showAddAdminForm)}
            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddAdminForm ? 'Close Form' : 'New Admin Account'}</span>
          </button>
        </div>

        {/* Create New Admin Form (Expandable) */}
        {showAddAdminForm && (
          <form
            onSubmit={handleCreateAdmin}
            className="mt-3.5 p-4 rounded-xl border border-violet-200 bg-violet-50/60 space-y-3 animate-in fade-in duration-150"
          >
            <h3 className="text-xs font-bold text-violet-950 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-violet-700" />
              <span>Create or Upgrade Admin Account</span>
            </h3>
            <p className="text-[11px] text-zinc-600">
              Enter details below. If a user already exists with this email, their role will be elevated to Admin.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Gmail / Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
                  <input
                    type="email"
                    required
                    placeholder="sarah.admin@gmail.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                  Temporary Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs text-zinc-900 font-mono focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingNewAdmin}
                className="w-full h-8 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <span>{submittingNewAdmin ? 'Provisioning...' : 'Provision Admin'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </form>
        )}

        {/* Users List */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 divide-y divide-zinc-100">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-5 h-5 text-zinc-400 animate-spin" />
              <p className="text-xs font-mono text-zinc-500">Loading registered users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              No users match your search query.
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isAdmin = u.role === 'admin';
              const isSelf = u.id === currentUser?.id;

              return (
                <div
                  key={u.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50/70 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isAdmin
                          ? 'bg-violet-100 text-violet-800 border border-violet-200'
                          : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}
                    >
                      {u.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-zinc-900 truncate">
                          {u.name || 'Unnamed User'}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600">
                            You
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full inline-flex items-center space-x-1 ${
                            isAdmin
                              ? 'bg-violet-50 text-violet-700 border border-violet-200'
                              : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                          }`}
                        >
                          {isAdmin ? <Shield className="w-2.5 h-2.5" /> : <UserIcon className="w-2.5 h-2.5" />}
                          <span>{isAdmin ? 'Admin' : 'Customer'}</span>
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 truncate mt-0.5">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Role Change Action Button */}
                  <div>
                    {!isSelf && (
                      isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleRoleChange(u, 'customer')}
                          className="px-2.5 py-1 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-white text-zinc-600 hover:text-zinc-900 text-[11px] font-medium transition-colors"
                        >
                          Revoke Admin
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRoleChange(u, 'admin')}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-[11px] font-semibold transition-colors shadow-2xs"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Make Admin</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Total users: {users.length} ({users.filter((u) => u.role === 'admin').length} Admins)</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
