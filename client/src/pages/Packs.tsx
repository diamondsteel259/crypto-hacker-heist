import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Check, Zap, Cpu, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserId } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { sendTonTransaction, isWalletConnected, getTonConnectUI } from "@/lib/tonConnect";

const TON_PAYMENT_ADDRESS = "UQBdFhwckY9C8MU0AC4uiPbRH_C3QIjZH6OzV47ROfHjnyfe";

interface PackPurchase {
  id: number;
  userId: string;
  packType: string;
  tonAmount: string;
  tonTransactionHash: string;
  rewardsJson: string;
  purchasedAt: string;
}

const packs = [
  {
    id: "starter",
    name: "Starter Pack",
    description: "Perfect for beginners",
    price: "2 TON",
    priceValue: 2,
    icon: Gift,
    color: "from-blue-500 to-cyan-500",
    rewards: [
      "50,000 CS",
      "1x Gaming Laptop",
      "Instant mining boost",
    ],
  },
  {
    id: "pro",
    name: "Pro Pack",
    description: "For serious miners",
    price: "10 TON",
    priceValue: 10,
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    popular: true,
    rewards: [
      "250,000 CS",
      "100 CHST",
      "1x Server Farm",
      "Power-up bonuses",
    ],
  },
  {
    id: "whale",
    name: "Whale Pack",
    description: "Ultimate mining empire",
    price: "50 TON",
    priceValue: 50,
    icon: TrendingUp,
    color: "from-orange-500 to-red-500",
    rewards: [
      "1,000,000 CS",
      "500 CHST",
      "1x ASIC S19 Miner",
      "VIP status benefits",
    ],
  },
];

export default function Packs() {
  const { toast } = useToast();
  const userId = getCurrentUserId();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const { data: purchases = [] } = useQuery<PackPurchase[]>({
    queryKey: ["/api/user", userId, "packs"],
    enabled: !!userId,
  });

  const purchaseMutation = useMutation({
    mutationFn: async ({ packType, tonAmount, txHash }: { packType: string; tonAmount: number; txHash: string }) => {
      const response = await apiRequest('POST', `/api/user/${userId}/packs/purchase`, {
        packType,
        tonAmount: tonAmount.toString(),
        tonTransactionHash: txHash,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "packs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "equipment"] });
      toast({
        title: "Pack Purchased! 🎉",
        description: data.message || "Your rewards have been added to your account",
      });
      setPurchasing(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
      setPurchasing(null);
    },
  });

  const handlePurchase = async (pack: typeof packs[0]) => {
    if (!isWalletConnected()) {
      const tonConnectUI = getTonConnectUI();
      await tonConnectUI.openModal();
      return;
    }

    // Check if already purchased
    if (purchases.some(p => p.packType === pack.id)) {
      toast({
        title: "Already Purchased",
        description: `You have already purchased the ${pack.name}`,
        variant: "destructive",
      });
      return;
    }

    setPurchasing(pack.id);

    try {
      const txHash = await sendTonTransaction(
        TON_PAYMENT_ADDRESS,
        pack.priceValue.toString(),
        `Pack: ${pack.name}`
      );

      if (txHash) {
        purchaseMutation.mutate({
          packType: pack.id,
          tonAmount: pack.priceValue,
          txHash,
        });
      } else {
        throw new Error("Transaction cancelled");
      }
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send TON transaction",
        variant: "destructive",
      });
      setPurchasing(null);
    }
  };

  const isPurchased = (packId: string) => {
    return purchases.some(p => p.packType === packId);
  };

  return (
    <div className="min-h-screen bg-background terminal-scanline">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Premium Packs</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              One-time purchase bundles with instant rewards
            </p>
          </div>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packs.map((pack) => {
            const Icon = pack.icon;
            const purchased = isPurchased(pack.id);
            const isPurchasing = purchasing === pack.id;

            return (
              <Card
                key={pack.id}
                className={`relative overflow-hidden ${
                  purchased ? 'border-green-500/50' : ''
                } ${pack.popular ? 'border-purple-500' : ''}`}
              >
                {pack.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="bg-purple-500 rounded-none rounded-bl-lg">
                      POPULAR
                    </Badge>
                  </div>
                )}
                {purchased && (
                  <div className="absolute top-0 left-0">
                    <Badge className="bg-green-500 rounded-none rounded-br-lg">
                      <Check className="w-3 h-3 mr-1" />
                      OWNED
                    </Badge>
                  </div>
                )}

                <div className={`p-6 bg-gradient-to-br ${pack.color} bg-opacity-10`}>
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${pack.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-1">{pack.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{pack.description}</p>
                    <div className="text-3xl font-bold mb-4">
                      {pack.price}
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-xs text-muted-foreground font-semibold uppercase">Includes:</p>
                    {pack.rewards.map((reward, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{reward}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handlePurchase(pack)}
                    disabled={purchased || isPurchasing || purchaseMutation.isPending}
                    className={`w-full ${
                      purchased
                        ? 'bg-green-500 hover:bg-green-600'
                        : `bg-gradient-to-r ${pack.color}`
                    }`}
                  >
                    {isPurchasing || purchaseMutation.isPending ? (
                      "Processing..."
                    ) : purchased ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Purchased
                      </>
                    ) : (
                      `Buy Now - ${pack.price}`
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info */}
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            💎 <strong>One-time purchase:</strong> Each pack can only be purchased once per account.
            <br />
            💰 <strong>Instant rewards:</strong> All items and currency are added to your account immediately.
            <br />
            🔒 <strong>Secure:</strong> Payments processed through TON blockchain.
          </p>
        </Card>
      </div>
    </div>
  );
}
