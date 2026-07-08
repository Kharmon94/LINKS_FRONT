import { useState } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type {
  AnalyticsPeriod,
  ChartPoint,
  DeviceBreakdownItem,
  LocationItem,
  QuickStats,
  ReferrerItem,
  PoolBreakdownItem,
} from '@/services/analytics-api';

const PERIODS: AnalyticsPeriod[] = ['7D', '30D', '90D', '1Y', 'ALL'];

interface AnalyticsChartsProps {
  quickStats?: QuickStats;
  clicksOverTime?: Record<AnalyticsPeriod, ChartPoint[]>;
  deviceBreakdown?: DeviceBreakdownItem[];
  topLocations?: LocationItem[];
  referrerBreakdown?: ReferrerItem[];
  poolBreakdown?: PoolBreakdownItem[];
  showQuickStats?: boolean;
  showLocations?: boolean;
  showReferrers?: boolean;
  showPoolBreakdown?: boolean;
}

export function AnalyticsCharts({
  quickStats,
  clicksOverTime,
  deviceBreakdown = [],
  topLocations = [],
  referrerBreakdown = [],
  poolBreakdown = [],
  showQuickStats = true,
  showLocations = true,
  showReferrers = false,
  showPoolBreakdown = false,
}: AnalyticsChartsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('7D');
  const chartData = clicksOverTime?.[selectedPeriod] ?? [];

  return (
    <div className="space-y-6">
      {showQuickStats && quickStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Last 7 Days</p>
            <p className="text-2xl font-bold">{quickStats.last7Days.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Last 30 Days</p>
            <p className="text-2xl font-bold">{quickStats.last30Days.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">All Time</p>
            <p className="text-2xl font-bold">{quickStats.allTime.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Links</p>
            <p className="text-2xl font-bold">{quickStats.totalLinks}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Avg. Daily Clicks</p>
            <p className="text-2xl font-bold">{quickStats.avgDailyClicks.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Peak Day</p>
            <p className="text-2xl font-bold">{quickStats.peakDay.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Countries</p>
            <p className="text-2xl font-bold">{(quickStats.countries ?? 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Active Days</p>
            <p className="text-2xl font-bold">{(quickStats.activeDays ?? 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      {(clicksOverTime || deviceBreakdown.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clicksOverTime && (
            <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
              <div className="flex flex-col mb-4 gap-3">
                <h3 className="text-lg font-semibold">Clicks Over Time</h3>
                <div className="flex gap-1 bg-muted/30 rounded-lg p-1">
                  {PERIODS.map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        selectedPeriod === period
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
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" stroke="currentColor" />
                  <YAxis
                    stroke="currentColor"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                    width={45}
                    tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                    }}
                  />
                  <Line type="monotone" dataKey="clicks" stroke="#4285F4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
            {deviceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {deviceBreakdown.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No click data yet</p>
            )}
          </div>

          {showLocations && (
            <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
              {topLocations.length > 0 ? (
                <div className="space-y-3">
                  {topLocations.map((location, index) => (
                    <div
                      key={`${location.city}-${index}`}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 text-sm font-semibold">
                          {index + 1}
                        </div>
                        <span className="font-medium">
                          {location.city}
                          {location.country ? `, ${location.country}` : ''}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{location.clicks.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">clicks</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No location data yet</p>
              )}
            </div>
          )}
        </div>
      )}

      {showReferrers && referrerBreakdown.length > 0 && (
        <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Referrer Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={referrerBreakdown}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="source" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                }}
              />
              <Bar dataKey="clicks" fill="#FBBC05" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {showPoolBreakdown && poolBreakdown.length > 0 && (
        <div className="bg-card/50 backdrop-blur-md shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Pool Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border/30">
                  <th className="pb-3 pr-4 font-medium">Destination</th>
                  <th className="pb-3 pr-4 font-medium text-right">Weight</th>
                  <th className="pb-3 pr-4 font-medium text-right">Clicks</th>
                  <th className="pb-3 font-medium text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {poolBreakdown.map((entry) => (
                  <tr key={entry.poolEntryId} className="border-b border-border/20">
                    <td className="py-3 pr-4 max-w-xs truncate">{entry.url}</td>
                    <td className="py-3 pr-4 text-right">{entry.weight}%</td>
                    <td className="py-3 pr-4 text-right">{entry.clicks.toLocaleString()}</td>
                    <td className="py-3 text-right">{entry.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
