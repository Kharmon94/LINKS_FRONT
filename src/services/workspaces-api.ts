import { apiRequest } from './api';
import type { TeamMemberJson } from './team-api';

export interface WorkspaceJson {
  id: string;
  name: string;
  description: string;
  linksCount: number;
  campaignsCount: number;
  createdAt: string;
  members?: TeamMemberJson[];
}

export async function listWorkspaces(): Promise<WorkspaceJson[]> {
  const data = await apiRequest<{ workspaces: WorkspaceJson[] }>('/api/v1/workspaces');
  return data.workspaces;
}

export async function getWorkspace(id: string): Promise<WorkspaceJson> {
  const data = await apiRequest<{ workspace: WorkspaceJson }>(`/api/v1/workspaces/${id}`);
  return data.workspace;
}

export async function createWorkspace(payload: {
  name: string;
  description?: string;
}): Promise<WorkspaceJson> {
  const data = await apiRequest<{ workspace: WorkspaceJson }>('/api/v1/workspaces', {
    method: 'POST',
    body: JSON.stringify({ workspace: payload }),
  });
  return data.workspace;
}

export async function updateWorkspace(
  id: string,
  payload: { name?: string; description?: string }
): Promise<WorkspaceJson> {
  const data = await apiRequest<{ workspace: WorkspaceJson }>(`/api/v1/workspaces/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ workspace: payload }),
  });
  return data.workspace;
}

export async function deleteWorkspace(id: string): Promise<void> {
  await apiRequest(`/api/v1/workspaces/${id}`, { method: 'DELETE' });
}

export async function addWorkspaceMember(workspaceId: string, userId: string): Promise<WorkspaceJson> {
  const data = await apiRequest<{ workspace: WorkspaceJson }>(
    `/api/v1/workspaces/${workspaceId}/members`,
    {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }
  );
  return data.workspace;
}

export async function removeWorkspaceMember(workspaceId: string, userId: string): Promise<WorkspaceJson> {
  const data = await apiRequest<{ workspace: WorkspaceJson }>(
    `/api/v1/workspaces/${workspaceId}/members/${userId}`,
    { method: 'DELETE' }
  );
  return data.workspace;
}
