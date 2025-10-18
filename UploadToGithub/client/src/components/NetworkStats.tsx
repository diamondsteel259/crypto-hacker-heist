import { Card } from "@/components/ui/card";
import { Activity, Zap, Users, TrendingUp } from "lucide-react";

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  color?: string;
}

function StatItem({ icon, label, value, trend, color = "text-matrix-green" }: StatItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className={`${color} mt-1`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold font-mono truncate">{value}</p>
        {trend && (
          <p className="text-xs text-chart-1 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}

export default function NetworkStats() {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Network Status</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatItem
          icon={<Activity className="w-5 h-5" />}
          label="Total Hashrate"
          value="2.47 PH/s"
          trend="+12.5%"
        />
        <StatItem
          icon={<Users className="w-5 h-5" />}
          label="Active Miners"
          value="8,432"
          trend="+3.2%"
          color="text-cyber-blue"
        />
        <StatItem
          icon={<Zap className="w-5 h-5" />}
          label="Your Hashrate"
          value="1.2 TH/s"
          color="text-neon-orange"
        />
        <StatItem
          icon={<Activity className="w-5 h-5" />}
          label="Network Share"
          value="0.048%"
          color="text-chart-2"
        />
      </div>
    </Card>
  );
}
