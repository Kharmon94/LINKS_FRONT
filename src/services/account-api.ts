import { apiRequest } from '@/services/api';
import type { User } from '@/types';

export interface NotificationPreferences {
  email_notifications: boolean;
  weekly_reports: boolean;
  marketing_emails: boolean;
  link_alerts: boolean;
}

export async function updateAccount(data: { name: string }) {
  return apiRequest<{ user: User }>('/api/v1/account', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function updatePassword(data: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) {
  return apiRequest<{ user: User }>('/api/v1/account/password', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function fetchNotificationPreferences() {
  return apiRequest<{ notificationPreferences: NotificationPreferences }>(
    '/api/v1/account/notification_preferences'
  );
}

export async function updateNotificationPreferences(prefs: Partial<NotificationPreferences>) {
  return apiRequest<{ notificationPreferences: NotificationPreferences }>(
    '/api/v1/account/notification_preferences',
    {
      method: 'PATCH',
      body: JSON.stringify({ notification_preferences: prefs }),
    }
  );
}

export async function setActiveWorkspace(workspaceId: string) {
  return apiRequest<{ user: User }>('/api/v1/account/active_workspace', {
    method: 'PATCH',
    body: JSON.stringify({ workspace_id: workspaceId }),
  });
}

export async function signInWithPassword(email: string, password: string) {
  return apiRequest<{ user: User; token: string }>('/api/v1/auth/sign_in', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
