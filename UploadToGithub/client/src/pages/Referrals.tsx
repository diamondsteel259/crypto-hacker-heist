import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, TrendingUp, Gift, Copy, Share2, CalendarDays } from "lucide-react";
import { initializeUser, getCurrentUserId } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Referral } from "@shared/schema";
import { format } from "date-fns";

type ReferralWithReferee = Referral & { referee: User };

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

  // Top referrers mock data (can be replaced with real API later)
  const topReferrers = [
    { rank: 1, name: "CryptoMaster", referrals: 156, earned: 78000 },
    { rank: 2, name: "HashKing", referrals: 142, earned: 71000 },
    { rank: 3, name: "BlockChamp", referrals: 128, earned: 64000 },
    { rank: 4, name: "MineQueen", referrals: 95, earned: 47500 },
    { rank: 5, name: "CodeHacker", referrals: 87, earned: 43500 },
  ];

  return (
    <div className="min-h-screen bg-background terminal-scanline">
      <div className="max-w-5xl mx-auto p-2 md:p-4 space-y-3 md:space-y-6">
        {/* Desktop Header - hidden on mobile */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-matrix-green/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-matrix-green" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Referral Program</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Invite friends and earn rewards
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topReferrers.map((user) => (
              <div
                key={user.rank}
                className="p-4 rounded-md bg-card border border-card-border hover-elevate transition-all"
                data-testid={`top-referrer-${user.rank}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`w-8 h-8 flex items-center justify-center ${
                        user.rank === 1
                          ? "bg-neon-orange/20 text-neon-orange border-neon-orange/30"
                          : user.rank === 2
                          ? "bg-muted text-foreground"
                          : user.rank === 3
                          ? "bg-chart-3/20 text-chart-3 border-chart-3/30"
                          : ""
                      }`}
                    >
                      #{user.rank}
                    </Badge>
                    <div>
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.referrals} referrals
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-matrix-green text-sm">
                      {user.earned.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">CS earned</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
