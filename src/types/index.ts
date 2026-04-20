export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'enterprise';
export type UserRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: SubscriptionTier;
  role: UserRole;
  admin?: boolean;
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
