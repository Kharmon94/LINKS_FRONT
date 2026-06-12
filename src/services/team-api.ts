import { apiRequest } from './api';

export interface TeamMemberJson {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface TeamInvitationJson {
  id: string;
  email: string;
  role: string;
  status: string;
  token?: string;
  expiresAt?: string;
}

export interface TeamMemberDetailJson extends TeamMemberJson {
  stats: {
    linksCreated: number;
    totalClicks: number;
    campaigns: number;
    workspaces: string[];
  };
}

export interface MemberClickJson {
  id: string;
  linkName: string;
  shortUrl: string;
  timestamp: string;
  location: string;
}

export async function getTeam(): Promise<{ members: TeamMemberJson[]; invitations: TeamInvitationJson[] }> {
  return apiRequest('/api/v1/team');
}

export async function inviteTeamMember(email: string, role = 'member'): Promise<TeamInvitationJson> {
  const data = await apiRequest<{ invitation: TeamInvitationJson }>('/api/v1/team/invitations', {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
  return data.invitation;
}

export async function getTeamMember(memberId: string): Promise<TeamMemberDetailJson> {
  const data = await apiRequest<{ member: TeamMemberDetailJson }>(`/api/v1/team/members/${memberId}`);
  return data.member;
}

export async function getTeamMemberClicks(memberId: string): Promise<MemberClickJson[]> {
  const data = await apiRequest<{ clicks: MemberClickJson[] }>(`/api/v1/team/members/${memberId}/clicks`);
  return data.clicks;
}

export async function updateTeamMember(
  memberId: string,
  payload: { role?: string }
): Promise<TeamMemberDetailJson> {
  const data = await apiRequest<{ member: TeamMemberDetailJson }>(`/api/v1/team/members/${memberId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data.member;
}

export async function removeTeamMember(memberId: string): Promise<void> {
  await apiRequest(`/api/v1/team/members/${memberId}`, { method: 'DELETE' });
}

export async function previewTeamInvitation(token: string) {
  return apiRequest<{ invitation: TeamInvitationJson & { teamName?: string } }>(
    `/api/v1/team_invitations/${token}`
  );
}

export async function acceptTeamInvitation(token: string) {
  return apiRequest<{ user: import('@/types').User }>(`/api/v1/team_invitations/${token}/accept`, {
    method: 'POST',
  });
}
