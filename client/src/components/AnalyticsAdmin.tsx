import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Users, DollarSign, TrendingUp, RefreshCw } from "lucide-react";
import { getTelegramInitData } from "@/lib/user";
import { queryClient } from "@/lib/queryClient";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsOverview {
  today: {
    dau: number;
    newUsers: number;
    totalCsGenerated: string;
    tonRevenue: string;
  };
  last30Days: {
    mau: number;
    totalNewUsers: number;
    totalRevenue: string;
    avgDau: number;
  };
}

interface DailyAnalytics {
  date: string;
  dau: number;
  newUsers: number;
  totalCsGenerated: string;
  tonRevenue: string;
}

interface RetentionData {
  cohortDate: string;
  day0: number;
  day1: number;
  day7: number;
  day30: number;
  d1Percent: number;
  d7Percent: number;
  d30Percent: number;
}

export default function AnalyticsAdmin() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('30');

  const { data: overview, isLoading: overviewLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['/api/admin/analytics/overview'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/analytics/overview', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch analytics overview');
      return response.json();
    },
  });

  const { data: dailyData, isLoading: dailyLoading } = useQuery<DailyAnalytics[]>({
    queryKey: ['/api/admin/analytics/daily', dateRange],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/analytics/daily?days=${dateRange}`, {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch daily analytics');
      return response.json();
    },
  });

  const { data: retention, isLoading: retentionLoading } = useQuery<RetentionData[]>({
    queryKey: ['/api/admin/analytics/retention'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/analytics/retention', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch retention data');
      return response.json();
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/analytics/generate-report', {
        method: 'POST',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to generate report');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics'] });
      toast({
        title: "Report Generated",
        description: "Analytics report has been generated successfully",
      });
    },
  });

  const updateCohortsMutation = useMutation({
    mutationFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/analytics/update-cohorts', {
        method: 'POST',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to update cohorts');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics/retention'] });
      toast({
        title: "Cohorts Updated",
        description: "Retention cohorts have been recalculated",
      });
    },
  });

  // Format data for charts
  const chartData = dailyData?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dau: d.dau,
    newUsers: d.newUsers,
    revenue: parseFloat(d.tonRevenue || '0'),
  })).reverse() || [];

  const retentionChartData = retention?.slice(0, 10).map(r => ({
    date: new Date(r.cohortDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    d1: parseFloat(r.d1Percent.toFixed(1)),
    d7: parseFloat(r.d7Percent.toFixed(1)),
    d30: parseFloat(r.d30Percent.toFixed(1)),
  })).reverse() || [];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-500" />
              Analytics Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              DAU/MAU tracking, retention metrics, and revenue analysis
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateCohortsMutation.mutate()}
              disabled={updateCohortsMutation.isPending}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Cohorts
            </Button>
            <Button
              size="sm"
              onClick={() => generateReportMutation.mutate()}
              disabled={generateReportMutation.isPending}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        {overviewLoading ? (
          <p className="text-sm text-muted-foreground">Loading overview...</p>
        ) : overview && overview.today ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-cyan-500" />
                <p className="text-xs text-muted-foreground uppercase">Today DAU</p>
              </div>
              <p className="text-2xl font-bold font-mono text-cyan-500">
                {overview.today.dau || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {overview.today.newUsers || 0} new users
              </p>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <p className="text-xs text-muted-foreground uppercase">30-Day MAU</p>
              </div>
              <p className="text-2xl font-bold font-mono text-purple-500">
                {overview.last30Days?.mau || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Avg DAU: {overview.last30Days?.avgDau?.toFixed(0) || 0}
              </p>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-yellow-500" />
                <p className="text-xs text-muted-foreground uppercase">Today Revenue</p>
              </div>
              <p className="text-2xl font-bold font-mono text-yellow-500">
                {parseFloat(overview.today.tonRevenue || '0').toFixed(2)} TON
              </p>
            </div>

            <div className="p-4 bg-matrix-green/10 border border-matrix-green/30 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-matrix-green" />
                <p className="text-xs text-muted-foreground uppercase">30-Day Revenue</p>
              </div>
              <p className="text-2xl font-bold font-mono text-matrix-green">
                {parseFloat(overview.last30Days?.totalRevenue || '0').toFixed(2)} TON
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No analytics data available</p>
        )}
      </Card>

      {/* DAU/MAU Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Daily Active Users & New Users</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={dateRange === '7' ? 'default' : 'outline'}
              onClick={() => setDateRange('7')}
            >
              7 Days
            </Button>
            <Button
              size="sm"
              variant={dateRange === '30' ? 'default' : 'outline'}
              onClick={() => setDateRange('30')}
            >
              30 Days
            </Button>
            <Button
              size="sm"
              variant={dateRange === '90' ? 'default' : 'outline'}
              onClick={() => setDateRange('90')}
            >
              90 Days
            </Button>
          </div>
        </div>

        {dailyLoading ? (
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis stroke="#888" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#888' }}
              />
              <Legend />
              <Line type="monotone" dataKey="dau" stroke="#06b6d4" strokeWidth={2} name="DAU" />
              <Line type="monotone" dataKey="newUsers" stroke="#a855f7" strokeWidth={2} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
        )}
      </Card>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Daily Revenue (TON)</h4>

        {dailyLoading ? (
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis stroke="#888" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#888' }}
              />
              <Bar dataKey="revenue" fill="#eab308" name="TON Revenue" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
        )}
      </Card>

      {/* Retention Chart */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Retention Cohorts (Last 10 Days)</h4>

        {retentionLoading ? (
          <p className="text-sm text-muted-foreground">Loading retention data...</p>
        ) : retentionChartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={retentionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
                <YAxis stroke="#888" style={{ fontSize: '12px' }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#888' }}
                  formatter={(value: any) => `${value}%`}
                />
                <Legend />
                <Line type="monotone" dataKey="d1" stroke="#10b981" strokeWidth={2} name="D1 Retention" />
                <Line type="monotone" dataKey="d7" stroke="#f59e0b" strokeWidth={2} name="D7 Retention" />
                <Line type="monotone" dataKey="d30" stroke="#ef4444" strokeWidth={2} name="D30 Retention" />
              </LineChart>
            </ResponsiveContainer>

            {/* Retention Table */}
            <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-muted-foreground uppercase px-4">
                <div>Cohort</div>
                <div>D0</div>
                <div>D1</div>
                <div>D7</div>
                <div>D30</div>
              </div>
              {retention?.slice(0, 10).map((r) => (
                <div
                  key={r.cohortDate}
                  className="grid grid-cols-5 gap-2 p-4 bg-muted/30 rounded-md text-sm"
                >
                  <div className="font-mono">
                    {new Date(r.cohortDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="font-mono">{r.day0}</div>
                  <div className="font-mono">
                    {r.day1} <span className="text-xs text-muted-foreground">({r.d1Percent.toFixed(1)}%)</span>
                  </div>
                  <div className="font-mono">
                    {r.day7} <span className="text-xs text-muted-foreground">({r.d7Percent.toFixed(1)}%)</span>
                  </div>
                  <div className="font-mono">
                    {r.day30} <span className="text-xs text-muted-foreground">({r.d30Percent.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No retention data available</p>
        )}
      </Card>
    </div>
  );
}
