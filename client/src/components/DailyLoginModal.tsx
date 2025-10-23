import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Coins, Gem } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { hapticSuccess } from "@/lib/telegram";

interface DailyLoginModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  streakDay: number;
  reward: {
    cs: number;
    chst: number;
    item: string | null;
  };
}

export function DailyLoginModal({
  open,
  onClose,
  userId,
  streakDay,
  reward,
}: DailyLoginModalProps) {
  const { toast } = useToast();

  const claimMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/user/${userId}/daily-login/claim`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'daily-login'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'streak'] });

      hapticSuccess();
      toast({
        title: "Daily Reward Claimed! 🎁",
        description: `Day ${data.streakDay}: +${data.reward.cs} CS, +${data.reward.chst} CHST${data.reward.item ? ` + ${data.reward.item}` : ''}`,
        duration: 5000,
      });

      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Claim Failed",
        description: error.message || "Unable to claim reward",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-orange-500/20 via-background to-red-500/20 border-orange-500/50">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Gift className="w-8 h-8 text-orange-500" />
            Daily Login Reward
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          {/* Streak Day Badge */}
          <Badge className="text-2xl font-bold px-6 py-3 bg-orange-500">
            Day {streakDay}
          </Badge>

          {/* Rewards Display */}
          <div className="w-full space-y-3 bg-background/50 rounded-lg p-6 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-6 h-6 text-matrix-green" />
                <span className="text-sm text-muted-foreground">Cipher Shards</span>
              </div>
              <span className="text-2xl font-bold text-matrix-green font-mono">
                +{reward.cs.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gem className="w-6 h-6 text-purple-400" />
                <span className="text-sm text-muted-foreground">Heist Tokens</span>
              </div>
              <span className="text-2xl font-bold text-purple-400 font-mono">
                +{reward.chst}
              </span>
            </div>

            {reward.item && (
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">Bonus Item</span>
                </div>
                <span className="text-lg font-semibold text-yellow-400 capitalize">
                  {reward.item.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>

          {/* Claim Button */}
          <Button
            size="lg"
            onClick={() => claimMutation.mutate()}
            disabled={claimMutation.isPending}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg font-semibold"
          >
            {claimMutation.isPending ? (
              "Claiming..."
            ) : (
              <>
                <Gift className="w-5 h-5 mr-2" />
                Claim Reward
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Come back tomorrow to continue your streak!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
