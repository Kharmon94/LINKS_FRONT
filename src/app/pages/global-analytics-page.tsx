import { AppLayout } from '../components/app-layout';
import { BarChart3, TrendingUp, Users, FolderKanban, Briefcase } from 'lucide-react';

export function GlobalAnalyticsPage() {
  // Mock data - replace with API call to Rails backend
  const stats = {
    totalClicks: 12450,
    totalLinks: 45,
    totalCampaigns: 8,
    clickGrowth: 12.5,
  };

  const topLinks = [
    { shortUrl: 'blackcollar.io/spring24', clicks: 2891, percentage: 23 },
    { shortUrl: 'blackcollar.io/abc123', clicks: 1247, percentage: 10 },
    { shortUrl: 'blackcollar.io/promo', clicks: 1120, percentage: 9 },
  ];

  const topCampaigns = [
    { campaign: 'Spring Sale 2026', clicks: 5420, percentage: 43 },
    { campaign: 'Product Launch', clicks: 2150, percentage: 17 },
    { campaign: 'Holiday Promo', clicks: 1890, percentage: 15 },
  ];

  const topWorkspaces = [
    { name: 'Marketing Team', clicks: 6840, percentage: 55 },
    { name: 'Sales Team', clicks: 3210, percentage: 26 },
    { name: 'Product Team', clicks: 2400, percentage: 19 },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative mx-[0px] mt-[20px] mb-[0px]">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 py-6 relative">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl mb-2 text-center">Global Analytics</h1>
            <p className="text-sm text-muted-foreground text-center">
              Track performance across all your links and campaigns
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total Clicks</p>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.totalClicks.toLocaleString()}</p>
              <p className="text-xs text-green-500 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{stats.clickGrowth}% this week
              </p>
            </div>

            <div className="bg-card rounded-lg p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Total Links</p>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.totalLinks}</p>
              <p className="text-xs text-muted-foreground">Active links</p>
            </div>

            <div className="bg-card rounded-lg p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Campaigns</p>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.totalCampaigns}</p>
              <p className="text-xs text-muted-foreground">Active campaigns</p>
            </div>

            <div className="bg-card rounded-lg p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Avg. Clicks</p>
              </div>
              <p className="text-3xl font-bold mb-1">
                {Math.round(stats.totalClicks / stats.totalLinks)}
              </p>
              <p className="text-xs text-muted-foreground">Per link</p>
            </div>
          </div>

          {/* Charts and Data */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Top Links */}
            <div className="bg-card rounded-lg p-5 shadow-lg">
              <h2 className="mb-4 text-[28px] text-center">Top Links</h2>
              <div className="space-y-4">
                {topLinks.map((link, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate flex-1 mr-4">
                        {link.shortUrl}
                      </span>
                      <span className="text-sm font-bold">
                        {link.clicks.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${link.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Campaigns */}
            <div className="bg-card rounded-lg p-5 shadow-lg">
              <h2 className="mb-4 text-[28px] text-center">Top Campaigns</h2>
              <div className="space-y-4">
                {topCampaigns.map((campaign, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 mr-4">
                        <FolderKanban className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{campaign.campaign}</span>
                      </div>
                      <span className="text-sm font-bold">
                        {campaign.clicks.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${campaign.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Workspaces */}
            <div className="bg-card rounded-lg p-5 shadow-lg">
              <h2 className="mb-4 text-[28px] text-center">Top Workspaces</h2>
              <div className="space-y-4">
                {topWorkspaces.map((workspace, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 mr-4">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{workspace.name}</span>
                      </div>
                      <span className="text-sm font-bold">
                        {workspace.clicks.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${workspace.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-lg p-5 shadow-lg">
            <h2 className="mb-4 text-[28px] text-center">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { time: '2 minutes ago', event: 'Link clicked: blackcollar.io/spring24', clicks: 1 },
                { time: '15 minutes ago', event: 'Link clicked: blackcollar.io/abc123', clicks: 3 },
                { time: '1 hour ago', event: 'New campaign created: Product Launch', clicks: 0 },
                { time: '3 hours ago', event: 'Link clicked: blackcollar.io/promo', clicks: 5 },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between gap-4 pb-3 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{activity.event}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  {activity.clicks > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      +{activity.clicks} {activity.clicks === 1 ? 'click' : 'clicks'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}