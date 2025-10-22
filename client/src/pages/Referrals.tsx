import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Gift, Copy, Share2, CalendarDays, Trophy, Star } from "lucide-react";
import { initializeUser, getCurrentUserId } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getTelegramInitData } from "@/lib/user";
import type { User, Referral } from "@shared/schema";
import { format } from "date-fns";

type ReferralWithReferee = Referral & { referee: User };

interface ReferralLeaderboardEntry {
  id: string;
  username: string;
  photoUrl?: string;
  referralCount: number;
  totalBonus: number;
}

export default function Referrals() {
  const [userId, setUserId] = useState<string | null>(null);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    initializeUser()
      .then(setUserId)
      .catch(err => {
        console.error('Failed to initialize user:', err);
      });
  }, []);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/user', userId],
    enabled: !!userId,
  });

  const { data: referrals = [], isLoading: referralsLoading } = useQuery<ReferralWithReferee[]>({
    queryKey: ['/api/user', userId, 'referrals'],
    enabled: !!userId,
  });

  const { data: referralLeaderboard = [], isLoading: leaderboardLoading } = useQuery<ReferralLeaderboardEntry[]>({
    queryKey: ['/api/leaderboard/referrals'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const response = await fetch('/api/leaderboard/referrals?limit=25', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
  });

  const applyReferralMutation = useMutation({
    mutationFn: async (referralCode: string) => {
      const response = await apiRequest(
        'POST',
        `/api/user/${userId}/referrals/apply`,
        { referralCode }
      );
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Referral Code Applied!",
        description: `You earned ${data.userBonus} CS! Your referrer earned ${data.referrerBonus} CS.`,
      });
      setReferralCodeInput("");
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'referrals'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to apply referral code",
        variant: "destructive",
      });
    },
  });

  const handleCopyReferralLink = () => {
    if (!user?.referralCode) return;
    
    const botUsername = import.meta.env.VITE_BOT_USERNAME || "cryptohackerheist_bot";
    const link = `https://t.me/${botUsername}?start=${user.referralCode}`;
    
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const handleShareReferral = () => {
    if (!user?.referralCode) return;
    
    const botUsername = import.meta.env.VITE_BOT_USERNAME || "cryptohackerheist_bot";
    const link = `https://t.me/${botUsername}?start=${user.referralCode}`;
    const text = `Join me on Crypto Hacker Heist and start mining crypto! Use my referral link to get bonus CS:`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    
    window.open(shareUrl, '_blank');
  };

  const handleApplyReferralCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCodeInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a referral code",
        variant: "destructive",
      });
      return;
    }
    applyReferralMutation.mutate(referralCodeInput.trim());
  };

  const totalBonusEarned = referrals.reduce((sum, ref) => sum + ref.bonusEarned, 0);
  const canApplyReferralCode = user && !user.referredBy;

  // Referral milestones
  const milestones = [
    { count: 5, reward: '5,000 CS', icon: Star, reached: referrals.length >= 5 },
    { count: 10, reward: '15,000 CS', icon: Star, reached: referrals.length >= 10 },
    { count: 25, reward: '50,000 CS', icon: Trophy, reached: referrals.length >= 25 },
    { count: 50, reward: '150,000 CS', icon: Trophy, reached: referrals.length >= 50 },
    { count: 100, reward: '500,000 CS', icon: Trophy, reached: referrals.length >= 100 },
  ];

  const nextMilestone = milestones.find(m => !m.reached);
  const progress = nextMilestone ? (referrals.length / nextMilestone.count) * 100 : 100;

  return (
    <div className="min-h-screen bg-background terminal-scanline">
      <div className="max-w-5xl mx-auto p-3 space-y-4">

        <div className="grid grid-cols-1 gap-3">
          {/* Your Referral Panel */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-matrix-green" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Your Referrals</h3>
              </div>
              <Badge variant="outline" className="text-xs" data-testid="badge-referral-count">
                {referralsLoading ? '...' : referrals.length} Friends
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-md bg-matrix-green/10 border border-matrix-green/30">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-matrix-green" />
                  <p className="text-xs font-semibold uppercase tracking-wider">Rewards</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Earn <span className="font-bold text-matrix-green">1,000 CS</span> when friends join. 
                  They get <span className="font-bold text-cyber-blue">2,000 CS</span> bonus too!
                </p>
              </div>

              {/* Referral Milestones */}
              {nextMilestone && (
                <div className="p-4 rounded-md bg-purple-500/10 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <p className="text-xs font-semibold uppercase tracking-wider">Next Milestone</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {referrals.length} / {nextMilestone.count} referrals
                      </span>
                      <span className="font-bold text-purple-400">{nextMilestone.reward}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {milestones.map((milestone) => (
                        <Badge
                          key={milestone.count}
                          variant={milestone.reached ? "default" : "outline"}
                          className={milestone.reached ? "bg-purple-500" : ""}
                        >
                          {milestone.count} • {milestone.reward}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  Your Referral Link
                </label>
                <div className="flex gap-2">
                  <Input
                    value={
                      userLoading 
                        ? 'Loading...' 
                        : user?.referralCode 
                          ? `t.me/${import.meta.env.VITE_BOT_USERNAME || 'cryptohackerheist_bot'}?start=${user.referralCode}`
                          : ''
                    }
                    readOnly
                    className="font-mono text-xs"
                    data-testid="input-referral-link"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyReferralLink}
                    disabled={!user?.referralCode}
                    data-testid="button-copy-referral"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleShareReferral}
                    disabled={!user?.referralCode}
                    data-testid="button-share-referral"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Your referrals have earned you:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-md bg-muted/30">
                    <p className="text-2xl font-bold font-mono text-matrix-green" data-testid="text-total-bonus">
                      {referralsLoading ? '...' : totalBonusEarned.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Total CS</p>
                  </div>
                  <div className="text-center p-3 rounded-md bg-muted/30">
                    <p className="text-2xl font-bold font-mono text-cyber-blue" data-testid="text-referral-count">
                      {referralsLoading ? '...' : referrals.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Referrals</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Apply Referral Code / Referred Users */}
          <div className="space-y-3 md:space-y-6">
            {canApplyReferralCode && (
              <Card className="p-4 md:p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                  Have a Referral Code?
                </h3>
                <form onSubmit={handleApplyReferralCode} className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                      Enter Referral Code
                    </label>
                    <Input
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value)}
                      placeholder="HACK4F2X"
                      className="font-mono"
                      data-testid="input-apply-referral-code"
                      disabled={applyReferralMutation.isPending}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={applyReferralMutation.isPending || !referralCodeInput.trim()}
                    data-testid="button-apply-referral"
                  >
                    {applyReferralMutation.isPending ? 'Applying...' : 'Apply Code & Earn 2,000 CS'}
                  </Button>
                </form>
              </Card>
            )}

            {/* Your Referred Users */}
            <Card className="p-4 md:p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
                Your Referred Users
              </h3>
              {referralsLoading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Loading...
                </div>
              ) : referrals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No referrals yet. Share your link to start earning!
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="p-3 rounded-md bg-card border border-card-border hover-elevate transition-all"
                      data-testid={`referral-item-${referral.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-sm" data-testid={`text-referee-name-${referral.id}`}>
                            {referral.referee.username || referral.referee.firstName || 'Anonymous User'}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <CalendarDays className="w-3 h-3" />
                            <span data-testid={`text-join-date-${referral.id}`}>
                              Joined {format(new Date(referral.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-semibold text-matrix-green text-sm" data-testid={`text-bonus-${referral.id}`}>
                            +{referral.bonusEarned.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">CS</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Top Referrers Leaderboard */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-matrix-green" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Top Referrers</h3>
          </div>

          {leaderboardLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Loading leaderboard...
            </div>
          ) : referralLeaderboard.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No referrers yet. Be the first to invite friends!
            </div>
          ) : (
            <div className="space-y-2">
              {referralLeaderboard.map((entry, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;
                const rankColors = {
                  1: 'text-yellow-400',
                  2: 'text-gray-400',
                  3: 'text-amber-700',
                };

                return (
                  <div
                    key={entry.id}
                    className={`p-3 rounded-md ${
                      isTopThree
                        ? 'bg-gradient-to-r from-matrix-green/20 to-cyber-blue/20 border border-matrix-green/30'
                        : 'bg-card border border-card-border'
                    } hover-elevate transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${rankColors[rank as keyof typeof rankColors] || 'text-muted-foreground'}`}>
                        #{rank}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{entry.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.referralCount} referral{entry.referralCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold text-matrix-green text-sm">
                          {entry.totalBonus.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">CS earned</p>
                      </div>
                    </div>
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
