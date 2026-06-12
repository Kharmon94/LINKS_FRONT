import { apiRequest } from './api';

export interface CampaignJson {
  id: string;
  name: string;
  description: string;
  linksCount: number;
  totalClicks: number;
  createdAt: string;
  links?: LinkInCampaign[];
}

export interface LinkInCampaign {
  id: string;
  name: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  fullShortUrl?: string;
  clicks: number;
  createdAt: string;
  campaign?: string | null;
  isRandomizer?: boolean;
}

export async function listCampaigns(): Promise<CampaignJson[]> {
  const data = await apiRequest<{ campaigns: CampaignJson[] }>('/api/v1/campaigns');
  return data.campaigns;
}

export async function getCampaign(id: string): Promise<CampaignJson> {
  const data = await apiRequest<{ campaign: CampaignJson }>(`/api/v1/campaigns/${id}`);
  return data.campaign;
}

export async function createCampaign(payload: { name: string; description?: string }): Promise<CampaignJson> {
  const data = await apiRequest<{ campaign: CampaignJson }>('/api/v1/campaigns', {
    method: 'POST',
    body: JSON.stringify({ campaign: payload }),
  });
  return data.campaign;
}

export async function updateCampaign(
  id: string,
  payload: { name: string; description?: string }
): Promise<CampaignJson> {
  const data = await apiRequest<{ campaign: CampaignJson }>(`/api/v1/campaigns/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ campaign: payload }),
  });
  return data.campaign;
}

export async function deleteCampaign(id: string): Promise<void> {
  await apiRequest(`/api/v1/campaigns/${id}`, { method: 'DELETE' });
}

export async function assignLinksToCampaign(id: string, linkIds: string[]): Promise<CampaignJson> {
  const data = await apiRequest<{ campaign: CampaignJson }>(`/api/v1/campaigns/${id}/assign_links`, {
    method: 'POST',
    body: JSON.stringify({ link_ids: linkIds }),
  });
  return data.campaign;
}

export async function listUnassignedLinks(): Promise<LinkInCampaign[]> {
  const data = await apiRequest<{ links: LinkInCampaign[] }>('/api/v1/links');
  return data.links.filter((l) => !l.campaign);
}
