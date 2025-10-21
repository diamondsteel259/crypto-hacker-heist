import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle, Gift, Zap, Target } from "lucide-react";
import { initializeUser } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Challenge {
  id: number;
  challengeId: string;
  name: string;
  description: string;
  requirement: string;
  rewardCs: number;
  rewardChst: number | null;
  rewardItem: string | null;
  isActive: boolean;
  completed: boolean;
}

interface ChallengesResponse {
  challenges: Challenge[];
  completedCount: number;
  totalCount: number;
}

export default function Challenges() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeUser()
      .then(setUserId)
      .catch(err => console.error('Failed to initialize user:', err));
  }, []);

  const { data: challengesData, isLoading } = useQuery<ChallengesResponse>({
    queryKey: ['/api/user', userId, 'challenges', 'today'],
    enabled: !!userId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const completeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const response = await apiRequest('POST', `/api/user/${userId}/challenges/${challengeId}/complete`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'challenges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      toast({
        title: "Challenge Completed!",
        description: data.message || "Reward claimed!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete challenge",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !challengesData) {
    return (
      <div className="min-h-screen bg-background p-3">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <p className="text-muted-foreground">Loading challenges...</p>
          </Card>
        </div>
      </div>
    );
  }

  const completionPercent = (challengesData.completedCount / challengesData.totalCount) * 100;

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Daily Challenges</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Complete {challengesData.totalCount} challenges every day
            </p>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <p className="font-semibold">Daily Progress</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {challengesData.completedCount} / {challengesData.totalCount}
            </Badge>
          </div>
          <Progress value={completionPercent} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {challengesData.completedCount === challengesData.totalCount
              ? "🎉 All challenges completed! Come back tomorrow for new challenges."
              : `Complete ${challengesData.totalCount - challengesData.completedCount} more to finish today's challenges`}
          </p>
        </Card>

        {/* Challenges List */}
        <div className="space-y-3">
          {challengesData.challenges.map((challenge) => (
            <Card
              key={challenge.challengeId}
              className={`p-4 transition-all ${
                challenge.completed
                  ? 'bg-muted/30 border-green-500/50'
                  : 'hover:border-primary'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  challenge.completed
                    ? 'bg-green-500/20'
                    : 'bg-primary/20'
                }`}>
                  {challenge.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-primary" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-base">{challenge.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {challenge.description}
                      </p>
                    </div>
                    {challenge.completed && (
                      <Badge variant="default" className="bg-green-500 flex-shrink-0">
                        Completed
                      </Badge>
                    )}
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-matrix-green" />
                      <span className="text-sm font-mono text-matrix-green font-semibold">
                        {challenge.rewardCs > 0 && `${challenge.rewardCs.toLocaleString()} CS`}
                        {challenge.rewardChst && challenge.rewardChst > 0 && ` + ${challenge.rewardChst} CHST`}
                        {challenge.rewardItem && ` + ${challenge.rewardItem}`}
                      </span>
                    </div>
                  </div>

                  {/* Manual complete button for testing - remove in production */}
                  {!challenge.completed && (
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => completeMutation.mutate(challenge.challengeId)}
                      disabled={completeMutation.isPending}
                    >
                      {completeMutation.isPending ? "Completing..." : "Mark Complete (Test)"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Challenges reset every 24 hours at midnight UTC. Complete all challenges to maximize your daily rewards!
          </p>
        </Card>
      </div>
    </div>
  );
}
