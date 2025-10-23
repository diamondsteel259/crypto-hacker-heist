import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, AlertTriangle, TrendingUp, TrendingDown, RefreshCw, CheckCircle } from "lucide-react";
import { getTelegramInitData } from "@/lib/user";
import { queryClient } from "@/lib/queryClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface EconomyOverview {
  totalCsInCirculation: string;
  inflationRatePercent: string;
  giniCoefficient: string;
  top10PercentOwnership: string;
  alerts?: number;
  status?: string;
  recommendations?: string[];
}

interface EconomyMetric {
  date: string;
  totalCsInCirculation: string;
  inflationRatePercent: string;
  giniCoefficient: string;
  top10PercentOwnership: string;
}

interface WealthDistribution {
  percentile: string;
  userCount: number;
  totalCs: string;
  avgCs: string;
  sharePercent: string;
}

interface EconomyAlert {
  id: number;
  alertType: string;
  severity: string;
  message: string;
  isAcknowledged: boolean;
  createdAt: string;
}

export default function EconomyAdmin() {
  const { toast } = useToast();

  const { data: overview, isLoading: overviewLoading } = useQuery<EconomyOverview>({
    queryKey: ['/api/admin/economy/overview'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/economy/overview', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch economy overview');
      return response.json();
    },
  });

  const { data: history, isLoading: historyLoading } = useQuery<EconomyMetric[]>({
    queryKey: ['/api/admin/economy/history'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/economy/history?days=30', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch economy history');
      return response.json();
    },
  });

  const { data: distribution, isLoading: distributionLoading } = useQuery<WealthDistribution[]>({
    queryKey: ['/api/admin/economy/distribution'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/economy/distribution', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch wealth distribution');
      return response.json();
    },
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery<EconomyAlert[]>({
    queryKey: ['/api/admin/economy/alerts'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/economy/alerts', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    },
  });

  const calculateMetricsMutation = useMutation({
    mutationFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/economy/calculate-metrics', {
        method: 'POST',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to calculate metrics');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/economy'] });
      toast({
        title: "Metrics Calculated",
        description: "Economy metrics have been recalculated",
      });
    },
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (id: number) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/economy/alerts/${id}/acknowledge`, {
        method: 'POST',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to acknowledge alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/economy/alerts'] });
      toast({
        title: "Alert Acknowledged",
        description: "The alert has been marked as acknowledged",
      });
    },
  });

  // Format data for charts
  const inflationChartData = history?.map(h => ({
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    inflation: parseFloat(h.inflationRatePercent),
  })).reverse() || [];

  const giniChartData = history?.map(h => ({
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    gini: parseFloat(h.giniCoefficient) * 100,
  })).reverse() || [];

  const distributionPieData = distribution?.map(d => ({
    name: d.percentile,
    value: parseFloat(d.sharePercent),
  })) || [];

  const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getAlertIcon = (severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (severity === 'warning') return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <AlertTriangle className="w-4 h-4 text-blue-500" />;
  };

  const getAlertBgColor = (severity: string) => {
    if (severity === 'critical') return 'bg-red-500/10 border-red-500/30';
    if (severity === 'warning') return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-blue-500/10 border-blue-500/30';
  };

  const getStatusColor = (status: string) => {
    if (status === 'healthy') return 'bg-matrix-green text-black';
    if (status === 'warning') return 'bg-yellow-500 text-black';
    return 'bg-red-500 text-white';
  };

  const unacknowledgedAlerts = alerts?.filter(a => !a.isAcknowledged) || [];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Economy Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              CS inflation monitoring, wealth distribution, and economic health
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => calculateMetricsMutation.mutate()}
            disabled={calculateMetricsMutation.isPending}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recalculate Metrics
          </Button>
        </div>

        {/* Overview Stats */}
        {overviewLoading ? (
          <p className="text-sm text-muted-foreground">Loading overview...</p>
        ) : overview && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-matrix-green/10 border border-matrix-green/30 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-matrix-green" />
                  <p className="text-xs text-muted-foreground uppercase">Total CS</p>
                </div>
                <p className="text-2xl font-bold font-mono text-matrix-green">
                  {parseFloat(overview.totalCsInCirculation || '0').toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-yellow-500" />
                  <p className="text-xs text-muted-foreground uppercase">Inflation Rate</p>
                </div>
                <p className="text-2xl font-bold font-mono text-yellow-500">
                  {parseFloat(overview.inflationRatePercent || '0').toFixed(2)}%
                </p>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-purple-500" />
                  <p className="text-xs text-muted-foreground uppercase">Gini Coefficient</p>
                </div>
                <p className="text-2xl font-bold font-mono text-purple-500">
                  {parseFloat(overview.giniCoefficient || '0').toFixed(3)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  0 = equal, 1 = unequal
                </p>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="text-xs text-muted-foreground uppercase">Top 10% Own</p>
                </div>
                <p className="text-2xl font-bold font-mono text-red-500">
                  {parseFloat(overview.top10PercentOwnership || '0').toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-md">
              <Badge className={`text-sm ${getStatusColor(overview.status || 'healthy')}`}>
                {(overview.status || 'HEALTHY').toUpperCase()}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {unacknowledgedAlerts.length > 0 ? (
                  <>{unacknowledgedAlerts.length} unacknowledged alert(s)</>
                ) : (
                  <>Economy is stable, no critical issues</>
                )}
              </p>
            </div>
          </>
        )}
      </Card>

      {/* Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Active Alerts ({unacknowledgedAlerts.length})
          </h4>
          <div className="space-y-2">
            {unacknowledgedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-md border ${getAlertBgColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.severity)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {alert.alertType.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                    disabled={acknowledgeAlertMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Inflation Rate Chart */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Inflation Rate (Last 30 Days)</h4>
        {historyLoading ? (
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        ) : inflationChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={inflationChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis stroke="#888" style={{ fontSize: '12px' }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#888' }}
                formatter={(value: any) => `${value}%`}
              />
              <Legend />
              <Line type="monotone" dataKey="inflation" stroke="#f59e0b" strokeWidth={2} name="Inflation Rate %" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
        )}
      </Card>

      {/* Gini Coefficient Chart */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Wealth Inequality - Gini Coefficient (Last 30 Days)</h4>
        {historyLoading ? (
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        ) : giniChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={giniChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis stroke="#888" style={{ fontSize: '12px' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#888' }}
                formatter={(value: any) => `${value.toFixed(1)}`}
              />
              <Legend />
              <Line type="monotone" dataKey="gini" stroke="#a855f7" strokeWidth={2} name="Gini Coefficient (0-100)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
        )}
      </Card>

      {/* Wealth Distribution */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Wealth Distribution by Percentile</h4>

        {distributionLoading ? (
          <p className="text-sm text-muted-foreground">Loading distribution...</p>
        ) : distribution && distribution.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
              </PieChart>
            </ResponsiveContainer>

            {/* Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-muted-foreground uppercase px-4">
                <div>Group</div>
                <div>Users</div>
                <div>Avg CS</div>
                <div>Share</div>
              </div>
              {distribution.map((d, index) => (
                <div
                  key={d.percentile}
                  className="grid grid-cols-4 gap-2 p-4 bg-muted/30 rounded-md text-sm"
                  style={{ borderLeft: `4px solid ${COLORS[index % COLORS.length]}` }}
                >
                  <div className="font-semibold">{d.percentile}</div>
                  <div className="font-mono">{d.userCount}</div>
                  <div className="font-mono">{parseFloat(d.avgCs).toLocaleString()}</div>
                  <div className="font-mono">{parseFloat(d.sharePercent).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No distribution data available</p>
        )}
      </Card>

      {/* Acknowledged Alerts History */}
      {alerts && alerts.filter(a => a.isAcknowledged).length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4 text-muted-foreground">Alert History (Acknowledged)</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.filter(a => a.isAcknowledged).slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-muted/30 rounded-md opacity-60 text-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {alert.alertType.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{alert.severity}</Badge>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                </div>
                <p className="text-xs">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
