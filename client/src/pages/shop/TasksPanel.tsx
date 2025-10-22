import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, Crown, Gem, Gift, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TasksPanelProps {
  userId: string | null;
}

export default function TasksPanel({ userId }: TasksPanelProps) {
  const { toast } = useToast();

  const taskClaimMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest("POST", `/api/user/${userId}/tasks/claim`, {
        taskId
      });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      toast({
        title: "Task completed!",
        description: data.reward ? `You earned ${data.reward} CS!` : "Reward claimed successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Task claim failed",
        description: error.message || "Failed to claim task reward. Please try again.",
        variant: "destructive"
      });
    },
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 className="w-5 h-5 text-matrix-green" />
          <h3 className="text-lg font-semibold">Daily Tasks</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Complete daily tasks to earn rewards and free loot boxes
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-matrix-green/10 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-matrix-green" />
              <div>
                <p className="font-medium">Mine Your First Block</p>
                <p className="text-sm text-muted-foreground">Purchase any equipment to start mining</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-matrix-green hover:bg-matrix-green/90 text-black"
              onClick={() => taskClaimMutation.mutate("mine-first-block")}
              disabled={taskClaimMutation.isPending}
            >
              {taskClaimMutation.isPending ? "Claiming..." : "Claim 1,000 CS"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-cyber-blue/10 rounded-lg">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-cyber-blue" />
              <div>
                <p className="font-medium">Reach 1,000 H/s</p>
                <p className="text-sm text-muted-foreground">Accumulate 1,000 total hashrate</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-cyber-blue hover:bg-cyber-blue/90 text-white"
              onClick={() => taskClaimMutation.mutate("reach-1000-hashrate")}
              disabled={taskClaimMutation.isPending}
            >
              {taskClaimMutation.isPending ? "Claiming..." : "Claim 2,000 CS"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-neon-orange/10 rounded-lg">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-neon-orange" />
              <div>
                <p className="font-medium">Buy Your First ASIC</p>
                <p className="text-sm text-muted-foreground">Purchase any ASIC mining rig</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-neon-orange hover:bg-neon-orange/90 text-white"
              onClick={() => taskClaimMutation.mutate("buy-first-asic")}
              disabled={taskClaimMutation.isPending}
            >
              {taskClaimMutation.isPending ? "Claiming..." : "Claim Free Loot Box"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Gem className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-semibold">Referral Tasks</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Invite friends to earn bonus rewards
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-pink-500/10 rounded-lg">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-pink-500" />
              <div>
                <p className="font-medium">Invite 1 Friend</p>
                <p className="text-sm text-muted-foreground">Get them to join the network</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-pink-500 hover:bg-pink-500/90 text-white"
              onClick={() => taskClaimMutation.mutate("invite-1-friend")}
              disabled={taskClaimMutation.isPending}
            >
              {taskClaimMutation.isPending ? "Claiming..." : "Claim 5,000 CS"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium">Invite 5 Friends</p>
                <p className="text-sm text-muted-foreground">Build your mining network</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-purple-500 hover:bg-purple-500/90 text-white"
              onClick={() => taskClaimMutation.mutate("invite-5-friends")}
              disabled={taskClaimMutation.isPending}
            >
              {taskClaimMutation.isPending ? "Claiming..." : "Claim Premium Loot Box"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
