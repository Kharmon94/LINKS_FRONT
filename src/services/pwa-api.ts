import { apiRequest } from '@/services/api';
import type { User } from '@/types';

export async function confirmPwaInstall() {
  return apiRequest<{ user: User }>('/api/v1/pwa/confirm_install', {
    method: 'POST',
  });
}
