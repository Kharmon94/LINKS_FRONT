import type { LinkPayload } from '@/services/links-api';

export interface LinkCustomizeState {
  showCustomSlug: boolean;
  selectedDomainId: string;
  selectedCampaignId: string;
  customSlug: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
}

/** Customize fields sent on link create — campaign is always optional; slug/domain/UTM only when Customize is open. */
export function buildLinkCustomizePayload(state: LinkCustomizeState): Partial<LinkPayload> {
  const {
    showCustomSlug,
    selectedDomainId,
    selectedCampaignId,
    customSlug,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
  } = state;

  return {
    ...(selectedCampaignId ? { campaign_id: selectedCampaignId } : {}),
    ...(showCustomSlug && selectedDomainId ? { custom_domain_id: selectedDomainId } : {}),
    ...(showCustomSlug && customSlug.trim() ? { short_code: customSlug.trim() } : {}),
    ...(showCustomSlug && utmSource.trim() ? { utm_source: utmSource.trim() } : {}),
    ...(showCustomSlug && utmMedium.trim() ? { utm_medium: utmMedium.trim() } : {}),
    ...(showCustomSlug && utmCampaign.trim() ? { utm_campaign: utmCampaign.trim() } : {}),
    ...(showCustomSlug && utmTerm.trim() ? { utm_term: utmTerm.trim() } : {}),
    ...(showCustomSlug && utmContent.trim() ? { utm_content: utmContent.trim() } : {}),
  };
}
