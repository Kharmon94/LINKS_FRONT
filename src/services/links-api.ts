import { apiRequest } from './api';
import type { ClickEventJson, LinkJson, LinksListMeta } from '@/types';

export interface PoolEntryInput {
  id?: string;
  destination_url: string;
  weight: number;
  position?: number;
  _destroy?: boolean;
}

export interface LinkPayload {
  name?: string;
  destination_url?: string;
  short_code?: string;
  link_type?: 'single' | 'randomizer';
  campaign_id?: string | null;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  custom_domain_id?: string | null;
  push_alerts_enabled?: boolean;
  email_alerts_enabled?: boolean;
  alert_interval_value?: number;
  alert_interval_unit?: 'days' | 'weeks' | 'months' | 'years';
  pool_entries_attributes?: PoolEntryInput[];
}

export interface ListLinksParams {
  q?: string;
  link_type?: 'single' | 'randomizer';
  campaign_id?: string;
  page?: number;
  per_page?: number;
}

export async function listLinks(params: ListLinksParams = {}): Promise<{ links: LinkJson[]; meta: LinksListMeta }> {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.link_type) search.set('link_type', params.link_type);
  if (params.campaign_id) search.set('campaign_id', params.campaign_id);
  if (params.page) search.set('page', String(params.page));
  if (params.per_page) search.set('per_page', String(params.per_page));
  const query = search.toString();
  return apiRequest<{ links: LinkJson[]; meta: LinksListMeta }>(`/api/v1/links${query ? `?${query}` : ''}`);
}

export async function getLink(id: string): Promise<LinkJson> {
  const data = await apiRequest<{ link: LinkJson }>(`/api/v1/links/${id}`);
  return data.link;
}

export async function getLinkClicks(
  id: string,
  page = 1,
  perPage = 25
): Promise<{ clicks: ClickEventJson[]; meta: LinksListMeta }> {
  return apiRequest<{ clicks: ClickEventJson[]; meta: LinksListMeta }>(
    `/api/v1/links/${id}/clicks?page=${page}&per_page=${perPage}`
  );
}

export async function createLink(payload: LinkPayload): Promise<LinkJson> {
  const data = await apiRequest<{ link: LinkJson }>('/api/v1/links', {
    method: 'POST',
    body: JSON.stringify({ link: payload }),
  });
  return data.link;
}

export async function updateLink(id: string, payload: LinkPayload): Promise<LinkJson> {
  const data = await apiRequest<{ link: LinkJson }>(`/api/v1/links/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ link: payload }),
  });
  return data.link;
}

export async function deleteLink(id: string): Promise<void> {
  await apiRequest(`/api/v1/links/${id}`, { method: 'DELETE' });
}

export function shortLinkHost(): string {
  return (import.meta.env.VITE_SHORT_LINK_HOST as string | undefined) || 'links.blackcollar.io';
}

export function displayShortUrl(link: LinkJson): string {
  return link.fullShortUrl || `https://${link.shortUrl}`;
}
