import { apiRequest } from '@/services/api';
import type { User } from '@/types';

export async function confirmPwaInstall() {
  return apiRequest<{ user: User }>('/api/v1/pwa/confirm_install', {
    method: 'POST',
  });
}

export async function resetPwaInstall() {
  return apiRequest<{ user: User }>('/api/v1/pwa/reset_install', {
    method: 'POST',
  });
}
