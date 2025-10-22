import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Rocket, Shield, Sparkles, Zap, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toNano } from "@ton/core";
import { useTonPayment } from "./hooks/useTonPayment";
import { TON_PAYMENT_ADDRESS, type ActivePowerUpsResponse } from "./types";

interface PowerUpsShopProps {
  userId: string | null;
}

export default function PowerUpsShop({ userId }: PowerUpsShopProps) {
  const { toast } = useToast();
  const { tonConnectUI, isConnected, tonBalance, refreshBalance } = useTonPayment();

  const { data: activePowerUps } = useQuery<ActivePowerUpsResponse>({
    queryKey: ['/api/user', userId, 'powerups', 'active'],
    enabled: !!userId,
    refetchInterval: 10000,
  });

  const powerUpClaimMutation = useMutation({
    mutationFn: async (claimType: string) => {
      const timezoneOffset = new Date().getTimezoneOffset();

      const response = await apiRequest("POST", `/api/user/${userId}/powerups/claim`, {
        type: claimType,
        timezoneOffset,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to claim");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      toast({
        title: "Daily claim successful!",
        description: `You received ${data.reward} ${data.currency}! ${data.remaining_claims} claims left today.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Daily claim failed",
        description: error.message || "Failed to claim daily reward. Please try again.",
        variant: "destructive"
      });
    },
  });

  const premiumPowerUpMutation = useMutation({
    mutationFn: async ({ powerUpType, tonAmount }: { powerUpType: string; tonAmount: number }) => {
      const powerUpName = powerUpType === 'hashrate-boost' ? 'Hashrate Boost (+50%)' : 'Luck Boost (+25%)';
      const confirmed = window.confirm(
        `Purchase ${powerUpName} for ${tonAmount} TON?\n\nBoost lasts 1 hour.\nThis will deduct ${tonAmount} TON from your wallet.`
      );

      if (!confirmed) {
        throw new Error("Purchase cancelled by user");
      }

      if (!isConnected) {
        throw new Error("Please connect your TON wallet first");
      }

      const currentBalance = parseFloat(tonBalance);
      if (currentBalance < tonAmount) {
        throw new Error(`Insufficient TON balance. You have ${tonBalance} TON but need ${tonAmount} TON`);
      }

      const userAddress = tonConnectUI.account?.address;

      if (!userAddress) {
        throw new Error("Wallet not properly connected. Please reconnect your wallet.");
      }

      try {
        const result = await tonConnectUI.sendTransaction({
          messages: [
            {
              address: TON_PAYMENT_ADDRESS,
              amount: toNano(tonAmount).toString(),
            },
          ],
          validUntil: Math.floor(Date.now() / 1000) + 600,
        });

        const response = await apiRequest("POST", `/api/user/${userId}/powerups/purchase`, {
          powerUpType,
          tonTransactionHash: result.boc,
          userWalletAddress: userAddress,
          tonAmount,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to purchase power-up");
        }

        return await response.json();
      } catch (txError: any) {
        if (txError.message && txError.message.includes("Transaction was not sent")) {
          throw new Error("Transaction cancelled or rejected by wallet. Please try again.");
        }
        throw new Error(txError.message || "Failed to send TON transaction");
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      refreshBalance();
      toast({
        title: "Power-up activated!",
        description: `${data.powerUpType} active for 1 hour! +${data.boost_percentage}% boost`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Failed to purchase power-up. Please try again.",
        variant: "destructive"
      });
    },
  });

  return (
    <div className="space-y-4">
      {/* Active Power-Ups Indicator */}
      {activePowerUps && activePowerUps.active_power_ups && activePowerUps.active_power_ups.length > 0 && (
        <Card className="p-4 bg-matrix-green/10 border-matrix-green/30">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-matrix-green animate-pulse" />
            <h3 className="text-sm md:text-lg font-semibold text-matrix-green">Active Boosts</h3>
          </div>
          {activePowerUps.active_power_ups.map((powerUp) => {
            const minutes = Math.floor(powerUp.time_remaining_seconds);
            return (
              <div key={powerUp.id} className="flex items-center justify-between text-xs md:text-sm">
                <span className="font-medium">
                  {powerUp.type === "hashrate-boost" ? "⚡ Hashrate" : "✨ Luck"} +{powerUp.boost_percentage}%
                </span>
                <span className="text-muted-foreground">{minutes}m left</span>
              </div>
            );
          })}
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Star className="w-4 md:w-5 h-4 md:h-5 text-yellow-500" />
          <h3 className="text-sm md:text-lg font-semibold">Daily Currency Claims</h3>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground mb-4">
          Claim small amounts of CS or CHST currency for free! Limited to 5 claims per day (resets at midnight). These are NOT mining boosts - just free currency to help you get started.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button
            className="bg-matrix-green hover:bg-matrix-green/90 text-black text-xs md:text-sm"
            onClick={() => powerUpClaimMutation.mutate("cs")}
            disabled={powerUpClaimMutation.isPending}
          >
            <Star className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
            {powerUpClaimMutation.isPending ? "..." : "Claim 5 CS"}
          </Button>
          <Button
            className="bg-cyber-blue hover:bg-cyber-blue/90 text-white text-xs md:text-sm"
            onClick={() => powerUpClaimMutation.mutate("chst")}
            disabled={powerUpClaimMutation.isPending}
          >
            <Crown className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
            {powerUpClaimMutation.isPending ? "..." : "Claim 2 CHST"}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Rocket className="w-4 md:w-5 h-4 md:h-5 text-purple-500" />
          <h3 className="text-sm md:text-lg font-semibold">Mining Boost Power-Ups</h3>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground mb-4">
          Purchase temporary mining boosts with TON. These power-ups last for 1 hour and boost your mining performance! You also receive bonus CS currency instantly.
        </p>
        <div className="grid grid-cols-1 gap-3">
          <div className="border border-cyber-blue/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyber-blue" />
                <span className="font-semibold text-sm">Hashrate Boost</span>
              </div>
              <Badge variant="outline" className="text-xs bg-cyber-blue/20 text-cyber-blue">+50%</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Increases your mining hashrate by 50% for 1 hour. Mine blocks faster and earn more rewards! Includes 100 CS bonus.
            </p>
            <Button
              className="w-full bg-cyber-blue hover:bg-cyber-blue/90 text-white text-xs md:text-sm"
              onClick={() => premiumPowerUpMutation.mutate({ powerUpType: "hashrate-boost", tonAmount: 0.2 })}
              disabled={premiumPowerUpMutation.isPending}
            >
              <Zap className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
              {premiumPowerUpMutation.isPending ? "Buying..." : "Buy for 0.2 TON"}
            </Button>
          </div>

          <div className="border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="font-semibold text-sm">Luck Boost</span>
              </div>
              <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-500">+20%</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Increases your block reward luck by 20% for 1 hour. Get better rewards from mined blocks! Includes 50 CS bonus.
            </p>
            <Button
              className="w-full bg-purple-500 hover:bg-purple-600 text-white text-xs md:text-sm"
              onClick={() => premiumPowerUpMutation.mutate({ powerUpType: "luck-boost", tonAmount: 0.1 })}
              disabled={premiumPowerUpMutation.isPending}
            >
              <Sparkles className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
              {premiumPowerUpMutation.isPending ? "Buying..." : "Buy for 0.1 TON"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Power-ups stack with your equipment! Check the Dashboard to see your active boosts and time remaining.
        </p>
      </Card>
    </div>
  );
}
