import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BlockTimer from "@/components/BlockTimer";
import NetworkStats from "@/components/NetworkStats";
import HashrateChart from "@/components/HashrateChart";
import RecentBlocks from "@/components/RecentBlocks";
import MiningCalendar from "@/components/MiningCalendar";
import PriceAlerts from "@/components/PriceAlerts";
import ActiveSeason from "@/components/ActiveSeason";
import { Terminal, Gem, Package, TrendingUp, Zap, Shield, Sparkles, Flame, Clock, Gift } from "lucide-react";
import { initializeUser, getCurrentUserId } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface ActivePowerUp {
  power_up_type: string;
  boost_percentage: number;
  activated_at: string;
  expires_at: string;
  time_remaining_minutes: number;
  time_remaining_seconds: number;
}

interface ActivePowerUpsResponse {
  active_power_ups: ActivePowerUp[];
  effects: {
    total_hashrate_boost: number;
    total_luck_boost: number;
  };
}

interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
}

interface HourlyBonusStatus {
  available: boolean;
  nextAvailableAt: string | null;
  minutesRemaining: number;
}

export default function Dashboard() {
  const { toast } = useToast();
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

  const { data: equipment } = useQuery<any[]>({
    queryKey: ['/api/user', userId, 'equipment'],
    enabled: !!userId,
  });

  const { data: networkStats } = useQuery<any>({
    queryKey: ['/api/user', userId, 'network-stats'],
    enabled: !!userId,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: activePowerUps } = useQuery<ActivePowerUpsResponse>({
    queryKey: ['/api/user', userId, 'powerups', 'active'],
    enabled: !!userId,
    refetchInterval: 10000, // Refresh every 10 seconds to update time remaining
  });

  const { data: streak } = useQuery<UserStreak>({
    queryKey: ['/api/user', userId, 'streak'],
    enabled: !!userId,
  });

  const { data: hourlyBonusStatus } = useQuery<HourlyBonusStatus>({
    queryKey: ['/api/user', userId, 'hourly-bonus', 'status'],
    enabled: !!userId,
    refetchInterval: 60000, // Check every minute
  });

  const checkinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/user/${userId}/streak/checkin`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'streak'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      toast({
        title: "Daily Check-in!",
        description: data.message || `Earned ${data.reward} CS!`,
      });
    },
  });

  const claimHourlyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/user/${userId}/hourly-bonus/claim`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'hourly-bonus'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      toast({
        title: "Bonus Claimed!",
        description: data.message || `Earned ${data.reward} CS!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim hourly bonus",
        variant: "destructive",
      });
    },
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

  return (
    <div className="min-h-screen bg-background terminal-scanline">
      <div className="max-w-7xl mx-auto p-3 space-y-4">

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
              {equipment?.length || 0}
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
              {networkStats?.userSharePercentage?.toFixed(2) || '0.00'}%
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground">of total</p>
          </Card>
        </div>

        {/* Streak & Hourly Bonus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Streak Bonus */}
          {streak && (
            <Card className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h3 className="text-sm md:text-base font-semibold">Daily Streak</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {streak.currentStreak} days
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold font-mono text-orange-500">
                    {streak.currentStreak}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Best: {streak.longestStreak} days
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => checkinMutation.mutate()}
                  disabled={checkinMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {checkinMutation.isPending ? "Checking..." : "Check In"}
                </Button>
              </div>
            </Card>
          )}

          {/* Hourly Bonus */}
          {hourlyBonusStatus && (
            <Card className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  <h3 className="text-sm md:text-base font-semibold">Hourly Bonus</h3>
                </div>
                {hourlyBonusStatus.available ? (
                  <Badge variant="default" className="text-xs bg-green-500">
                    <Gift className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    {hourlyBonusStatus.minutesRemaining}m left
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-green-500">
                    500-2,000 CS
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Random reward
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => claimHourlyMutation.mutate()}
                  disabled={!hourlyBonusStatus.available || claimHourlyMutation.isPending}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {claimHourlyMutation.isPending ? "Claiming..." : "Claim Now"}
                </Button>
              </div>
            </Card>
          )}
        </div>
        {/* Active Season */}
        <ActiveSeason />


        {/* Active Power-Ups */}
        {activePowerUps && activePowerUps.active_power_ups && activePowerUps.active_power_ups.length > 0 && (
          <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 md:w-5 h-4 md:h-5 text-yellow-500" />
              <h3 className="text-sm md:text-base font-semibold">Active Power-Ups</h3>
              <Badge variant="secondary" className="text-[10px] md:text-xs">
                {activePowerUps.active_power_ups.length} Active
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activePowerUps.active_power_ups.map((powerUp, index) => {
                const Icon = powerUp.power_up_type === 'hashrate-boost' ? Shield : Sparkles;
                const color = powerUp.power_up_type === 'hashrate-boost' ? 'text-cyan-400' : 'text-pink-400';
                const minutes = Math.floor(powerUp.time_remaining_seconds / 60);
                const seconds = powerUp.time_remaining_seconds % 60;
                
                return (
                  <div key={index} className="p-3 bg-background/50 rounded-lg border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <p className="text-xs md:text-sm font-medium">
                        {powerUp.power_up_type === 'hashrate-boost' ? 'Hashrate Boost' : 'Luck Boost'}
                      </p>
                    </div>
                    <p className="text-lg md:text-2xl font-bold font-mono text-matrix-green">
                      +{powerUp.boost_percentage}%
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                      {minutes}m {seconds}s remaining
                    </p>
                  </div>
                );
              })}
            </div>
            {activePowerUps.effects && (activePowerUps.effects.total_hashrate_boost > 0 || activePowerUps.effects.total_luck_boost > 0) && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Total Effects:</span>{' '}
                  {activePowerUps.effects.total_hashrate_boost > 0 && `+${activePowerUps.effects.total_hashrate_boost}% Hashrate `}
                  {activePowerUps.effects.total_luck_boost > 0 && `+${activePowerUps.effects.total_luck_boost}% Luck`}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-3 md:space-y-6">
            <BlockTimer 
              onBlockMined={() => console.log('Block mined!')} 
              userHashrate={user?.totalHashrate || 0}
            />
            <HashrateChart />
            <NetworkStats />
          </div>

          {/* Right Column */}
          <div className="space-y-3 md:space-y-6">
            <RecentBlocks />
            <MiningCalendar />
            <PriceAlerts />
          </div>
        </div>
      </div>
    </div>
  );
}
