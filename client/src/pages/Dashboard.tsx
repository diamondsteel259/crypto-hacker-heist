import { useState, useEffect, useRef } from "react";
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
import PrestigeSystem from "@/components/PrestigeSystem";
import { Skeleton } from "@/components/ui/skeleton";
import { Terminal, Gem, Package, TrendingUp, Zap, Shield, Sparkles, Flame, Clock, Gift, Cpu, Coins } from "lucide-react";
import { initializeUser, getCurrentUserId } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
// import { hapticSuccess } from "@/lib/telegram";
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

interface DailyLoginStatus {
  alreadyClaimed: boolean;
  claimedAt?: string;
  streakDay?: number;
  reward?: {
    cs: number;
    chst: number;
    item: string | null;
  };
  nextStreakDay?: number;
  nextReward?: {
    cs: number;
    chst: number;
    item: string | null;
  };
}

interface UserRank {
  hashrateRank: number;
  balanceRank: number;
  totalUsers: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const lastBlockNumberRef = useRef<number | null>(null);
  const lastBalanceRef = useRef<number | null>(null);
  const [isMining, setIsMining] = useState(false);

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

  const { data: latestBlock } = useQuery<any>({
    queryKey: ['/api/blocks/latest'],
    enabled: !!userId,
    refetchInterval: 5000, // Check every 5 seconds for new blocks
  });

  // Mining animation effect - pulse when user has active hashrate
  useEffect(() => {
    if (user && user.totalHashrate > 0) {
      setIsMining(true);
    } else {
      setIsMining(false);
    }
  }, [user]);

  // Monitor for new blocks and show notification if user received reward
  useEffect(() => {
    if (!latestBlock || !user) return;

    const currentBlockNumber = latestBlock.blockNumber;
    const currentBalance = user.csBalance;

    // Initialize refs on first load
    if (lastBlockNumberRef.current === null) {
      lastBlockNumberRef.current = currentBlockNumber;
      lastBalanceRef.current = currentBalance;
      return;
    }

    // Check if a new block was mined
    if (currentBlockNumber > lastBlockNumberRef.current) {
      // Check if user's balance increased (they received a reward)
      if (lastBalanceRef.current !== null && currentBalance > lastBalanceRef.current) {
        const reward = currentBalance - lastBalanceRef.current;
        
        // Show success notification
        // hapticSuccess();
        toast({
          title: "Block Mined! 🎉",
          description: `You earned ${reward.toLocaleString()} CS from Block #${currentBlockNumber}`,
          duration: 5000,
        });
      }

      // Update refs
      lastBlockNumberRef.current = currentBlockNumber;
    }

    // Always update balance ref
    lastBalanceRef.current = currentBalance;
  }, [latestBlock, user, toast]);

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

  const { data: dailyLoginStatus } = useQuery<DailyLoginStatus>({
    queryKey: ['/api/user', userId, 'daily-login', 'status'],
    enabled: !!userId,
  });

  const { data: userRank } = useQuery<UserRank>({
    queryKey: ['/api/user', userId, 'rank'],
    enabled: !!userId,
    refetchInterval: 60000, // Refresh every minute
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

  const claimDailyLoginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/user/${userId}/daily-login/claim`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'daily-login'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'streak'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      toast({
        title: "Daily Reward Claimed! 🎁",
        description: `Day ${data.streakDay}: +${data.reward.cs} CS, +${data.reward.chst} CHST${data.reward.item ? ` + ${data.reward.item}` : ''}`,
        duration: 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Claim Failed",
        description: error.message || "Already claimed today or failed to claim",
        variant: "destructive",
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
        <Card className="p-6 max-w-md border-destructive/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-destructive">Connection Error</h2>
              <p className="text-xs text-muted-foreground">Unable to reach server</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Failed to load user data. Please check your connection and refresh the page to try again.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
            variant="outline"
          >
            Refresh Page
          </Button>
        </Card>
      </div>
    );
  }

  const csBalance = user?.csBalance ?? 0;

  return (
    <div className="min-h-screen bg-background terminal-scanline">
      <div className="max-w-7xl mx-auto p-3 md:p-4 space-y-4 md:space-y-6">
        {/* Welcome Header */}
        <Card className="p-4 md:p-6 bg-gradient-to-r from-matrix-green/10 to-cyber-blue/10 border-matrix-green/20">
          <div className="flex items-center justify-between">
            <div>
              {userLoading ? (
                <>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </>
              ) : (
                <>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">
                    Welcome back, {user?.username || 'Hacker'}!
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Your crypto mining empire at a glance
                  </p>
                </>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Cpu className="w-8 h-8 text-matrix-green animate-pulse" />
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-4 md:p-5 hover:border-matrix-green/50 transition-all stat-glow-green">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 md:w-5 h-4 md:h-5 text-matrix-green" />
              <p className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">CS Balance</p>
            </div>
            {userLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <p className="text-2xl md:text-3xl font-bold font-mono text-matrix-green matrix-glow">
                {user?.csBalance?.toLocaleString() || 0}
              </p>
            )}
            {userRank && !userLoading && (
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                Rank #{userRank.balanceRank} / {userRank.totalUsers}
              </p>
            )}
          </Card>

          <Card className="p-2.5 md:p-4">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Package className="w-3 md:w-4 h-3 md:h-4 text-cyber-blue" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Your Rigs</p>
            </div>
            {userLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-lg md:text-2xl font-bold font-mono" data-testid="text-rig-count">
                {equipment?.length || 0}
              </p>
            )}
            <p className="text-[10px] md:text-xs text-muted-foreground">Active</p>
          </Card>

          <Card className={`p-2.5 md:p-4 relative overflow-hidden ${isMining ? 'border-matrix-green/50 stat-glow-green' : ''}`}>
            {isMining && (
              <div className="absolute inset-0 bg-gradient-to-r from-matrix-green/5 via-matrix-green/10 to-matrix-green/5 animate-pulse" />
            )}
            <div className="relative z-10">
              <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                <TrendingUp className={`w-3 md:w-4 h-3 md:h-4 ${isMining ? 'text-matrix-green animate-pulse' : 'text-neon-orange'}`} />
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Your HR</p>
                {isMining && <Zap className="w-3 h-3 text-matrix-green animate-bounce" />}
              </div>
              {userLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className={`text-lg md:text-2xl font-bold font-mono ${isMining ? 'text-matrix-green matrix-glow' : 'text-foreground'}`} data-testid="text-hashrate">
                  {(user?.totalHashrate ?? 0).toLocaleString()}
                </p>
              )}
              <p className="text-[10px] md:text-xs text-muted-foreground">
                H/s {isMining && '⚡ Mining'}
              </p>
              {userRank && !userLoading && (
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                  Rank #{userRank.hashrateRank} / {userRank.totalUsers}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-2.5 md:p-4 stat-glow-blue"></update><instruction>I am adding glowing effects to stat cards and adding loading skeleton states for when data is loading</instruction>