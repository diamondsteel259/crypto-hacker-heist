import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Zap, TrendingUp, Clock, Sparkles } from "lucide-react";
import { getCurrentUserId } from "@/lib/user";

interface UpcomingBlock {
  blockNumber: number;
  estimatedTime: string;
  timeUntil: number; // minutes
  estimatedReward: number;
  userSharePercent: string;
  potentialWithHashrateBoost: number;
  potentialWithLuckBoost: number;
  recommendPowerUp: boolean;
}

interface MiningCalendarData {
  currentBlock: number;
  userHashrate: number;
  networkHashrate: number;
  userSharePercent: string;
  blockInterval: string;
  upcomingBlocks: UpcomingBlock[];
}

export default function MiningCalendar() {
  const userId = getCurrentUserId();

  const { data: calendar, isLoading } = useQuery<MiningCalendarData>({
    queryKey: ["/api/user", userId, "mining-calendar"],
    enabled: !!userId,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading || !calendar) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-matrix-green" />
          <h3 className="font-semibold text-base">Mining Calendar</h3>
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </Card>
    );
  }

  // Show only next hour (12 blocks) by default for compact view
  const upcomingBlocks = calendar.upcomingBlocks.slice(0, 12);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-matrix-green" />
          <h3 className="font-semibold text-base">Mining Calendar</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          Next Hour
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
        <div>
          <p className="text-xs text-muted-foreground">Your Share</p>
          <p className="text-sm font-bold text-matrix-green">{calendar.userSharePercent}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Block Interval</p>
          <p className="text-sm font-bold">{calendar.blockInterval}</p>
        </div>
      </div>

      {/* Upcoming Blocks List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {upcomingBlocks.map((block) => {
          const blockTime = new Date(block.estimatedTime);
          const isPowerUpRecommended = block.recommendPowerUp;

          return (
            <div
              key={block.blockNumber}
              className={`p-3 rounded-lg border transition-all ${
                isPowerUpRecommended
                  ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                  : 'bg-background/50 border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Block #{block.blockNumber}
                  </Badge>
                  {isPowerUpRecommended && (
                    <Badge className="text-xs bg-yellow-500 hover:bg-yellow-600">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Power-Up!
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {block.timeUntil}m
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Estimated Reward</p>
                  <p className="font-mono font-bold text-matrix-green">
                    {block.estimatedReward.toLocaleString()} CS
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Your Share</p>
                  <p className="font-mono font-semibold">
                    {block.userSharePercent}%
                  </p>
                </div>
              </div>

              {isPowerUpRecommended && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">
                    Potential with Power-Ups:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-cyan-400" />
                      <span className="text-xs font-mono text-cyan-400">
                        +{(block.potentialWithHashrateBoost - block.estimatedReward).toLocaleString()} CS
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-pink-400" />
                      <span className="text-xs font-mono text-pink-400">
                        +{(block.potentialWithLuckBoost - block.estimatedReward).toLocaleString()} CS
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                {blockTime.toLocaleTimeString()}
              </p>
            </div>
          );
        })}
      </div>

      {calendar.upcomingBlocks.length > 12 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            {calendar.upcomingBlocks.length - 12} more blocks in the next 24 hours
          </p>
        </div>
      )}
    </Card>
  );
}
