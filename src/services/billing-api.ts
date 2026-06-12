import { apiRequest } from '@/services/api';

export interface PlanTier {
  id?: number;
  name: string;
  tier: string;
  stripePriceIdMonthly?: string | null;
  stripePriceIdYearly?: string | null;
  prices?: { monthly: number; yearly: number } | null;
  features?: string[];
  checkout?: boolean;
  salesLed?: boolean;
}

export interface PlansResponse {
  plans: PlanTier[];
  tiers: PlanTier[];
}

export async function fetchPlans() {
  return apiRequest<PlansResponse>('/api/v1/plans');
}

export async function createCheckoutSession(priceId: string) {
  return apiRequest<{ url: string }>('/api/v1/checkout/create_session', {
    method: 'POST',
    body: JSON.stringify({ price_id: priceId }),
  });
}

export async function createPortalSession() {
  return apiRequest<{ url: string }>('/api/v1/portal/create_session', {
    method: 'POST',
  });
}
