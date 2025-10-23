import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Clock, TrendingUp } from "lucide-react";
import type { Block } from "@shared/schema";

interface BlockTimerProps {
  onBlockMined?: () => void;
  userHashrate?: number;
}

interface NetworkStats {
  totalHashrate: number;
  activeMiners: number;
  timestamp: string;
}

export default function BlockTimer({ onBlockMined, userHashrate = 0 }: BlockTimerProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Fetch latest block data
  const { data: latestBlock } = useQuery<Block>({
    queryKey: ['/api/blocks/latest'],
    refetchInterval: 1000, // Refetch every second
  });

  // Fetch network stats to calculate estimated reward
  const { data: networkStats } = useQuery<NetworkStats>({
    queryKey: ['/api/network-stats'],
    queryFn: () => fetch('/api/network-stats').then(r => r.json()),
    refetchInterval: 60000, // Refresh every minute
  });

  // Calculate time until next block based on actual mining schedule
  useEffect(() => {
    if (!latestBlock) return;

    const blockInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = Date.now();
    const lastBlockTime = new Date(latestBlock.timestamp).getTime();
    const nextBlockTime = lastBlockTime + blockInterval;
    const timeUntilNext = Math.max(0, Math.floor((nextBlockTime - now) / 1000));

    setTimeLeft(timeUntilNext);

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const timeUntilNext = Math.max(0, Math.floor((nextBlockTime - currentTime) / 1000));
      
      if (timeUntilNext === 0) {
        onBlockMined?.();
        // Reset timer for next block
        const newNextBlockTime = currentTime + blockInterval;
        setTimeLeft(Math.floor(blockInterval / 1000));
      } else {
        setTimeLeft(timeUntilNext);
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // onBlockMined intentionally omitted to prevent interval recreation when callback changes
  }, [latestBlock]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isPulse = timeLeft <= 10;

  // Calculate estimated reward based on user's hashrate share
  const estimatedReward = () => {
    if (!userHashrate || !networkStats?.totalHashrate || networkStats.totalHashrate === 0) {
      return 0;
    }
    const blockReward = 100000; // 100K CS per block
    const userShare = userHashrate / networkStats.totalHashrate;
    return Math.floor(blockReward * userShare);
  };

  const reward = estimatedReward();

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 md:w-5 h-4 md:h-5 text-matrix-green" />
          <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider">Next Block</h3>
        </div>
      </div>
      <div className={`text-center ${isPulse ? 'pulse-scale' : ''}`}>
        <div className="text-4xl md:text-5xl font-bold text-matrix-green matrix-glow font-mono">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
          Block #{latestBlock ? latestBlock.blockNumber + 1 : 1}
        </p>
        
        {userHashrate > 0 && reward > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-3 md:w-4 h-3 md:h-4 text-cyber-blue" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Your Estimated Reward</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono text-cyber-blue">
              ~{reward.toLocaleString()} CS
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              Based on your {userHashrate.toLocaleString()} H/s
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
