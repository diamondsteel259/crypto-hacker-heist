import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Lock, Gift, TrendingUp } from "lucide-react";
import { initializeUser } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Achievement {
  id: number;
  achievementId: string;
  name: string;
  description: string;
  requirement: string;
  category: string;
  rewardCs: number | null;
  rewardChst: number | null;
  rewardItem: string | null;
  badgeIcon: string | null;
  isActive: boolean;
  orderIndex: number;
  unlocked: boolean;
  unlockedAt?: string;
}

interface AchievementsResponse {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

export default function Achievements() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    initializeUser()
      .then(setUserId)
      .catch(err => console.error('Failed to initialize user:', err));
  }, []);

  const { data: achievementsData, isLoading } = useQuery<AchievementsResponse>({
    queryKey: ['/api/user', userId, 'achievements'],
    enabled: !!userId,
  });

  const checkAchievementsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/user/${userId}/achievements/check`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'achievements'] });
      if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
        toast({
          title: "New Achievements!",
          description: `Unlocked ${data.newlyUnlocked.length} achievements!`,
        });
      }
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      const response = await apiRequest('POST', `/api/user/${userId}/achievements/${achievementId}/claim`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'achievements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      toast({
        title: "Reward Claimed!",
        description: data.message || "Achievement reward received!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim reward",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !achievementsData) {
    return (
      <div className="min-h-screen bg-background p-3">
        <div className="max-w-5xl mx-auto">
          <Card className="p-6">
            <p className="text-muted-foreground">Loading achievements...</p>
          </Card>
        </div>
      </div>
    );
  }

  const categories = ["all", "milestone", "social", "spending", "mining"];
  const filteredAchievements = selectedCategory === "all"
    ? achievementsData.achievements
    : achievementsData.achievements.filter(a => a.category === selectedCategory);

  const completionPercent = (achievementsData.unlockedCount / achievementsData.totalCount) * 100;

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Achievements</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Unlock badges and earn rewards
            </p>
          </div>
          <Button
            onClick={() => checkAchievementsMutation.mutate()}
            disabled={checkAchievementsMutation.isPending}
            size="sm"
            variant="outline"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Check Progress
          </Button>
        </div>

        {/* Progress Overview */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <p className="font-semibold">Overall Progress</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {achievementsData.unlockedCount} / {achievementsData.totalCount}
            </Badge>
          </div>
          <Progress value={completionPercent} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {achievementsData.unlockedCount === achievementsData.totalCount
              ? "🏆 Completed all achievements!"
              : `${achievementsData.totalCount - achievementsData.unlockedCount} achievements remaining`}
          </p>
        </Card>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => (
            <Card
              key={achievement.achievementId}
              className={`p-4 transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/50'
                  : 'bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Badge Icon */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                    : 'bg-muted'
                }`}>
                  {achievement.unlocked ? (
                    <span>{achievement.badgeIcon || "🏆"}</span>
                  ) : (
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-base">{achievement.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    <Badge
                      variant={achievement.unlocked ? "default" : "outline"}
                      className={`text-xs flex-shrink-0 ${
                        achievement.unlocked ? 'bg-yellow-500' : ''
                      }`}
                    >
                      {achievement.category}
                    </Badge>
                  </div>

                  {/* Rewards */}
                  {(achievement.rewardCs || achievement.rewardChst || achievement.rewardItem) && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-background/50 rounded">
                      <Gift className="w-4 h-4 text-matrix-green" />
                      <span className="text-xs font-mono text-matrix-green">
                        {achievement.rewardCs && `${achievement.rewardCs.toLocaleString()} CS`}
                        {achievement.rewardChst && ` + ${achievement.rewardChst} CHST`}
                        {achievement.rewardItem && ` + ${achievement.rewardItem}`}
                      </span>
                    </div>
                  )}

                  {/* Unlock Date */}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}

                  {/* Claim Button (if unlocked but not claimed) */}
                  {achievement.unlocked && achievement.rewardCs && (
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => claimMutation.mutate(achievement.achievementId)}
                      disabled={claimMutation.isPending}
                    >
                      {claimMutation.isPending ? "Claiming..." : "Claim Reward"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No achievements in this category yet.
            </p>
          </Card>
        )}

        {/* Info Card */}
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Achievements are automatically checked when you reach milestones. Click "Check Progress" to manually check for newly unlocked achievements!
          </p>
        </Card>
      </div>
    </div>
  );
}
