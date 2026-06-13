import { apiRequest } from './api';
import type { LinkJson, ClickEventJson } from '@/types';

export type { ClickEventJson };

export type AnalyticsPeriod = '7D' | '30D' | '90D' | '1Y' | 'ALL';

export interface ChartPoint {
  date: string;
  clicks: number;
}

export interface DeviceBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface LocationItem {
  city: string;
  country?: string;
  clicks: number;
}

export interface ReferrerItem {
  source: string;
  clicks: number;
}

export interface PoolBreakdownItem {
  poolEntryId: string;
  url: string;
  weight: number;
  clicks: number;
  percentage: number;
}

export interface QuickStats {
  last7Days: number;
  last30Days: number;
  allTime: number;
  totalLinks: number;
  avgDailyClicks: number;
  peakDay: number;
  countries?: number;
  activeDays?: number;
  createdAt?: string;
}

export interface OverviewAnalytics {
  totalClicks: number;
  totalLinks: number;
  totalCampaigns: number;
  clickGrowth: number;
  topLinks: { shortUrl: string; clicks: number; percentage: number }[];
  topCampaigns: { campaign: string; clicks: number; percentage: number }[];
  topWorkspaces: { name: string; clicks: number; percentage: number }[];
  recentClicks?: ClickEventJson[];
  clicksOverTime?: Record<AnalyticsPeriod, ChartPoint[]>;
  deviceBreakdown?: DeviceBreakdownItem[];
}

export interface EntityAnalytics {
  totalClicks: number;
  quickStats: QuickStats;
  clicksOverTime: Record<AnalyticsPeriod, ChartPoint[]>;
  deviceBreakdown: DeviceBreakdownItem[];
  topLocations: LocationItem[];
  referrerBreakdown?: ReferrerItem[];
  recentClicks?: ClickEventJson[];
  poolBreakdown?: PoolBreakdownItem[];
  link?: LinkJson;
  campaign?: { id: string; name: string; description: string };
}

export async function getAnalyticsOverview(): Promise<OverviewAnalytics> {
  const data = await apiRequest<{ analytics: OverviewAnalytics }>('/api/v1/analytics/overview');
  return data.analytics;
}

export async function getLinkAnalytics(linkId: string): Promise<EntityAnalytics> {
  const data = await apiRequest<{ analytics: EntityAnalytics }>(`/api/v1/links/${linkId}/analytics`);
  return data.analytics;
}

export async function getCampaignAnalytics(campaignId: string): Promise<EntityAnalytics> {
  const data = await apiRequest<{ analytics: EntityAnalytics }>(
    `/api/v1/campaigns/${campaignId}/analytics`
  );
  return data.analytics;
}
