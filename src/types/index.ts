export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'pro' | 'enterprise';
export type UserRole = 'owner' | 'admin' | 'member';

export interface ResourcePermissions {
  read: boolean;
  create: boolean;
  update: boolean;
  destroy: boolean;
}

export interface TeamPermissions {
  read: boolean;
  invite: boolean;
  manage: boolean;
  removeMember?: boolean;
}

export interface SettingsPermissions {
  billing: boolean;
  portal?: boolean;
  domains: boolean;
}

export interface AdminPermissions {
  users: boolean;
  links: boolean;
}

export interface UserPermissions {
  platformAdmin: boolean;
  links: Pick<ResourcePermissions, 'read' | 'create' | 'update' | 'destroy'>;
  campaigns: ResourcePermissions;
  team: TeamPermissions;
  workspaces: ResourcePermissions;
  settings: SettingsPermissions;
  analytics: { read: boolean };
  admin: AdminPermissions;
}

export interface ResourceLimits {
  used: number;
  max: number | null;
}

export interface UserLimits {
  links: ResourceLimits;
  campaigns: ResourceLimits;
  domains: ResourceLimits;
}

export interface User {
  id: string;
  publicId: string;
  email: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  role: UserRole;
  admin?: boolean;
  activeWorkspaceId?: string | null;
  pwaInstalledAt?: string | null;
  permissions?: UserPermissions;
  limits?: UserLimits;
}

export interface AdminUser extends User {
  linksCount: number;
  createdAt: string;
  provider?: string | null;
  stripeCustomerId?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  membershipRole?: UserRole | null;
  recentLinks?: AdminRecentLink[];
}

export interface AdminTeam {
  id: string;
  publicId: string;
  name: string;
  personal: boolean;
  memberCount: number;
  workspaceCount: number;
  ownerEmail?: string | null;
  createdAt: string;
  members?: AdminTeamMember[];
  invitations?: AdminTeamInvitation[];
  workspaces?: AdminTeamWorkspace[];
}

export interface AdminTeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
}

export interface AdminTeamInvitation {
  id: string;
  email: string;
  role: UserRole;
  expiresAt: string;
  invitedAt: string;
}

export interface AdminTeamWorkspace {
  id: string;
  publicId: string;
  name: string;
  description: string;
  linksCount: number;
  createdAt: string;
}

export interface AdminRecentLink {
  id: string;
  publicId: string;
  name: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
}

export interface AdminLink extends LinkJson {
  userId: string;
  userEmail: string;
}

export interface FeatureFlagJson {
  key: string;
  enabled: boolean;
  description: string;
  category: string;
  updatedAt: string;
}

export interface UserFeatureFlagJson {
  key: string;
  globalEnabled: boolean;
  override: boolean | null;
  effectiveEnabled: boolean;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  q?: string;
  role?: string;
  userId?: string;
}

export interface AdminDashboardStats {
  usersCount: number;
  linksCount: number;
  linksCreatedLast7Days: number;
  usersByTier: Record<SubscriptionTier, number>;
  usersByRole: Record<UserRole, number>;
  adminUsersCount: number;
}

export interface AdminBillingOverview {
  mrrCents: number;
  mrrFormatted: string;
  mrrSource?: 'stripe' | 'fallback';
  stripeMode?: 'test' | 'live';
  subscribersByTier: Record<SubscriptionTier, number>;
  paidSubscribers: number;
  stripeLinkedUsers: number;
  recentEvents: AdminBillingEvent[];
}

export interface StripeModeReadiness {
  secretKey: boolean;
  publishableKey: boolean;
  webhookSecret: boolean;
  proMonthlyPriceEnv: boolean;
  proYearlyPriceEnv: boolean;
  ready: boolean;
  proPlanPrices: boolean;
}

export interface AdminStripeMode {
  live: boolean;
  source: 'database' | 'env';
  testConfigured: boolean;
  liveConfigured: boolean;
  testPublishableConfigured: boolean;
  livePublishableConfigured: boolean;
  publishableKey?: string | null;
  currentModeReady?: boolean;
  readiness?: {
    currentModeReady: boolean;
    test: StripeModeReadiness;
    live: StripeModeReadiness;
  };
}

export interface AdminBillingEvent {
  id: string;
  userId: string;
  email: string;
  eventType: string;
  tier: SubscriptionTier;
  amountCents?: number | null;
  amountFormatted?: string | null;
  stripeCustomerId?: string | null;
  createdAt: string;
}

export interface AdminBillingUserLookup {
  id: string;
  publicId: string;
  email: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  stripeCustomerId?: string | null;
  hasStripeCustomer?: boolean;
  subscriptionStatus?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

export interface AdminHealthStatus {
  database: { ok: boolean; latencyMs: number | null };
  redis: { ok: boolean; skipped?: boolean; latencyMs?: number | null };
  stripe: {
    configured: boolean;
    mode?: 'test' | 'live';
    testConfigured?: boolean;
    liveConfigured?: boolean;
  };
  version: string | null;
  migrationVersion?: number;
}

export interface AdminCampaignRow {
  id: string;
  publicId: string;
  name: string;
  userId: string;
  userEmail: string;
  linksCount: number;
  createdAt: string;
}

export interface AdminWorkspaceRow {
  id: string;
  publicId: string;
  name: string;
  teamId: string;
  teamName: string;
  linksCount: number;
  createdAt: string;
}

export interface AdminCustomDomainRow {
  id: string;
  domain: string;
  status: string;
  userId: string;
  userEmail: string;
  isDefault: boolean;
  createdAt: string;
}

export interface AdminPushSubscriptionRow {
  id: string;
  userId: string;
  userEmail: string;
  endpointPreview: string;
  createdAt: string;
}

export interface PlanJson {
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

export interface LinkCampaign {
  id: string;
  publicId: string;
  name: string;
}

export interface LinkJson {
  id: string;
  publicId: string;
  name: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  fullShortUrl?: string;
  clicks: number;
  createdAt: string;
  linkType?: 'single' | 'randomizer';
  campaign?: LinkCampaign | null;
  campaignId?: string | null;
  customDomainId?: string | null;
  isRandomizer?: boolean;
  poolEntries?: { id: string; url: string; weight: number; position: number }[];
  utmParams?: {
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    term?: string | null;
    content?: string | null;
  };
  pushAlertsEnabled?: boolean;
  emailAlertsEnabled?: boolean;
}

export interface ClickEventJson {
  id: string;
  timestamp: string;
  linkId?: string;
  linkName?: string;
  shortUrl?: string;
  country?: string | null;
  city?: string | null;
  device?: string | null;
  browser?: string | null;
  referrer?: string | null;
  destinationUrl?: string | null;
  poolEntryId?: string | null;
}

export interface LinksListMeta {
  page: number;
  perPage: number;
  total: number;
  q?: string;
  linkType?: string;
  campaignId?: string;
  workspaceId?: string;
}

export interface CampaignJson {
  id: string;
  publicId: string;
  name: string;
  description: string;
  linksCount: number;
  totalClicks: number;
  createdAt: string;
  links?: LinkJson[];
  workspaceId?: string | null;
}
