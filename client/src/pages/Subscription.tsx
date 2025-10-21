import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Zap, Gift, Star, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserId } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { sendTonTransaction, isWalletConnected, getTonConnectUI } from "@/lib/tonConnect";

const TON_PAYMENT_ADDRESS = "UQBdFhwckY9C8MU0AC4uiPbRH_C3QIjZH6OzV47ROfHjnyfe";

interface Subscription {
  subscribed: boolean;
  subscription: {
    id: number;
    userId: string;
    subscriptionType: string;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
  } | null;
}

const benefits = [
  { icon: Zap, text: "+20% earnings boost on all CS rewards" },
  { icon: Gift, text: "Free daily power-up (Hashrate or Luck Boost)" },
  { icon: Star, text: "Access to exclusive cosmetic items" },
  { icon: Crown, text: "Subscriber badge on profile and leaderboards" },
  { icon: Check, text: "Priority support" },
];

export default function SubscriptionPage() {
  const { toast } = useToast();
  const userId = getCurrentUserId();
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const { data: subInfo } = useQuery<Subscription>({
    queryKey: ["/api/user", userId, "subscription"],
    enabled: !!userId,
  });

  const subscribeMutation = useMutation({
    mutationFn: async ({ type, tonAmount, txHash }: { type: string; tonAmount: number; txHash: string }) => {
      const response = await apiRequest('POST', `/api/user/${userId}/subscription/subscribe`, {
        subscriptionType: type,
        tonAmount: tonAmount.toString(),
        tonTransactionHash: txHash,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "subscription"] });
      toast({
        title: "Subscription Activated! 👑",
        description: data.message || "Welcome to premium membership!",
      });
      setSubscribing(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
      setSubscribing(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/user/${userId}/subscription/cancel`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "subscription"] });
      toast({
        title: "Subscription Cancelled",
        description: data.message || "Your subscription has been cancelled",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = async (type: "monthly" | "lifetime", price: number) => {
    if (!isWalletConnected()) {
      const tonConnectUI = getTonConnectUI();
      await tonConnectUI.openModal();
      return;
    }

    setSubscribing(type);

    try {
      const txHash = await sendTonTransaction(
        TON_PAYMENT_ADDRESS,
        price.toString(),
        `Subscription: ${type}`
      );

      if (txHash) {
        subscribeMutation.mutate({
          type,
          tonAmount: price,
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
      setSubscribing(null);
    }
  };

  const isSubscribed = subInfo?.subscribed || false;
  const subscription = subInfo?.subscription;

  return (
    <div className="min-h-screen bg-background terminal-scanline">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Premium Subscription</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Unlock exclusive benefits and boost your earnings
            </p>
          </div>
        </div>

        {/* Current Subscription Status */}
        {isSubscribed && subscription && (
          <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                <div>
                  <h3 className="text-lg font-bold">Active Subscriber</h3>
                  <p className="text-sm text-muted-foreground">
                    {subscription.subscriptionType === "lifetime" ? "Lifetime" : "Monthly"} Plan
                  </p>
                </div>
              </div>
              <Badge className="bg-yellow-500">
                <Crown className="w-3 h-3 mr-1" />
                PREMIUM
              </Badge>
            </div>

            {subscription.endDate && (
              <p className="text-sm text-muted-foreground mb-4">
                Renews: {new Date(subscription.endDate).toLocaleDateString()}
              </p>
            )}

            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Are you sure you want to cancel your subscription?")) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
            </Button>
          </Card>
        )}

        {/* Benefits */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Premium Benefits</h3>
          <div className="space-y-3">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm">{benefit.text}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Subscription Plans */}
        {!isSubscribed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Plan */}
            <Card className="p-6 border-2 border-purple-500">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Monthly</h3>
                <div className="text-4xl font-bold mb-2">5 TON</div>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>

              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  All premium benefits
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  Cancel anytime
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  Auto-renews monthly
                </li>
              </ul>

              <Button
                onClick={() => handleSubscribe("monthly", 5)}
                disabled={subscribing !== null || subscribeMutation.isPending}
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                {subscribing === "monthly" ? "Processing..." : "Subscribe Monthly"}
              </Button>
            </Card>

            {/* Lifetime Plan */}
            <Card className="p-6 border-2 border-yellow-500 relative overflow-hidden">
              <div className="absolute top-0 right-0">
                <Badge className="bg-yellow-500 rounded-none rounded-bl-lg">
                  BEST VALUE
                </Badge>
              </div>

              <div className="text-center mb-6 mt-4">
                <h3 className="text-xl font-bold mb-2">Lifetime</h3>
                <div className="text-4xl font-bold mb-2">50 TON</div>
                <p className="text-sm text-muted-foreground">one-time payment</p>
                <p className="text-xs text-matrix-green mt-1">Save 83% vs monthly!</p>
              </div>

              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  All premium benefits
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  Never expires
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  Exclusive lifetime badge
                </li>
              </ul>

              <Button
                onClick={() => handleSubscribe("lifetime", 50)}
                disabled={subscribing !== null || subscribeMutation.isPending}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                {subscribing === "lifetime" ? "Processing..." : "Get Lifetime Access"}
              </Button>
            </Card>
          </div>
        )}

        {/* Info */}
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            👑 <strong>Premium status:</strong> Subscriber badge displayed on your profile and leaderboards.
            <br />
            💰 <strong>Earnings boost:</strong> All CS rewards increased by 20% (stacks with prestige bonuses).
            <br />
            🔒 <strong>Secure:</strong> Payments processed through TON blockchain. Cancel anytime.
          </p>
        </Card>
      </div>
    </div>
  );
}
