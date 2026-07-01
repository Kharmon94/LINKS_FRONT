export interface HasPublicId {
  publicId: string;
}

export const linkPath = (link: HasPublicId) => `/links/${link.publicId}`;

export const linkEditPath = (link: HasPublicId) => `/links/${link.publicId}/edit`;

export const campaignPath = (campaign: HasPublicId) => `/campaigns/${campaign.publicId}`;

export const campaignEditPath = (campaign: HasPublicId) => `/campaigns/${campaign.publicId}/edit`;

export const campaignAddLinksPath = (campaign: HasPublicId) => `/campaigns/${campaign.publicId}/add-links`;

export const workspacePath = (workspace: HasPublicId) => `/workspaces/${workspace.publicId}`;

export const teamMemberPath = (member: HasPublicId) => `/team/${member.publicId}`;

export const adminUserPath = (user: HasPublicId) => `/admin/users/${user.publicId}`;

export const adminLinkPath = (link: HasPublicId) => `/admin/links/${link.publicId}`;

export const adminTeamPath = (team: HasPublicId) => `/admin/teams/${team.publicId}`;

export const adminLinksForUserPath = (user: HasPublicId) =>
  `/admin/links?user_id=${encodeURIComponent(user.publicId)}`;

export const analyticsLinkPath = (link: HasPublicId) => `/analytics/links/${link.publicId}`;

export const isNumericId = (value: string | undefined): boolean =>
  Boolean(value && /^\d+$/.test(value));
