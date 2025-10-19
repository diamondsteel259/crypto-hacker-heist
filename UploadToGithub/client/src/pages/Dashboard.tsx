import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BlockTimer from "@/components/BlockTimer";
import NetworkStats from "@/components/NetworkStats";
import HashrateChart from "@/components/HashrateChart";
import HeistEventBanner from "@/components/HeistEventBanner";
import { Terminal, Gem, Package, TrendingUp } from "lucide-react";
import { initializeUser } from "@/lib/user";
import type { User, BlockReward } from "@shared/schema";

export default function Dashboard() {
  const [showEvent] = useState(false); // Set to false since no real events yet
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeUser()
      .then(setUserId)
      .catch(err => {
        console.error('Failed to initialize user:', err);
      });
  }, []);

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['/api/user', userId],
    enabled: !!userId,
  });

  const { data: rewards = [] } = useQuery<(BlockReward & { block: any })[]>({
    queryKey: ['/api/user', userId, 'rewards'],
    enabled: !!userId,
  });

  const { data: ownedEquipment = [] } = useQuery<any[]>({
    queryKey: ['/api/user', userId, 'equipment'],
    enabled: !!userId,
  });

  if (userError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 max-w-md">
          <h2 className="text-lg font-bold text-destructive mb-2">Connection Error</h2>
          <p className="text-sm text-muted-foreground">
            Failed to load user data. Please refresh the page to try again.
          </p>
        </Card>
      </div>
    );
  }

  const csBalance = user?.csBalance ?? 0;
  const totalRigs = ownedEquipment.reduce((sum: number, eq: any) => sum + (eq.quantity || 0), 0);
  
  // Calculate mining stats from rewards
  const totalMined = rewards.reduce((sum, r) => sum + r.reward, 0);
  const last24hRewards = rewards.filter(r => {
    const rewardTime = new Date(r.createdAt).getTime();
    const now = Date.now();
    return now - rewardTime < 24 * 60 * 60 * 1000;
  });
  const last24hTotal = last24hRewards.reduce((sum, r) => sum + r.reward, 0);
  const avgPerBlock = rewards.length > 0 ? Math.floor(totalMined / rewards.length) : 0;

  return (
    <div className="min-h-screen bg-background terminal-scanline">
      <div className="max-w-7xl mx-auto p-2 md:p-4 space-y-3 md:space-y-6">
        {/* Desktop Header - hidden on mobile */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-matrix-green/20 flex items-center justify-center">
              <Terminal className="w-6 h-6 text-matrix-green" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold terminal-gradient">
                CRYPTO HACKER HEIST
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Mining Simulation Protocol v1.0
              </p>
            </div>
          </div>
        </div>

        {/* Heist Event Banner */}
        {showEvent && (
          <HeistEventBanner
            type="bonus"
            message="Double mining rewards for all blocks! Hash faster while it lasts."
            timeLeft="45:23"
          />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Card className="p-2.5 md:p-4">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Gem className="w-3 md:w-4 h-3 md:h-4 text-matrix-green" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">CS Balance</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono text-matrix-green" data-testid="text-cs-balance">
              {userLoading ? '...' : csBalance.toLocaleString()}
            </p>
          </Card>

          <Card className="p-2.5 md:p-4">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Package className="w-3 md:w-4 h-3 md:h-4 text-cyber-blue" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Your Rigs</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono" data-testid="text-rig-count">
              {userLoading ? '...' : totalRigs}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Active</p>
          </Card>

          <Card className="p-2.5 md:p-4">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <TrendingUp className="w-3 md:w-4 h-3 md:h-4 text-neon-orange" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Your HR</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono text-matrix-green" data-testid="text-hashrate">
              {userLoading ? '...' : (user?.totalHashrate ?? 0).toLocaleString()}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground">H/s</p>
          </Card>

          <Card className="p-2.5 md:p-4">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Terminal className="w-3 md:w-4 h-3 md:h-4 text-chart-2" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Network %</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono text-cyber-blue">
              {userLoading ? '...' : '0.00'}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground">of total</p>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-3 md:space-y-6">
            <BlockTimer />
            <HashrateChart />
            <NetworkStats />
          </div>

          {/* Right Column */}
          <div className="space-y-3 md:space-y-6">
            {/* Mining Stats */}
            <Card className="p-3 md:p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Mining Stats</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Total Mined</p>
                  <p className="text-2xl font-bold font-mono text-matrix-green">
                    {totalMined.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">CS</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-md bg-card border border-card-border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Last 24h</p>
                    <p className="text-lg font-bold font-mono text-cyber-blue">
                      {last24hTotal.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-card border border-card-border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Avg/Block</p>
                    <p className="text-lg font-bold font-mono text-neon-orange">
                      {avgPerBlock}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Blocks Participated</span>
                    <span className="font-mono font-semibold">{rewards.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total Earned</span>
                    <Badge variant="outline" className="text-xs">
                      {totalMined.toLocaleString()} CS
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Recent Activity</h3>
              {rewards.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No mining activity yet. Start mining by purchasing equipment!
                </p>
              ) : (
                <div className="space-y-3 text-xs">
                  {rewards.slice(0, 5).map((reward) => (
                    <div 
                      key={reward.id} 
                      className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                    >
                      <span className="text-muted-foreground">
                        Block #{reward.block?.blockNumber ?? '?'}
                      </span>
                      <span className="font-mono text-neon-orange">+{Math.floor(reward.reward)} CS</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
