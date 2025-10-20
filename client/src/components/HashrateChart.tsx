import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { getCurrentUserId } from "@/lib/user";
import type { User } from "@shared/schema";

interface BlockRewardWithBlock {
  id: string;
  blockId: string;
  userId: string;
  reward: number;
  hashrate: number;
  sharePercent: number;
  createdAt: Date;
  block: {
    id: string;
    blockNumber: number;
    reward: number;
    totalHashrate: number;
    totalMiners: number;
    difficulty: number;
    createdAt: Date;
  };
}

export default function HashrateChart() {
  const userId = getCurrentUserId();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user', userId],
    enabled: !!userId,
  });

  const { data: rewards = [] } = useQuery<BlockRewardWithBlock[]>({
    queryKey: ['/api/user', userId, 'rewards'],
    enabled: !!userId,
  });

  const currentHashrate = user?.totalHashrate ?? 0;

  const last12Rewards = rewards.slice(0, 12).reverse();

  let data: { time: string; hashrate: number }[] = [];
  if (last12Rewards.length > 0) {
    data = last12Rewards.map((reward, index) => ({
      time: `${12 - index}h ago`,
      hashrate: reward.hashrate,
    }));
  } else {
    data = [
      { time: "Now", hashrate: currentHashrate },
    ];
  }

  const maxHashrate = Math.max(...data.map(d => d.hashrate), currentHashrate, 1);
  const avgHashrate = data.length > 0 ? data.reduce((sum, d) => sum + d.hashrate, 0) / data.length : currentHashrate;
  const peakHashrate = maxHashrate;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-matrix-green" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Hashrate History</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Last {data.length} blocks</p>
        </div>
      </div>

      <div className="relative h-48">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
          <span>{maxHashrate.toFixed(0)} H/s</span>
          <span>{(maxHashrate * 0.5).toFixed(0)} H/s</span>
          <span>0 H/s</span>
        </div>

        {/* Chart area */}
        {data.length > 0 ? (
          <div className="ml-16 h-full flex items-end gap-2">
            {data.map((point, index) => {
              const heightPercent = maxHashrate > 0 ? (point.hashrate / maxHashrate) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="w-full flex flex-col justify-end h-full">
                    <div
                      className="w-full bg-gradient-to-t from-matrix-green to-cyber-blue rounded-t-sm transition-all group-hover:opacity-80"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 whitespace-nowrap">
                    {point.time}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ml-16 h-full flex items-center justify-center text-muted-foreground text-sm">
            No blocks mined yet. Start mining by purchasing equipment!
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Peak HR</p>
          <p className="text-lg font-bold font-mono text-neon-orange">{peakHashrate.toFixed(0)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Avg HR</p>
          <p className="text-lg font-bold font-mono text-cyber-blue">
            {avgHashrate.toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current HR</p>
          <p className="text-lg font-bold font-mono text-matrix-green">
            {currentHashrate.toFixed(0)}
          </p>
        </div>
      </div>
    </Card>
  );
}
