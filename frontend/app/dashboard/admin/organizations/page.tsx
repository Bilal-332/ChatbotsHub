'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { adminApi, authApi } from '@/lib/api';
import type { AdminOrganization, Paginated } from '@/types/index';
import { PLAN_DISPLAY } from '@/lib/constants';
import { GlassCard } from '@/components/shared/GlassCard';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Building2, Plus, Search, Loader2, Trash2, Pencil, LogIn, BadgeCheck } from 'lucide-react';

const PLAN_OPTIONS = ['free', 'starter', 'pro'] as const;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { startImpersonation, updateUser } = useAuthStore();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<AdminOrganization | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'free',
    isActive: true,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const queryKey = useMemo(() => ['admin-organizations', page, search], [page, search]);

  const { data, isLoading } = useQuery<Paginated<AdminOrganization>>({
    queryKey,
    queryFn: () => adminApi.listOrganizations(page, 12, search).then((res) => res.data.data),
  });

  const { mutate: createOrg, isPending: isCreating } = useMutation({
    mutationFn: () => adminApi.createOrganization({
      name: formData.name,
      slug: formData.slug,
      plan: formData.plan as AdminOrganization['plan'],
      isActive: formData.isActive,
    }),
    onSuccess: () => {
      toast.success('Organization created');
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      setShowModal(false);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Failed to create organization');
    },
  });

  const { mutate: updateOrg, isPending: isUpdating } = useMutation({
    mutationFn: () =>
      adminApi.updateOrganization(editingOrg?._id ?? '', {
        name: formData.name,
        slug: formData.slug,
        plan: formData.plan as AdminOrganization['plan'],
        isActive: formData.isActive,
      }),
    onSuccess: () => {
      toast.success('Organization updated');
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      setShowModal(false);
      setEditingOrg(null);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Failed to update organization');
    },
  });

  const { mutate: deleteOrg, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => adminApi.deleteOrganization(id),
    onSuccess: () => {
      toast.success('Organization deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Failed to delete organization');
    },
  });

  const { mutate: impersonate, isPending: isImpersonating } = useMutation({
    mutationFn: (orgId: string) => adminApi.impersonateOrganization(orgId),
    onSuccess: async (res, orgId) => {
      startImpersonation(res.data.data.tokens, orgId);
      const me = await authApi.me();
      updateUser(me.data.data);
      queryClient.removeQueries({ queryKey: ['organization'] });
      queryClient.removeQueries({ queryKey: ['org-stats'] });
      queryClient.removeQueries({ queryKey: ['documents'] });
      toast.success('Access granted');
      router.push('/dashboard');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Failed to access organization');
    },
  });

  const resetForm = () => {
    setFormData({ name: '', slug: '', plan: 'free', isActive: true });
    setSlugManuallyEdited(false);
  };

  const openCreate = () => {
    resetForm();
    setEditingOrg(null);
    setShowModal(true);
  };

  const openEdit = (org: AdminOrganization) => {
    setFormData({
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      isActive: org.isActive,
    });
    setEditingOrg(org);
    setShowModal(true);
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: slugManuallyEdited ? prev.slug : slugify(value),
    }));
  };

  const handleSubmit = () => {
    if (editingOrg) {
      updateOrg();
    } else {
      createOrg();
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
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Organizations</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Manage every company workspace, plans, and access.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Organization
        </button>
      </motion.div>

      <GlassCard className="p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              className="input pl-9"
              placeholder="Search by name or slug"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="text-xs text-text-secondary">
            {data?.total ?? 0} total organizations
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {data?.items.map((org) => (
              <div
                key={org._id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/50 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-text-primary">{org.name}</p>
                      <span className="badge-blue capitalize">{PLAN_DISPLAY[org.plan]}</span>
                      {org.isActive ? (
                        <span className="badge-green">Active</span>
                      ) : (
                        <span className="badge-gray">Inactive</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">{org.slug}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="btn-secondary"
                    onClick={() => impersonate(org._id)}
                    disabled={isImpersonating}
                  >
                    {isImpersonating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="h-4 w-4" />
                    )}
                    Access
                  </button>
                  <button className="btn-secondary" onClick={() => openEdit(org)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      if (confirm(`Delete ${org.name}? This cannot be undone.`)) {
                        deleteOrg(org._id);
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
                No organizations found.
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <BadgeCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  {editingOrg ? 'Edit Organization' : 'New Organization'}
                </h2>
                <p className="text-sm text-text-secondary">Configure workspace details and plan.</p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-primary">Organization name</label>
                <input
                  className="input"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-primary">Workspace slug</label>
                <input
                  className="input"
                  value={formData.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                  }}
                  placeholder="acme-corp"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">Plan</label>
                  <select
                    className="input"
                    value={formData.plan}
                    onChange={(e) => setFormData((prev) => ({ ...prev, plan: e.target.value }))}
                  >
                    {PLAN_OPTIONS.map((plan) => (
                      <option key={plan} value={plan}>
                        {PLAN_DISPLAY[plan]}
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
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-6">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingOrg(null);
                }}
                disabled={isCreating || isUpdating}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isCreating || isUpdating || !formData.name || !formData.slug}
              >
                {isCreating || isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {editingOrg ? 'Save Changes' : 'Create Organization'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
