import { apiRequest } from '@/services/api';
import type {
  AdminBillingOverview,
  AdminBillingUserLookup,
  AdminCampaignRow,
  AdminCustomDomainRow,
  AdminDashboardStats,
  AdminHealthStatus,
  AdminLink,
  AdminPushSubscriptionRow,
  AdminTeam,
  AdminUser,
  AdminWorkspaceRow,
  FeatureFlagJson,
  LinkJson,
  PaginationMeta,
  SubscriptionTier,
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

export async function updateAdminUser(
  id: string,
  data: { admin?: boolean; role?: UserRole; subscriptionTier?: SubscriptionTier }
) {
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
    teams: AdminTeam[];
    meta: PaginationMeta;
  }>(`/api/v1/admin/teams?${params.toString()}`);
}

export async function fetchAdminTeam(id: string) {
  return apiRequest<{ team: AdminTeam }>(`/api/v1/admin/teams/${id}`);
}

export async function fetchAdminBillingOverview() {
  return apiRequest<{ overview: AdminBillingOverview }>('/api/v1/admin/billing/overview');
}

export async function lookupAdminBillingUser(email: string) {
  return apiRequest<{ user: AdminBillingUserLookup }>(
    `/api/v1/admin/billing/lookup?email=${encodeURIComponent(email)}`
  );
}

export async function createAdminBillingPortalSession(userId: string) {
  return apiRequest<{ url: string }>('/api/v1/admin/billing/portal_session', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function cancelAdminSubscription(userId: string, immediate = false) {
  return apiRequest<{ user: AdminBillingUserLookup }>('/api/v1/admin/billing/cancel_subscription', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, immediate }),
  });
}

export async function fetchAdminHealth() {
  return apiRequest<{ health: AdminHealthStatus }>('/api/v1/admin/health');
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

export async function fetchAdminCampaigns(params: URLSearchParams) {
  return apiRequest<{ campaigns: AdminCampaignRow[]; meta: PaginationMeta }>(
    `/api/v1/admin/campaigns?${params.toString()}`
  );
}

export async function deleteAdminCampaign(id: string) {
  return apiRequest<void>(`/api/v1/admin/campaigns/${id}`, { method: 'DELETE' });
}

export async function fetchAdminWorkspaces(params: URLSearchParams) {
  return apiRequest<{ workspaces: AdminWorkspaceRow[]; meta: PaginationMeta }>(
    `/api/v1/admin/workspaces?${params.toString()}`
  );
}

export async function deleteAdminWorkspace(id: string) {
  return apiRequest<void>(`/api/v1/admin/workspaces/${id}`, { method: 'DELETE' });
}

export async function fetchAdminCustomDomains(params: URLSearchParams) {
  return apiRequest<{ customDomains: AdminCustomDomainRow[]; meta: PaginationMeta }>(
    `/api/v1/admin/custom_domains?${params.toString()}`
  );
}

export async function deleteAdminCustomDomain(id: string) {
  return apiRequest<void>(`/api/v1/admin/custom_domains/${id}`, { method: 'DELETE' });
}

export async function fetchAdminPushSubscriptions(params: URLSearchParams) {
  return apiRequest<{ webPushSubscriptions: AdminPushSubscriptionRow[]; meta: PaginationMeta }>(
    `/api/v1/admin/web_push_subscriptions?${params.toString()}`
  );
}

export async function deleteAdminPushSubscription(id: string) {
  return apiRequest<void>(`/api/v1/admin/web_push_subscriptions/${id}`, { method: 'DELETE' });
}

export type { LinkJson };
