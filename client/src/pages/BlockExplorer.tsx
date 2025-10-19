import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Blocks, Search, Trophy, Users, Clock } from "lucide-react";
import { getCurrentUserId } from "@/lib/user";
import { format } from "date-fns";
import type { User } from "@shared/schema";

interface BlockData {
  blockNumber: number;
  timestamp: string;
  reward: number;
  totalHashrate: string;
  difficulty: number;
  minersCount: number;
}

interface BlockReward {
  blockNumber: number;
  cipherShards: number;
  hashrate: number;
  createdAt: string;
}

export default function BlockExplorer() {
  const userId = getCurrentUserId();
  
  const { data: user } = useQuery<User>({
    queryKey: [`/api/user/${userId}`],
    enabled: !!userId,
  });

  const { data: blocks = [], isLoading: blocksLoading } = useQuery<BlockData[]>({
    queryKey: ['/api/blocks'],
  });

  const { data: userRewards = [] } = useQuery<BlockReward[]>({
    queryKey: [`/api/user/${userId}/rewards`],
    enabled: !!userId,
  });

  const latestBlock = blocks[0];
  const activeMiners = latestBlock?.minersCount || 0;

  const formatHashrate = (hr: string) => {
    const num = parseFloat(hr);
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)} PH/s`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)} TH/s`;
    return `${num.toFixed(2)} GH/s`;
  };

  const getUserShareForBlock = (blockNum: number) => {
    const reward = userRewards.find(r => r.blockNumber === blockNum);
    return reward ? {
      share: reward.hashrate,
      reward: reward.cipherShards
    } : null;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - then.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-background terminal-scanline">
      <div className="max-w-7xl mx-auto p-2 md:p-4 space-y-3 md:space-y-6">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-matrix-green/20 flex items-center justify-center">
              <Blocks className="w-6 h-6 text-matrix-green" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Block Explorer</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Recent block mining history
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search block #..."
                className="pl-9 w-[200px]"
                data-testid="input-search-block"
              />
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search block #..."
              className="pl-9"
              data-testid="input-search-block-mobile"
            />
          </div>
        </div>

        {/* Network Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Card className="p-2.5 md:p-4">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Blocks className="w-3 md:w-4 h-3 md:h-4 text-matrix-green" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Latest Block</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono" data-testid="text-latest-block">
              {blocksLoading ? '...' : latestBlock?.blockNumber || '0'}
            </p>
          </Card>
          
          <Card className="p-2.5 md:p-4">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Trophy className="w-3 md:w-4 h-3 md:h-4 text-neon-orange" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Block Reward</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono text-matrix-green">100K</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">CS</p>
          </Card>
          
          <Card className="p-2.5 md:p-4">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Users className="w-3 md:w-4 h-3 md:h-4 text-cyber-blue" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Active Miners</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono" data-testid="text-active-miners">
              {blocksLoading ? '...' : activeMiners.toLocaleString()}
            </p>
          </Card>
          
          <Card className="p-2.5 md:p-4">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Clock className="w-3 md:w-4 h-3 md:h-4 text-chart-2" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Avg Block Time</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono">5:00</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">minutes</p>
          </Card>
        </div>

        {/* Blocks List */}
        <Card className="p-4 md:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Recent Blocks</h3>
          
          {blocksLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading blocks...
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No blocks mined yet. Mining will begin shortly!
            </div>
          ) : (
            <div className="space-y-3">
              {blocks.map((block) => {
                const userShare = getUserShareForBlock(block.blockNumber);
                return (
                  <div
                    key={block.blockNumber}
                    className="p-4 rounded-md bg-card border border-card-border hover-elevate transition-all"
                    data-testid={`block-${block.blockNumber}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-matrix-green" />
                        <span className="font-mono font-semibold">Block #{block.blockNumber}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(block.timestamp)}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(block.timestamp), 'MM/dd/yyyy, HH:mm a')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-1">Reward</p>
                        <p className="font-mono font-semibold text-matrix-green">
                          {block.reward.toLocaleString()} CS
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Miners
                        </p>
                        <p className="font-mono font-semibold">{block.minersCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Network HR</p>
                        <p className="font-mono font-semibold text-cyber-blue">{formatHashrate(block.totalHashrate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Difficulty</p>
                        <p className="font-mono font-semibold">{block.difficulty}</p>
                      </div>
                    </div>

                    {userShare && userShare.reward > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Your contribution</span>
                          <Badge variant="outline" className="text-xs bg-neon-orange/20 text-neon-orange border-neon-orange/30">
                            +{userShare.reward.toLocaleString()} CS Earned
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
