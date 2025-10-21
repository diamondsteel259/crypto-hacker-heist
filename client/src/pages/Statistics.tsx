import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Gem, Zap, Users, Trophy, DollarSign, Target } from "lucide-react";
import { initializeUser } from "@/lib/user";
import type { User } from "@shared/schema";

interface UserStatistics {
  totalCsEarned: number;
  totalChstEarned: number;
  totalBlocksMined: number;
  bestBlockReward: number;
  highestHashrate: number;
  totalTonSpent: string;
  totalCsSpent: number;
  totalReferrals: number;
  achievementsUnlocked: number;
}

export default function Statistics() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeUser()
      .then(setUserId)
      .catch(err => console.error('Failed to initialize user:', err));
  }, []);

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user', userId],
    enabled: !!userId,
  });

  const { data: statistics, isLoading } = useQuery<UserStatistics>({
    queryKey: ['/api/user', userId, 'statistics'],
    enabled: !!userId,
  });

  if (isLoading || !statistics) {
    return (
      <div className="min-h-screen bg-background p-3">
        <div className="max-w-6xl mx-auto">
          <Card className="p-6">
            <p className="text-muted-foreground">Loading statistics...</p>
          </Card>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: Gem,
      label: "Total CS Earned",
      value: statistics.totalCsEarned.toLocaleString(),
      suffix: "CS",
      color: "text-matrix-green",
      bgColor: "bg-matrix-green/20",
    },
    {
      icon: Gem,
      label: "Total CHST Earned",
      value: statistics.totalChstEarned.toLocaleString(),
      suffix: "CHST",
      color: "text-cyber-blue",
      bgColor: "bg-cyber-blue/20",
    },
    {
      icon: Target,
      label: "Blocks Mined",
      value: statistics.totalBlocksMined.toLocaleString(),
      suffix: "blocks",
      color: "text-neon-orange",
      bgColor: "bg-neon-orange/20",
    },
    {
      icon: TrendingUp,
      label: "Best Block Reward",
      value: statistics.bestBlockReward.toLocaleString(),
      suffix: "CS",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/20",
    },
    {
      icon: Zap,
      label: "Highest Hashrate",
      value: statistics.highestHashrate.toLocaleString(),
      suffix: "H/s",
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
    },
    {
      icon: DollarSign,
      label: "Total TON Spent",
      value: parseFloat(statistics.totalTonSpent).toFixed(2),
      suffix: "TON",
      color: "text-blue-500",
      bgColor: "bg-blue-500/20",
    },
    {
      icon: Gem,
      label: "Total CS Spent",
      value: statistics.totalCsSpent.toLocaleString(),
      suffix: "CS",
      color: "text-red-500",
      bgColor: "bg-red-500/20",
    },
    {
      icon: Users,
      label: "Total Referrals",
      value: statistics.totalReferrals.toLocaleString(),
      suffix: "friends",
      color: "text-green-500",
      bgColor: "bg-green-500/20",
    },
    {
      icon: Trophy,
      label: "Achievements Unlocked",
      value: statistics.achievementsUnlocked.toLocaleString(),
      suffix: "badges",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/20",
    },
  ];

  const currentStats = [
    {
      label: "Current CS Balance",
      value: user?.csBalance.toLocaleString() || "0",
      suffix: "CS",
      color: "text-matrix-green",
    },
    {
      label: "Current CHST Balance",
      value: user?.chstBalance.toLocaleString() || "0",
      suffix: "CHST",
      color: "text-cyber-blue",
    },
    {
      label: "Current Hashrate",
      value: user?.totalHashrate.toLocaleString() || "0",
      suffix: "H/s",
      color: "text-neon-orange",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Your Statistics</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Track your progress and achievements
            </p>
          </div>
        </div>

        {/* Current Stats */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-matrix-green" />
            Current Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentStats.map((stat, index) => (
              <Card key={index} className="p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold font-mono ${stat.color}`}>
                  {stat.value} <span className="text-base">{stat.suffix}</span>
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Lifetime Stats */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Lifetime Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-4 hover:border-primary transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-xl font-bold font-mono">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.suffix}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Milestones */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Milestones Reached
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-3xl mb-1">🎯</p>
              <p className="text-xs text-muted-foreground">First Equipment</p>
              <Badge variant="outline" className="mt-2">Completed</Badge>
            </div>
            <div className={`text-center p-3 rounded-lg ${
              statistics.totalBlocksMined >= 100 ? 'bg-green-500/20' : 'bg-muted/30'
            }`}>
              <p className="text-3xl mb-1">⛏️</p>
              <p className="text-xs text-muted-foreground">100 Blocks Mined</p>
              <Badge variant={statistics.totalBlocksMined >= 100 ? "default" : "outline"} className="mt-2">
                {statistics.totalBlocksMined >= 100 ? 'Completed' : `${statistics.totalBlocksMined}/100`}
              </Badge>
            </div>
            <div className={`text-center p-3 rounded-lg ${
              statistics.totalReferrals >= 10 ? 'bg-green-500/20' : 'bg-muted/30'
            }`}>
              <p className="text-3xl mb-1">👥</p>
              <p className="text-xs text-muted-foreground">10 Referrals</p>
              <Badge variant={statistics.totalReferrals >= 10 ? "default" : "outline"} className="mt-2">
                {statistics.totalReferrals >= 10 ? 'Completed' : `${statistics.totalReferrals}/10`}
              </Badge>
            </div>
            <div className={`text-center p-3 rounded-lg ${
              parseFloat(statistics.totalTonSpent) >= 10 ? 'bg-green-500/20' : 'bg-muted/30'
            }`}>
              <p className="text-3xl mb-1">💎</p>
              <p className="text-xs text-muted-foreground">10 TON Spent</p>
              <Badge variant={parseFloat(statistics.totalTonSpent) >= 10 ? "default" : "outline"} className="mt-2">
                {parseFloat(statistics.totalTonSpent) >= 10 ? 'Completed' : `${parseFloat(statistics.totalTonSpent).toFixed(1)}/10`}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            📊 <strong>Stats Update:</strong> Your statistics are updated in real-time as you mine, purchase, and complete challenges!
          </p>
        </Card>
      </div>
    </div>
  );
}
