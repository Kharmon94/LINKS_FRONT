import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, 
  Plus, 
  Copy, 
  BarChart3,
  TrendingUp,
  MousePointerClick,
  Globe,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function CampaignDetailPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'7D' | '30D' | '90D' | '1Y' | 'ALL'>('7D');

  // Collapsible sections state
  const [isQuickStatsOpen, setIsQuickStatsOpen] = useState(true);
  const [isRecentClicksOpen, setIsRecentClicksOpen] = useState(true);
  const [isCampaignLinksOpen, setIsCampaignLinksOpen] = useState(true);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);

  // Mock data - replace with API call to Rails backend
  const campaign = {
    id: campaignId,
    name: 'Spring Sale 2026',
    description: 'Marketing campaign for spring promotion',
    createdAt: '2026-02-01',
  };

  const links = [
    {
      id: '1',
      name: 'Spring Homepage',
      shortUrl: 'blackcollar.io/spring-home',
      originalUrl: 'https://example.com/spring-sale/homepage',
      clicks: 2450,
    },
    {
      id: '2',
      name: '',
      shortUrl: 'blackcollar.io/spring-promo',
      originalUrl: 'https://example.com/spring-sale/promo',
      clicks: 1820,
    },
  ];

  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);

  // Mock analytics data for different time periods
  const allClicksData = {
    '7D': [
      { date: 'Mar 4', clicks: 145 },
      { date: 'Mar 5', clicks: 189 },
      { date: 'Mar 6', clicks: 220 },
      { date: 'Mar 7', clicks: 195 },
      { date: 'Mar 8', clicks: 245 },
      { date: 'Mar 9', clicks: 278 },
      { date: 'Mar 10', clicks: 303 },
    ],
    '30D': [
      { date: 'Feb 9', clicks: 105 },
      { date: 'Feb 12', clicks: 127 },
      { date: 'Feb 15', clicks: 149 },
      { date: 'Feb 18', clicks: 172 },
      { date: 'Feb 21', clicks: 195 },
      { date: 'Feb 24', clicks: 214 },
      { date: 'Feb 27', clicks: 236 },
      { date: 'Mar 2', clicks: 255 },
      { date: 'Mar 5', clicks: 278 },
      { date: 'Mar 8', clicks: 303 },
    ],
    '90D': [
      { date: 'Dec 12', clicks: 32 },
      { date: 'Dec 25', clicks: 58 },
      { date: 'Jan 7', clicks: 85 },
      { date: 'Jan 20', clicks: 117 },
      { date: 'Feb 2', clicks: 149 },
      { date: 'Feb 15', clicks: 182 },
      { date: 'Feb 28', clicks: 225 },
      { date: 'Mar 10', clicks: 303 },
    ],
    '1Y': [
      { date: 'Mar', clicks: 434 },
      { date: 'Apr', clicks: 656 },
      { date: 'May', clicks: 878 },
      { date: 'Jun', clicks: 743 },
      { date: 'Jul', clicks: 989 },
      { date: 'Aug', clicks: 1101 },
      { date: 'Sep', clicks: 1034 },
      { date: 'Oct', clicks: 1256 },
      { date: 'Nov', clicks: 1423 },
      { date: 'Dec', clicks: 1656 },
      { date: 'Jan', clicks: 1878 },
      { date: 'Feb', clicks: 2090 },
    ],
    'ALL': [
      { date: 'Q1 25', clicks: 2234 },
      { date: 'Q2 25', clicks: 2678 },
      { date: 'Q3 25', clicks: 3345 },
      { date: 'Q4 25', clicks: 3890 },
      { date: 'Q1 26', clicks: 4447 },
    ],
  };

  const clicksOverTime = allClicksData[selectedTimePeriod];

  const deviceData = [
    { name: 'Mobile', value: 1258, color: '#4285F4' },
    { name: 'Desktop', value: 812, color: '#34A853' },
    { name: 'Tablet', value: 377, color: '#FBBC05' },
  ];

  const locationData = [
    { city: 'New York', clicks: 825 },
    { city: 'London', clicks: 612 },
    { city: 'Toronto', clicks: 398 },
    { city: 'Berlin', clicks: 345 },
    { city: 'Sydney', clicks: 267 },
  ];

  // Mock recent clicks across all campaign links
  const recentClicks = [
    {
      id: '1',
      timestamp: '2026-02-28T14:32:15Z',
      linkName: 'spring-home',
      shortUrl: 'blackcollar.io/spring-home',
      country: 'United States',
      city: 'New York',
      device: 'Mobile',
      browser: 'Chrome',
      referrer: 'https://twitter.com'
    },
    {
      id: '2',
      timestamp: '2026-02-28T14:28:43Z',
      linkName: 'spring-promo',
      shortUrl: 'blackcollar.io/spring-promo',
      country: 'United Kingdom',
      city: 'London',
      device: 'Desktop',
      browser: 'Safari',
      referrer: 'https://facebook.com'
    },
    {
      id: '3',
      timestamp: '2026-02-28T14:15:22Z',
      linkName: 'spring-home',
      shortUrl: 'blackcollar.io/spring-home',
      country: 'Canada',
      city: 'Toronto',
      device: 'Mobile',
      browser: 'Firefox',
      referrer: 'Direct'
    },
    {
      id: '4',
      timestamp: '2026-02-28T13:58:11Z',
      linkName: 'spring-promo',
      shortUrl: 'blackcollar.io/spring-promo',
      country: 'Germany',
      city: 'Berlin',
      device: 'Desktop',
      browser: 'Chrome',
      referrer: 'https://google.com'
    },
    {
      id: '5',
      timestamp: '2026-02-28T13:45:09Z',
      linkName: 'spring-home',
      shortUrl: 'blackcollar.io/spring-home',
      country: 'Australia',
      city: 'Sydney',
      device: 'Tablet',
      browser: 'Safari',
      referrer: 'https://linkedin.com'
    },
    {
      id: '6',
      timestamp: '2026-02-28T13:32:56Z',
      linkName: 'spring-promo',
      shortUrl: 'blackcollar.io/spring-promo',
      country: 'United States',
      city: 'Los Angeles',
      device: 'Mobile',
      browser: 'Chrome',
      referrer: 'https://instagram.com'
    },
    {
      id: '7',
      timestamp: '2026-02-28T13:21:34Z',
      linkName: 'spring-home',
      shortUrl: 'blackcollar.io/spring-home',
      country: 'United Kingdom',
      city: 'Manchester',
      device: 'Desktop',
      browser: 'Edge',
      referrer: 'Direct'
    },
    {
      id: '8',
      timestamp: '2026-02-28T13:08:17Z',
      linkName: 'spring-promo',
      shortUrl: 'blackcollar.io/spring-promo',
      country: 'France',
      city: 'Paris',
      device: 'Mobile',
      browser: 'Chrome',
      referrer: 'https://youtube.com'
    },
    {
      id: '9',
      timestamp: '2026-02-28T12:55:42Z',
      linkName: 'spring-home',
      shortUrl: 'blackcollar.io/spring-home',
      country: 'Japan',
      city: 'Tokyo',
      device: 'Desktop',
      browser: 'Chrome',
      referrer: 'https://reddit.com'
    },
    {
      id: '10',
      timestamp: '2026-02-28T12:43:28Z',
      linkName: 'spring-promo',
      shortUrl: 'blackcollar.io/spring-promo',
      country: 'Spain',
      city: 'Madrid',
      device: 'Mobile',
      browser: 'Safari',
      referrer: 'https://twitter.com'
    },
  ];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        {/* Subtle background pattern for glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 py-8 relative">
          {/* Header */}
          <Button
            variant="ghost"
            onClick={() => navigate('/campaigns')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="mb-2 text-center md:text-left text-[32px]">{campaign.name}</h1>
              <p className="text-muted-foreground">{campaign.description}</p>
            </div>
            <Button 
              onClick={() => navigate(`/campaigns/${campaignId}/edit`)}
              className="mx-auto md:ml-auto md:mr-0 md:shrink-0 rounded-full h-11 px-6"
            >
              Edit Campaign
            </Button>
          </div>

          <div className="space-y-6">
            {/* Quick Stats - Full width, horizontal on desktop */}
            <div className="bg-card/50 backdrop-blur-md rounded-lg shadow-lg">
              <button
                onClick={() => setIsQuickStatsOpen(!isQuickStatsOpen)}
                className="w-full p-6 flex items-center justify-between hover:bg-muted/10 transition-colors"
              >
                <h2 className="text-2xl">Quick Stats</h2>
                {isQuickStatsOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              
              {isQuickStatsOpen && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Last 7 Days</p>
                      <p className="text-2xl font-bold">1,575</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Last 30 Days</p>
                      <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">All Time</p>
                      <p className="text-2xl font-bold">5,847</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Links</p>
                      <p className="text-2xl font-bold">{links.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Avg. Daily Clicks</p>
                      <p className="text-2xl font-bold">223</p>
                    </div>
                    <div className="md:col-span-3 lg:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Created</p>
                          <p className="font-medium">
                            {new Date(campaign.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Clicks */}
            <div className="bg-card/50 backdrop-blur-md rounded-lg shadow-lg">
              <button
                onClick={() => setIsRecentClicksOpen(!isRecentClicksOpen)}
                className="w-full p-6 flex items-center justify-between hover:bg-muted/10 transition-colors"
              >
                <h2 className="text-2xl">Recent Clicks</h2>
                {isRecentClicksOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              
              {isRecentClicksOpen && (
                <div className="px-6 pb-6">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <div className="min-w-full space-y-2">
                      {/* Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/30 rounded-lg text-xs font-medium text-muted-foreground">
                        <div className="col-span-3">Time</div>
                        <div className="col-span-3">Link</div>
                        <div className="col-span-2">Location</div>
                        <div className="col-span-2">Device</div>
                        <div className="col-span-2">Referrer</div>
                      </div>
                      
                      {/* Rows */}
                      {recentClicks.map(click => (
                        <div 
                          key={click.id} 
                          className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <div className="col-span-3 flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span>{formatTimestamp(click.timestamp)}</span>
                          </div>
                          <div className="col-span-3 text-sm">
                            <div className="font-medium font-mono">{click.linkName}</div>
                            <div className="text-xs text-muted-foreground truncate">{click.shortUrl}</div>
                          </div>
                          <div className="col-span-2 text-sm">
                            <div className="font-medium">{click.city}</div>
                            <div className="text-xs text-muted-foreground">{click.country}</div>
                          </div>
                          <div className="col-span-2 text-sm">
                            <div className="font-medium">{click.device}</div>
                            <div className="text-xs text-muted-foreground">{click.browser}</div>
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground truncate">
                            {click.referrer === 'Direct' ? 'Direct' : new URL(click.referrer).hostname.replace('www.', '')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {recentClicks.map(click => (
                      <div 
                        key={click.id} 
                        className="bg-muted/20 rounded-lg p-4 space-y-2 border border-border/30"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-xs">{formatTimestamp(click.timestamp)}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="col-span-2">
                            <div className="text-xs text-muted-foreground mb-1">Link</div>
                            <div className="font-medium font-mono">{click.linkName}</div>
                            <div className="text-xs text-muted-foreground truncate">{click.shortUrl}</div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Location</div>
                            <div className="font-medium">{click.city}</div>
                            <div className="text-xs text-muted-foreground">{click.country}</div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Device</div>
                            <div className="font-medium">{click.device}</div>
                            <div className="text-xs text-muted-foreground">{click.browser}</div>
                          </div>
                          
                          <div className="col-span-2">
                            <div className="text-xs text-muted-foreground mb-1">Referrer</div>
                            <div className="font-medium text-xs truncate">
                              {click.referrer === 'Direct' ? 'Direct' : new URL(click.referrer).hostname.replace('www.', '')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Campaign Links Section */}
            <div className="bg-card/50 backdrop-blur-md rounded-lg shadow-lg">
              <button
                onClick={() => setIsCampaignLinksOpen(!isCampaignLinksOpen)}
                className="w-full p-6 flex items-center justify-between hover:bg-muted/10 transition-colors"
              >
                <h2 className="text-2xl">Campaign Links</h2>
                {isCampaignLinksOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              
              {isCampaignLinksOpen && (
                <div className="px-6 pb-6">
                  <div className="space-y-3 mb-6">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        onClick={() => navigate(`/analytics/${link.id}`)}
                        className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-4 hover:shadow-xl transition-all cursor-pointer hover:bg-card/60"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {link.name && (
                              <div className="font-semibold mb-1 truncate">
                                {link.name}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`truncate ${link.name ? 'text-sm text-muted-foreground' : 'font-medium'}`}>
                                {link.shortUrl}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(link.shortUrl);
                                  alert('Copied to clipboard!');
                                }}
                                className="p-1 hover:bg-muted rounded shrink-0"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {link.originalUrl}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-2xl font-light">{link.clicks.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">clicks</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={() => navigate(`/campaigns/${campaignId}/add-links`)}
                      className="rounded-full h-11 px-6"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Links to Campaign
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Analytics Section */}
            <div className="bg-card/50 backdrop-blur-md rounded-lg shadow-lg">
              <button
                onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
                className="w-full p-6 flex items-center justify-between hover:bg-muted/10 transition-colors"
              >
                <h2 className="text-2xl">Analytics</h2>
                {isAnalyticsOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {isAnalyticsOpen && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Clicks Over Time Chart */}
                    <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
                      <div className="flex flex-col mb-4 gap-3">
                        <h3 className="text-lg font-semibold">Clicks Over Time</h3>
                        
                        {/* Time Period Selector */}
                        <div className="flex gap-1 bg-muted/30 rounded-lg p-1">
                          {(['7D', '30D', '90D', '1Y', 'ALL'] as const).map((period) => (
                            <button
                              key={period}
                              onClick={() => setSelectedTimePeriod(period)}
                              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                selectedTimePeriod === period
                                  ? 'bg-black dark:bg-white text-white dark:text-black'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={clicksOverTime} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="date" className="text-xs" stroke="currentColor" />
                          <YAxis 
                            stroke="currentColor"
                            style={{ fontSize: '12px', fontWeight: 500 }}
                            width={45}
                            tickFormatter={(value) => {
                              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                              return value;
                            }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))', 
                              border: '1px solid hsl(var(--border))' 
                            }} 
                          />
                          <Line type="monotone" dataKey="clicks" stroke="#4285F4" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Device Breakdown */}
                    <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={deviceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {deviceData.map((entry) => (
                              <Cell key={`cell-${entry.name}-${entry.value}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Top Locations */}
                    <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6 lg:col-span-2">
                      <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
                      <div className="space-y-3">
                        {locationData.map((location, index) => (
                          <div key={location.city} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 text-sm font-semibold">
                                {index + 1}
                              </div>
                              <span className="font-medium">{location.city}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{location.clicks.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">clicks</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}