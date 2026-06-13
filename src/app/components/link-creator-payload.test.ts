import { describe, expect, it } from 'vitest';
import { buildLinkCustomizePayload } from './link-creator-payload';

const baseInput = {
  showCustomSlug: false,
  selectedCampaignId: '',
  selectedDomainId: 'domain-123',
  customSlug: 'my-slug',
  utmSource: 'newsletter',
  utmMedium: 'email',
  utmCampaign: 'spring',
  utmTerm: 'term',
  utmContent: 'content',
};

describe('buildLinkCustomizePayload', () => {
  it('omits customize fields when Customize is closed', () => {
    const payload = buildLinkCustomizePayload(baseInput);
    expect(payload).toEqual({});
  });

  it('includes custom_domain_id only when Customize is open and domain selected', () => {
    const payload = buildLinkCustomizePayload({
      ...baseInput,
      showCustomSlug: true,
    });
    expect(payload).toEqual({
      custom_domain_id: 'domain-123',
      short_code: 'my-slug',
      utm_source: 'newsletter',
      utm_medium: 'email',
      utm_campaign: 'spring',
      utm_term: 'term',
      utm_content: 'content',
    });
  });

  it('omits custom_domain_id when platform domain is selected', () => {
    const payload = buildLinkCustomizePayload({
      ...baseInput,
      showCustomSlug: true,
      selectedDomainId: '',
    });
    expect(payload).not.toHaveProperty('custom_domain_id');
    expect(payload.short_code).toBe('my-slug');
  });

  it('omits custom_domain_id when Customize is closed even with pre-selected domain', () => {
    const payload = buildLinkCustomizePayload({
      ...baseInput,
      showCustomSlug: false,
      selectedDomainId: 'default-domain-id',
    });
    expect(payload).not.toHaveProperty('custom_domain_id');
    expect(payload).toEqual({});
  });

  it('keeps campaign_id outside customize gating', () => {
    const payload = buildLinkCustomizePayload({
      ...baseInput,
      selectedCampaignId: 'campaign-1',
    });
    expect(payload).toEqual({ campaign_id: 'campaign-1' });
  });

  it('drops stale customize fields after Customize is closed', () => {
    const payload = buildLinkCustomizePayload({
      ...baseInput,
      showCustomSlug: false,
      selectedDomainId: 'domain-123',
      customSlug: 'stale-slug',
      utmSource: 'stale',
    });
    expect(payload).toEqual({});
  });
});
