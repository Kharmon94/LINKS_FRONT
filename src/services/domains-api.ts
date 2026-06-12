import { apiRequest } from './api';

export interface CustomDomainJson {
  id: string;
  domain: string;
  status: 'pending' | 'verified';
  isDefault: boolean;
  verificationToken?: string;
  createdAt: string;
  verifiedAt?: string | null;
}

export async function listDomains(): Promise<CustomDomainJson[]> {
  const data = await apiRequest<{ domains: CustomDomainJson[] }>('/api/v1/custom_domains');
  return data.domains;
}

export async function createDomain(domain: string): Promise<CustomDomainJson> {
  const data = await apiRequest<{ domain: CustomDomainJson }>('/api/v1/custom_domains', {
    method: 'POST',
    body: JSON.stringify({ domain }),
  });
  return data.domain;
}

export async function setDefaultDomain(id: string): Promise<CustomDomainJson> {
  const data = await apiRequest<{ domain: CustomDomainJson }>(`/api/v1/custom_domains/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_default: true }),
  });
  return data.domain;
}

export async function deleteDomain(id: string): Promise<void> {
  await apiRequest(`/api/v1/custom_domains/${id}`, { method: 'DELETE' });
}

export async function verifyDomain(id: string, force = false): Promise<CustomDomainJson> {
  const query = force ? '?force=1' : '';
  const data = await apiRequest<{ domain: CustomDomainJson }>(
    `/api/v1/custom_domains/${id}/verify${query}`,
    { method: 'POST' }
  );
  return data.domain;
}
