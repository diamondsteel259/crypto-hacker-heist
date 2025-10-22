import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Gift, Coins, Crown, Zap } from "lucide-react";

interface RewardModalProps {
  open: boolean;
  onClose: () => void;
  rewards: {
    cs?: number;
    chst?: number;
    freeSpins?: number;
  };
  boxType?: string;
}

export function RewardModal({ open, onClose, rewards, boxType }: RewardModalProps) {
  const hasRewards = rewards && (rewards.cs || rewards.chst || rewards.freeSpins);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Gift className="w-16 h-16 text-matrix-green animate-bounce" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-spin" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            🎉 You Won! 🎉
          </DialogTitle>
        </DialogHeader>

        {hasRewards && (
          <div className="space-y-4">
            {/* Box Type */}
            {boxType && (
              <div className="text-center">
                <Badge variant="outline" className="text-sm capitalize bg-purple-500/20">
                  {boxType} Box
                </Badge>
              </div>
            )}

            {/* Rewards Display */}
            <div className="space-y-3">
              {rewards.cs && rewards.cs > 0 && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Coins className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CS Currency</p>
                      <p className="text-2xl font-bold text-green-500 font-mono">
                        +{rewards.cs.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-green-500 animate-pulse" />
                </div>
              )}

              {rewards.chst && rewards.chst > 0 && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CHST Tokens</p>
                      <p className="text-2xl font-bold text-blue-500 font-mono">
                        +{rewards.chst.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                </div>
              )}

              {rewards.freeSpins && rewards.freeSpins > 0 && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bonus Spins</p>
                      <p className="text-2xl font-bold text-purple-500 font-mono">
                        +{rewards.freeSpins} Spin{rewards.freeSpins > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                </div>
              )}
            </div>

            {/* Claim Button */}
            <Button
              className="w-full h-12 text-lg bg-matrix-green hover:bg-matrix-green/90 text-black font-bold"
              onClick={onClose}
            >
              Claim Rewards
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Rewards have been added to your balance!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
