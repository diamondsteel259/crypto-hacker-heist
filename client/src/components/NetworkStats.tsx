import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Activity, Zap, Users, TrendingUp } from "lucide-react";
import { getCurrentUserId } from "@/lib/user";

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}

function StatItem({ icon, label, value, color = "text-matrix-green" }: StatItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className={`${color} mt-1`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold font-mono truncate">{value}</p>
      </div>
    </div>
  );
}

interface NetworkStatsData {
  totalNetworkHashrate: number;
  activeMiners: number;
  userHashrate: number;
  networkShare: number;
}

export default function NetworkStats() {
  const userId = getCurrentUserId();

  const { data: stats, isLoading } = useQuery<NetworkStatsData>({
    queryKey: ['/api/user', userId, 'network-stats'],
    enabled: !!userId,
  });

  function formatHashrate(hashrate: number): string {
    if (hashrate === 0) return "0 H/s";
    if (hashrate < 1000) return `${hashrate.toFixed(2)} H/s`;
    if (hashrate < 1000000) return `${(hashrate / 1000).toFixed(2)} KH/s`;
    if (hashrate < 1000000000) return `${(hashrate / 1000000).toFixed(2)} MH/s`;
    if (hashrate < 1000000000000) return `${(hashrate / 1000000000).toFixed(2)} GH/s`;
    if (hashrate < 1000000000000000) return `${(hashrate / 1000000000000).toFixed(2)} TH/s`;
    return `${(hashrate / 1000000000000000).toFixed(2)} PH/s`;
  }

  if (isLoading || !stats) {
    return (
      <Card className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Network Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatItem
            icon={<Activity className="w-5 h-5" />}
            label="Total Hashrate"
            value="Loading..."
          />
          <StatItem
            icon={<Users className="w-5 h-5" />}
            label="Active Miners"
            value="..."
            color="text-cyber-blue"
          />
          <StatItem
            icon={<Zap className="w-5 h-5" />}
            label="Your Hashrate"
            value="..."
            color="text-neon-orange"
          />
          <StatItem
            icon={<Activity className="w-5 h-5" />}
            label="Network Share"
            value="..."
            color="text-chart-2"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Network Status</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatItem
          icon={<Activity className="w-5 h-5" />}
          label="Total Hashrate"
          value={formatHashrate(stats.totalNetworkHashrate)}
        />
        <StatItem
          icon={<Users className="w-5 h-5" />}
          label="Active Miners"
          value={stats.activeMiners.toLocaleString()}
          color="text-cyber-blue"
        />
        <StatItem
          icon={<Zap className="w-5 h-5" />}
          label="Your Hashrate"
          value={formatHashrate(stats.userHashrate)}
          color="text-neon-orange"
        />
        <StatItem
          icon={<Activity className="w-5 h-5" />}
          label="Network Share"
          value={stats.networkShare > 0 ? `${stats.networkShare.toFixed(3)}%` : "0%"}
          color="text-chart-2"
        />
      </div>
    </Card>
  );
}
