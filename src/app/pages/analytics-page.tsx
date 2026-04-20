import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../contexts/auth-context';
import { AppLayout } from '../components/app-layout';
import { Button } from '../components/ui/button';
import { ArrowLeft, Copy, ExternalLink, Calendar, TrendingUp, MousePointerClick, FolderKanban } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AnalyticsPage() {
  const { linkId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Mock data - replace with API call to Rails backend
  const linkData = {
    id: linkId,
    originalUrl: 'https://www.example.com/very-long-url-that-needs-shortening',
    shortCode: 'abc123',
    shortUrl: 'blackcollar.io/abc123',
    totalClicks: 1247,
    createdAt: '2026-02-15',
  };

  // Mock analytics data
  const clicksOverTime = [
    { date: 'Feb 22', clicks: 65 },
    { date: 'Feb 23', clicks: 89 },
    { date: 'Feb 24', clicks: 120 },
    { date: 'Feb 25', clicks: 95 },
    { date: 'Feb 26', clicks: 145 },
    { date: 'Feb 27', clicks: 178 },
    { date: 'Feb 28', clicks: 203 },
  ];

  const deviceData = [
    { name: 'Mobile', value: 658, color: '#4285F4' },
    { name: 'Desktop', value: 412, color: '#34A853' },
    { name: 'Tablet', value: 177, color: '#FBBC05' },
  ];

  const campaignData = [
    { campaign: 'Spring Sale 2026', clicks: 425 },
    { campaign: 'Product Launch', clicks: 312 },
    { campaign: 'Summer Campaign', clicks: 298 },
    { campaign: 'Holiday Promo', clicks: 145 },
    { campaign: 'Newsletter Feb', clicks: 67 },
  ];

  const referrerData = [
    { source: 'Direct', clicks: 456 },
    { source: 'Social Media', clicks: 389 },
    { source: 'Email', clicks: 245 },
    { source: 'Search', clicks: 157 },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(`https://${text}`);
    alert('Copied to clipboard!');
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="px-4 py-8 max-w-7xl mx-auto relative">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/links')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Links
        </Button>

        {/* Link Details Header */}
        <div className="bg-card rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Link Analytics</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <ExternalLink className="w-4 h-4" />
                <span className="truncate max-w-md">{linkData.originalUrl}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary">{linkData.shortUrl}</span>
                <button
                  onClick={() => copyToClipboard(linkData.shortUrl)}
                  className="p-1 hover:bg-accent rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{linkData.totalClicks.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Clicks</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Avg. Daily Clicks</span>
            </div>
            <p className="text-2xl font-bold">178</p>
          </div>
          <div className="bg-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointerClick className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Peak Day</span>
            </div>
            <p className="text-2xl font-bold">203</p>
          </div>
          <div className="bg-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FolderKanban className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Countries</span>
            </div>
            <p className="text-2xl font-bold">24</p>
          </div>
          <div className="bg-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">Active Days</span>
            </div>
            <p className="text-2xl font-bold">7</p>
          </div>
        </div>

        {/* Clicks Over Time Chart */}
        <div className="bg-card rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Clicks Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={clicksOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))' 
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="clicks" stroke="#4285F4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device & Location Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Device Breakdown */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Device Breakdown</h2>
            <div className="flex items-center justify-center mb-4">
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
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {deviceData.map((device) => (
                <div key={device.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: device.color }} />
                    <span>{device.name}</span>
                  </div>
                  <span className="font-semibold">{device.value} clicks</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Campaigns */}
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Top Campaigns</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={campaignData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="campaign" type="category" width={100} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="clicks" fill="#34A853" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Referrer Sources */}
        <div className="bg-card rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Referrer Sources</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={referrerData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="source" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))' 
                }} 
              />
              <Legend />
              <Bar dataKey="clicks" fill="#FBBC05" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>
      </div>
    </AppLayout>
  );
}