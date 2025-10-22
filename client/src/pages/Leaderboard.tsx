import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Zap, DollarSign, Crown, Medal, Award } from "lucide-react";
import { getTelegramInitData } from "@/lib/user";

interface LeaderboardUser {
  id: string;
  username: string;
  totalHashrate: number;
  csBalance: number;
  photoUrl?: string;
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<"hashrate" | "balance">("hashrate");

  const { data: hashrateLeaderboard, isLoading: hashrateLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ['/api/leaderboard/hashrate'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const response = await fetch('/api/leaderboard/hashrate?limit=50', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
  });

  const { data: balanceLeaderboard, isLoading: balanceLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ['/api/leaderboard/balance'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const response = await fetch('/api/leaderboard/balance?limit=50', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="text-xs text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-black";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-800 text-white";
      default:
        return "";
    }
  };

  const renderLeaderboard = (users: LeaderboardUser[] | undefined, isLoading: boolean, type: "hashrate" | "balance") => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 bg-muted/30 rounded-md animate-pulse">
              <div className="h-12 bg-muted/50 rounded"></div>
            </div>
          ))}
        </div>
      );
    }

    if (!users || users.length === 0) {
      return (
        <div className="p-8 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No miners yet. Be the first!</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {users.map((user, index) => {
          const rank = index + 1;
          const isTopThree = rank <= 3;

          return (
            <Card
              key={user.id}
              className={`p-4 ${isTopThree ? getRankBadgeColor(rank) : 'bg-muted/30'} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10">
                  {getRankIcon(rank)}
                </div>
                
                <div className="flex-1">
                  <p className={`font-semibold ${isTopThree && rank !== 3 ? '' : 'text-foreground'}`}>
                    {user.username}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {type === "hashrate" ? (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyber-blue" />
                        <span className={`text-xs font-mono ${isTopThree && rank !== 3 ? 'opacity-90' : 'text-cyber-blue'}`}>
                          {user.totalHashrate.toLocaleString()} H/s
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-matrix-green" />
                        <span className={`text-xs font-mono ${isTopThree && rank !== 3 ? 'opacity-90' : 'text-matrix-green'}`}>
                          {user.csBalance.toLocaleString()} CS
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isTopThree && (
                  <Badge className={getRankBadgeColor(rank) + " text-xs"}>
                    Top {rank}
                  </Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-2 md:p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-yellow-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold terminal-gradient">Leaderboard</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Top Miners & Richest Players
            </p>
          </div>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "hashrate" | "balance")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hashrate" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Top Hashrate</span>
            </TabsTrigger>
            <TabsTrigger value="balance" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Top Balance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hashrate" className="mt-4">
            {renderLeaderboard(hashrateLeaderboard, hashrateLoading, "hashrate")}
          </TabsContent>

          <TabsContent value="balance" className="mt-4">
            {renderLeaderboard(balanceLeaderboard, balanceLoading, "balance")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
