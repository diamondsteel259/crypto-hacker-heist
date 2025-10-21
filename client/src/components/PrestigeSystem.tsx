import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Award, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserId } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PrestigeInfo {
  prestige: {
    id: number;
    userId: string;
    prestigeLevel: number;
    totalPrestiges: number;
    lastPrestigeAt: string | null;
  } | null;
  history: any[];
  eligible: boolean;
  currentBoost: number;
}

export default function PrestigeSystem() {
  const { toast } = useToast();
  const userId = getCurrentUserId();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: prestigeInfo } = useQuery<PrestigeInfo>({
    queryKey: ["/api/user", userId, "prestige"],
    enabled: !!userId,
  });

  const prestigeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/user/${userId}/prestige/execute`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "prestige"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "equipment"] });
      toast({
        title: `Prestige ${data.newPrestigeLevel} Achieved! 🌟`,
        description: `You now have +${data.permanentBoost}% permanent boost to all earnings!`,
      });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Prestige Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!prestigeInfo?.prestige) {
    return null;
  }

  const { prestige, eligible, currentBoost } = prestigeInfo;
  const prestigeLevel = prestige.prestigeLevel;
  const nextBoost = (prestigeLevel + 1) * 5;

  return (
    <>
      <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <div>
              <h3 className="font-semibold text-base">Prestige System</h3>
              <p className="text-xs text-muted-foreground">Reset for permanent bonuses</p>
            </div>
          </div>
          {eligible && (
            <Badge className="bg-yellow-500">
              <Sparkles className="w-3 h-3 mr-1" />
              Ready!
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-2 bg-background/50 rounded">
            <p className="text-xs text-muted-foreground">Current Level</p>
            <p className="text-2xl font-bold text-yellow-500">{prestigeLevel}</p>
          </div>
          <div className="p-2 bg-background/50 rounded">
            <p className="text-xs text-muted-foreground">Current Boost</p>
            <p className="text-2xl font-bold text-matrix-green">+{currentBoost}%</p>
          </div>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          disabled={!eligible}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        >
          {eligible ? `Prestige to Level ${prestigeLevel + 1}` : "Not Eligible Yet"}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-2">
          {eligible
            ? `Next boost: +${nextBoost}%`
            : "Need: 1M CS + 100 total hashrate"}
        </p>
      </Card>

      {/* Prestige Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Prestige to Level {prestigeLevel + 1}
            </DialogTitle>
            <DialogDescription>
              Reset your progress for permanent bonuses
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
              <p className="text-sm font-semibold mb-2">You will gain:</p>
              <div className="flex items-center gap-2 text-lg font-bold text-matrix-green">
                <TrendingUp className="w-5 h-5" />
                +{nextBoost}% permanent boost to all earnings
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This boost applies to mining rewards, referral bonuses, and all CS earnings
              </p>
            </div>

            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <p className="text-sm font-semibold text-destructive">You will lose:</p>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• All CS (CryptoShards) balance</li>
                <li>• All owned equipment</li>
                <li>• All component upgrades</li>
                <li>• All equipment presets</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <p className="text-sm font-semibold mb-2">You will keep:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• All CHST (CryptoHash Tokens)</li>
                <li>• All TON purchases (packs, subscriptions)</li>
                <li>• All achievements</li>
                <li>• Referral network</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                onClick={() => prestigeMutation.mutate()}
                disabled={prestigeMutation.isPending}
              >
                {prestigeMutation.isPending ? "Prestiging..." : "Confirm Prestige"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
