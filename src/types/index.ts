export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'enterprise';
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
}

export interface SettingsPermissions {
  billing: boolean;
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
}

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  role: UserRole;
  admin?: boolean;
  permissions?: UserPermissions;
  limits?: UserLimits;
}

export interface AdminUser extends User {
  linksCount: number;
  createdAt: string;
  provider?: string | null;
  stripeCustomerId?: string | null;
  recentLinks?: AdminRecentLink[];
}

export interface AdminRecentLink {
  id: string;
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

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface LinkJson {
  id: string;
  name: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  campaign?: string | null;
  isRandomizer?: boolean;
}
