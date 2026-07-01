import { describe, expect, it } from 'vitest';
import {
  adminLinkPath,
  adminLinksForUserPath,
  adminTeamPath,
  adminUserPath,
  campaignAddLinksPath,
  campaignEditPath,
  campaignPath,
  linkEditPath,
  linkPath,
  teamMemberPath,
  workspacePath,
} from './resource-paths';

describe('resource-paths', () => {
  const publicId = 'k7x2m9q4a1b2';

  it('builds app resource paths from publicId', () => {
    expect(linkPath({ publicId })).toBe(`/links/${publicId}`);
    expect(linkEditPath({ publicId })).toBe(`/links/${publicId}/edit`);
    expect(campaignPath({ publicId })).toBe(`/campaigns/${publicId}`);
    expect(campaignEditPath({ publicId })).toBe(`/campaigns/${publicId}/edit`);
    expect(campaignAddLinksPath({ publicId })).toBe(`/campaigns/${publicId}/add-links`);
    expect(workspacePath({ publicId })).toBe(`/workspaces/${publicId}`);
    expect(teamMemberPath({ publicId })).toBe(`/team/${publicId}`);
  });

  it('builds admin resource paths from publicId', () => {
    expect(adminUserPath({ publicId })).toBe(`/admin/users/${publicId}`);
    expect(adminLinkPath({ publicId })).toBe(`/admin/links/${publicId}`);
    expect(adminTeamPath({ publicId })).toBe(`/admin/teams/${publicId}`);
    expect(adminLinksForUserPath({ publicId })).toBe(`/admin/links?user_id=${publicId}`);
  });
});
