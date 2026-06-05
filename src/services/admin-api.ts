import { apiRequest } from '@/services/api';
import type {
  AdminDashboardStats,
  AdminLink,
  AdminUser,
  FeatureFlagJson,
  LinkJson,
  PaginationMeta,
  UserRole,
} from '@/types';

export async function fetchAdminDashboard() {
  return apiRequest<{ stats: AdminDashboardStats }>('/api/v1/admin/dashboard');
}

export async function fetchAdminUsers(params: URLSearchParams) {
  return apiRequest<{ users: AdminUser[]; meta: PaginationMeta }>(
    `/api/v1/admin/users?${params.toString()}`
  );
}

export async function fetchAdminUser(id: string) {
  return apiRequest<{ user: AdminUser }>(`/api/v1/admin/users/${id}`);
}

export async function updateAdminUser(id: string, data: { admin?: boolean; role?: UserRole }) {
  return apiRequest<{ user: AdminUser }>(`/api/v1/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function fetchAdminLinks(params: URLSearchParams) {
  return apiRequest<{ links: AdminLink[]; meta: PaginationMeta }>(
    `/api/v1/admin/links?${params.toString()}`
  );
}

export async function fetchAdminLink(id: string) {
  return apiRequest<{ link: AdminLink }>(`/api/v1/admin/links/${id}`);
}

export async function deleteAdminLink(id: string) {
  return apiRequest<void>(`/api/v1/admin/links/${id}`, { method: 'DELETE' });
}

export async function fetchFeatureFlags() {
  return apiRequest<{ featureFlags: FeatureFlagJson[] }>('/api/v1/admin/feature_flags');
}

export async function updateFeatureFlag(key: string, enabled: boolean) {
  return apiRequest<{ featureFlag: FeatureFlagJson }>(`/api/v1/admin/feature_flags/${key}`, {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  });
}

export async function fetchAdminTeams(params: URLSearchParams) {
  return apiRequest<{
    stats: Record<UserRole, number>;
    members: AdminUser[];
    meta: PaginationMeta;
  }>(`/api/v1/admin/teams?${params.toString()}`);
}

export async function checkHealth() {
  const start = performance.now();
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
  const url = `${base || ''}/up`;
  const res = await fetch(url);
  const latencyMs = Math.round(performance.now() - start);
  const body = await res.text();
  return { ok: res.ok, status: res.status, latencyMs, body, url: url || '/up' };
}

export type { LinkJson };
