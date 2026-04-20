import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft,
  Copy,
  ExternalLink,
  Edit,
  MousePointerClick,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function LinkDetailPage() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'7D' | '30D' | '90D' | '1Y' | 'ALL'>('7D');
  
  // Collapsible sections state
  const [isRecentClicksOpen, setIsRecentClicksOpen] = useState(true);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);
  const [isQuickStatsOpen, setIsQuickStatsOpen] = useState(true);

  // Mock data - replace with API call to Rails backend
  const [linkData] = useState({
    id: linkId || '1',
    name: 'Spring Campaign Link',
    originalUrl: 'https://www.example.com/marketing-campaign',
    shortCode: 'spring24',
    shortUrl: 'blackcollar.io/spring24',
    clicks: 2891,
    campaign: 'Spring Campaign',
    createdAt: '2026-02-25',
    isRandomizer: false,
    utmParams: {
      source: 'facebook',
      medium: 'social',
      campaign: 'spring_sale_2026',
      term: '',
      content: 'main_ad'
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleExportQR = () => {
    // TODO: Generate and download QR code
    alert('QR Code export functionality coming soon!');
  };

  const handleExportNFC = () => {
    // TODO: Generate NFC data
    alert('NFC export functionality coming soon!');
  };

  // Mock analytics data for different time periods
  const allClicksData = {
    '7D': [
      { date: 'Mar 4', clicks: 65 },
      { date: 'Mar 5', clicks: 89 },
      { date: 'Mar 6', clicks: 120 },
      { date: 'Mar 7', clicks: 95 },
      { date: 'Mar 8', clicks: 145 },
      { date: 'Mar 9', clicks: 178 },
      { date: 'Mar 10', clicks: 203 },
    ],
    '30D': [
      { date: 'Feb 9', clicks: 45 },
      { date: 'Feb 12', clicks: 67 },
      { date: 'Feb 15', clicks: 89 },
      { date: 'Feb 18', clicks: 102 },
      { date: 'Feb 21', clicks: 125 },
      { date: 'Feb 24', clicks: 134 },
      { date: 'Feb 27', clicks: 156 },
      { date: 'Mar 2', clicks: 145 },
      { date: 'Mar 5', clicks: 178 },
      { date: 'Mar 8', clicks: 203 },
    ],
    '90D': [
      { date: 'Dec 12', clicks: 12 },
      { date: 'Dec 25', clicks: 28 },
      { date: 'Jan 7', clicks: 45 },
      { date: 'Jan 20', clicks: 67 },
      { date: 'Feb 2', clicks: 89 },
      { date: 'Feb 15', clicks: 112 },
      { date: 'Feb 28', clicks: 145 },
      { date: 'Mar 10', clicks: 203 },
    ],
    '1Y': [
      { date: 'Mar', clicks: 234 },
      { date: 'Apr', clicks: 456 },
      { date: 'May', clicks: 678 },
      { date: 'Jun', clicks: 543 },
      { date: 'Jul', clicks: 789 },
      { date: 'Aug', clicks: 901 },
      { date: 'Sep', clicks: 834 },
      { date: 'Oct', clicks: 956 },
      { date: 'Nov', clicks: 1123 },
      { date: 'Dec', clicks: 1456 },
      { date: 'Jan', clicks: 1678 },
      { date: 'Feb', clicks: 1890 },
    ],
    'ALL': [
      { date: 'Q1 25', clicks: 1234 },
      { date: 'Q2 25', clicks: 1678 },
      { date: 'Q3 25', clicks: 2345 },
      { date: 'Q4 25', clicks: 2890 },
      { date: 'Q1 26', clicks: 3247 },
    ],
  };

  const clicksOverTime = allClicksData[selectedTimePeriod];

  const deviceData = [
    { name: 'Mobile', value: 658, color: '#4285F4' },
    { name: 'Desktop', value: 412, color: '#34A853' },
    { name: 'Tablet', value: 177, color: '#FBBC05' },
  ];

  const locationData = [
    { city: 'New York', clicks: 425 },
    { city: 'London', clicks: 312 },
    { city: 'Toronto', clicks: 198 },
    { city: 'Berlin', clicks: 167 },
    { city: 'Sydney', clicks: 145 },
  ];

  // Mock individual clicks data - replace with API call to Rails backend
  const recentClicks = [
    {
      id: '1',
      timestamp: '2026-02-28T14:32:15Z',
      country: 'United States',
      city: 'New York',
      device: 'Mobile',
      browser: 'Chrome',
      os: 'iOS',
      referrer: 'https://twitter.com'
    },
    {
      id: '2',
      timestamp: '2026-02-28T14:28:43Z',
      country: 'United Kingdom',
      city: 'London',
      device: 'Desktop',
      browser: 'Safari',
      os: 'macOS',
      referrer: 'https://facebook.com'
    },
    {
      id: '3',
      timestamp: '2026-02-28T14:15:22Z',
      country: 'Canada',
      city: 'Toronto',
      device: 'Mobile',
      browser: 'Firefox',
      os: 'Android',
      referrer: 'Direct'
    },
    {
      id: '4',
      timestamp: '2026-02-28T13:58:11Z',
      country: 'Germany',
      city: 'Berlin',
      device: 'Desktop',
      browser: 'Chrome',
      os: 'Windows',
      referrer: 'https://google.com'
    },
    {
      id: '5',
      timestamp: '2026-02-28T13:45:09Z',
      country: 'Australia',
      city: 'Sydney',
      device: 'Tablet',
      browser: 'Safari',
      os: 'iPadOS',
      referrer: 'https://linkedin.com'
    },
    {
      id: '6',
      timestamp: '2026-02-28T13:32:56Z',
      country: 'United States',
      city: 'Los Angeles',
      device: 'Mobile',
      browser: 'Chrome',
      os: 'Android',
      referrer: 'https://instagram.com'
    },
    {
      id: '7',
      timestamp: '2026-02-28T13:21:34Z',
      country: 'United Kingdom',
      city: 'Manchester',
      device: 'Desktop',
      browser: 'Edge',
      os: 'Windows',
      referrer: 'Direct'
    },
    {
      id: '8',
      timestamp: '2026-02-28T13:08:17Z',
      country: 'France',
      city: 'Paris',
      device: 'Mobile',
      browser: 'Chrome',
      os: 'iOS',
      referrer: 'https://youtube.com'
    },
    {
      id: '9',
      timestamp: '2026-02-28T12:55:42Z',
      country: 'Japan',
      city: 'Tokyo',
      device: 'Desktop',
      browser: 'Chrome',
      os: 'macOS',
      referrer: 'https://reddit.com'
    },
    {
      id: '10',
      timestamp: '2026-02-28T12:43:28Z',
      country: 'Spain',
      city: 'Madrid',
      device: 'Mobile',
      browser: 'Safari',
      os: 'iOS',
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
        
        <div className="px-4 py-8 max-w-5xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/links')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Links
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="mb-2 text-center text-[32px]">{linkData.name}</h1>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-primary font-medium">
                  {linkData.shortUrl}
                </span>
                <button
                  onClick={() => copyToClipboard(linkData.shortUrl)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.open(`https://${linkData.shortUrl}`, '_blank')}
                  className="p-1 hover:bg-muted rounded"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 justify-center md:justify-end">
              <Button
                onClick={() => navigate(`/links/${linkData.id}/edit`)}
                className="h-10 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Link
              </Button>
            </div>
          </div>
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
                    <p className="text-2xl font-bold">895</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last 30 Days</p>
                    <p className="text-2xl font-bold">{linkData.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">All Time</p>
                    <p className="text-2xl font-bold">3,247</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg. Daily Clicks</p>
                    <p className="text-2xl font-bold">178</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Peak Day</p>
                    <p className="text-2xl font-bold">203</p>
                    <p className="text-xs text-muted-foreground mt-1">Feb 28, 2026</p>
                  </div>
                  <div className="md:col-span-3 lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Created</p>
                        <p className="font-medium">
                          {new Date(linkData.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Campaign</p>
                        <p className="font-medium">{linkData.campaign || 'None'}</p>
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
                      <div className="col-span-3">Location</div>
                      <div className="col-span-2">Device</div>
                      <div className="col-span-2">Browser</div>
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
                          <div className="font-medium">{click.city}</div>
                          <div className="text-xs text-muted-foreground">{click.country}</div>
                        </div>
                        <div className="col-span-2 text-sm">
                          <div className="font-medium">{click.device}</div>
                          <div className="text-xs text-muted-foreground">{click.os}</div>
                        </div>
                        <div className="col-span-2 text-sm font-medium">
                          {click.browser}
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
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Location</div>
                          <div className="font-medium">{click.city}</div>
                          <div className="text-xs text-muted-foreground">{click.country}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Device</div>
                          <div className="font-medium">{click.device}</div>
                          <div className="text-xs text-muted-foreground">{click.os}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Browser</div>
                          <div className="font-medium">{click.browser}</div>
                        </div>
                        
                        <div>
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
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Clicks Over Time Chart */}
                  <div className="bg-muted/10 backdrop-blur-md rounded-lg p-6 border border-border/30">
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
                  <div className="bg-muted/10 backdrop-blur-md rounded-lg p-6 border border-border/30">
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
                  <div className="bg-muted/10 backdrop-blur-md rounded-lg p-6 border border-border/30 lg:col-span-2">
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