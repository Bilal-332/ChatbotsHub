'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { adminApi } from '@/lib/api';
import type { AdminOrganization, AdminUser, Paginated, UserRole } from '@/types/index';
import { GlassCard } from '@/components/shared/GlassCard';
import { motion } from 'framer-motion';
import { Plus, Search, Loader2, Trash2, Pencil, Users, Shield } from 'lucide-react';

const ROLE_OPTIONS: UserRole[] = ['admin', 'member', 'super_admin'];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [organizationId, setOrganizationId] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'member' as UserRole,
    organizationId: '',
    isActive: true,
  });

  const queryKey = useMemo(() => ['admin-users', page, search, organizationId, role], [
    page,
    search,
    organizationId,
    role,
  ]);

  const { data, isLoading } = useQuery<Paginated<AdminUser>>({
    queryKey,
    queryFn: () =>
      adminApi
        .listUsers({ page, limit: 12, search, organizationId: organizationId || undefined, role: role || undefined })
        .then((res) => res.data.data),
  });

  const { data: orgsData } = useQuery<Paginated<AdminOrganization>>({
    queryKey: ['admin-organizations-all'],
    queryFn: () => adminApi.listOrganizations(1, 200).then((res) => res.data.data),
  });

  const { mutate: createUser, isPending: isCreating } = useMutation({
    mutationFn: () =>
      adminApi.createUser({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        organizationId: formData.organizationId,
        isActive: formData.isActive,
      }),
    onSuccess: () => {
      toast.success('User created');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowModal(false);
      setEditingUser(null);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Failed to create user');
    },
  });

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: () =>
      adminApi.updateUser(editingUser?._id ?? '', {
        email: formData.email,
        password: formData.password || undefined,
        role: formData.role,
        organizationId: formData.organizationId,
        isActive: formData.isActive,
      }),
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowModal(false);
      setEditingUser(null);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Failed to update user');
    },
  });

  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Failed to delete user');
    },
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      role: 'member',
      organizationId: orgsData?.items?.[0]?._id ?? '',
      isActive: true,
    });
  };

  const openCreate = () => {
    resetForm();
    setEditingUser(null);
    setShowModal(true);
  };

  const openEdit = (user: AdminUser) => {
    setFormData({
      email: user.email,
      password: '',
      role: user.role,
      organizationId: user.organizationId,
      isActive: user.isActive,
    });
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingUser) {
      updateUser();
    } else {
      createUser();
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Users</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Manage user access across all organizations.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New User
        </button>
      </motion.div>

      <GlassCard className="p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                className="input pl-9"
                placeholder="Search by email"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="input sm:w-52"
              value={organizationId}
              onChange={(e) => {
                setOrganizationId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All organizations</option>
              {orgsData?.items.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name}
                </option>
              ))}
            </select>
            <select
              className="input sm:w-44"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All roles</option>
              {ROLE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-text-secondary">
            {data?.total ?? 0} total users
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {data?.items.map((user) => (
              <div
                key={user._id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/50 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-warning/10 border border-status-warning/20">
                    <Users className="h-5 w-5 text-status-warning" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-text-primary">{user.email}</p>
                      <span className="badge-blue capitalize">{user.role.replace('_', ' ')}</span>
                      {user.isActive ? (
                        <span className="badge-green">Active</span>
                      ) : (
                        <span className="badge-gray">Inactive</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">
                      {user.organization?.name ?? 'Unassigned'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button className="btn-secondary" onClick={() => openEdit(user)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      if (confirm(`Delete ${user.email}?`)) {
                        deleteUser(user._id);
                      }
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {data?.items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-text-secondary">
                No users found.
              </div>
            )}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-border pt-6">
            <button
              className="btn-secondary !px-4"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <span className="text-sm font-medium text-text-secondary">
              Page {page} of {data.totalPages}
            </span>
            <button
              className="btn-secondary !px-4"
              disabled={page === data.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        )}
      </GlassCard>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-status-warning/10 border border-status-warning/20">
                <Shield className="h-5 w-5 text-status-warning" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  {editingUser ? 'Edit User' : 'New User'}
                </h2>
                <p className="text-sm text-text-secondary">Assign roles and access levels.</p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-primary">Email</label>
                <input
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="user@company.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-primary">
                  {editingUser ? 'Reset password (optional)' : 'Password'}
                </label>
                <input
                  type="password"
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Min. 8 chars, incl. uppercase & number"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">Role</label>
                  <select
                    className="input"
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                  >
                    {ROLE_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">Status</label>
                  <select
                    className="input"
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isActive: e.target.value === 'active' }))
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-primary">Organization</label>
                <select
                  className="input"
                  value={formData.organizationId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, organizationId: e.target.value }))}
                >
                  {orgsData?.items.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-6">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingUser(null);
                }}
                disabled={isCreating || isUpdating}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={
                  isCreating ||
                  isUpdating ||
                  !formData.email ||
                  (!editingUser && !formData.password) ||
                  !formData.organizationId
                }
              >
                {isCreating || isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editingUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
