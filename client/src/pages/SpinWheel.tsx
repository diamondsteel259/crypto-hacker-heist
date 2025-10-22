import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLoadingTimeout } from "@/hooks/use-loading-timeout";
import { Disc3, Gift, Clock, Sparkles, Trophy, Zap, AlertCircle, RefreshCw } from "lucide-react";
import { initializeUser } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTonConnect, sendTonTransaction } from "@/lib/tonConnect";

const TON_PAYMENT_ADDRESS = "UQBdFhwckY9C8MU0AC4uiPbRH_C3QIjZH6OzV47ROfHjnyfe";

interface SpinStatus {
  freeSpinAvailable: boolean;
  freeSpinUsed: boolean;
  paidSpinsCount: number;
}

interface SpinResult {
  success: boolean;
  prizes: Array<{
    type: string;
    value: number | string;
    display: string;
  }>;
  summary: {
    total_cs: number;
    total_chst: number;
    jackpot_won: boolean;
    spins_completed: number;
  };
  message: string;
}

export default function SpinWheel() {
  const { toast } = useToast();
  const { tonConnectUI, isConnected } = useTonConnect();
  const [userId, setUserId] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);

  useEffect(() => {
    initializeUser()
      .then(setUserId)
      .catch(err => console.error('Failed to initialize user:', err));
  }, []);

  const { data: spinStatus, isLoading, error, refetch } = useQuery<SpinStatus>({
    queryKey: ['/api/user', userId, 'spin', 'status'],
    enabled: !!userId,
    refetchInterval: 10000,
  });

  const isTimedOut = useLoadingTimeout({ isLoading, timeoutMs: 5000 });

  const spinMutation = useMutation({
    mutationFn: async ({ isFree, quantity, tonData }: { isFree: boolean; quantity?: number; tonData?: any }) => {
      const body: any = { isFree, quantity: quantity || 1 };
      if (!isFree && tonData) {
        body.tonTransactionHash = tonData.txHash;
        body.userWalletAddress = tonData.userWallet;
        body.tonAmount = tonData.amount;
      }

      const response = await apiRequest('POST', `/api/user/${userId}/spin`, body);
      return response.json();
    },
    onSuccess: (data: SpinResult) => {
      setIsSpinning(false);
      setLastResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'spin'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });

      toast({
        title: data.summary.jackpot_won ? "🎰 JACKPOT WIN! 🎰" : "🎉 You Won!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      setIsSpinning(false);
      toast({
        title: "Spin Failed",
        description: error.message || "Failed to spin the wheel",
        variant: "destructive",
      });
    },
  });

  const handleFreeSpin = () => {
    if (!spinStatus?.freeSpinAvailable) {
      toast({
        title: "Not Available",
        description: "Free spin already used today. Come back tomorrow!",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    spinMutation.mutate({ isFree: true, quantity: 1 });
  };

  const handlePaidSpin = async (quantity: number) => {
    if (!isConnected) {
      await tonConnectUI.openModal();
      return;
    }

    const pricing: Record<number, string> = {
      1: "0.1",
      10: "0.9",
      20: "1.7",
    };

    const cost = pricing[quantity];
    if (!cost) {
      toast({
        title: "Invalid Quantity",
        description: "Please select 1, 10, or 20 spins",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);

    try {
      const txHash = await sendTonTransaction(
        tonConnectUI, 
        TON_PAYMENT_ADDRESS, 
        cost, 
        `Spin Wheel x${quantity}`
      );
      
      if (txHash) {
        spinMutation.mutate({
          isFree: false,
          quantity,
          tonData: { txHash, amount: cost },
        });
      } else {
        throw new Error("Transaction cancelled");
      }
    } catch (error: any) {
      setIsSpinning(false);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send TON transaction",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-3">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 border-destructive/50">
            <div className="flex flex-col items-center text-center gap-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Failed to Load Spin Wheel</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {error.message || "Something went wrong loading the spin wheel."}
                </p>
              </div>
              <Button onClick={() => refetch()} className="min-h-11">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading || !spinStatus) {
    return (
      <div className="min-h-screen bg-background p-3">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <Disc3 className="w-12 h-12 animate-spin text-primary" />
              <div>
                <p className="text-lg font-semibold mb-2">
                  {isTimedOut ? "Still loading..." : "Loading spin wheel..."}
                </p>
                {isTimedOut && (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      This is taking longer than expected. Check your connection.
                    </p>
                    <Button onClick={() => refetch()} variant="outline" className="min-h-11">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const prizes = [
    { type: 'jackpot', label: '1 TON', color: 'from-yellow-400 to-orange-500', icon: '🎰' },
    { type: 'cs', label: '1K CS', color: 'from-green-500 to-emerald-500', icon: '💰' },
    { type: 'chst', label: '100 CHST', color: 'from-blue-500 to-cyan-500', icon: '💎' },
    { type: 'cs', label: '5K CS', color: 'from-green-500 to-emerald-500', icon: '💰' },
    { type: 'powerup', label: 'Boost', color: 'from-purple-500 to-pink-500', icon: '⚡' },
    { type: 'cs', label: '10K CS', color: 'from-yellow-500 to-orange-500', icon: '💰' },
    { type: 'equipment', label: 'Equipment', color: 'from-red-500 to-pink-500', icon: '🎁' },
    { type: 'cs', label: '2.5K CS', color: 'from-green-500 to-emerald-500', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Disc3 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Spin the Wheel</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Win prizes + 1 TON jackpot!
            </p>
          </div>
        </div>

        {/* Spin Status */}
        <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Free Spin Today</p>
              <Badge variant={spinStatus.freeSpinAvailable ? "default" : "outline"} className="mt-1">
                {spinStatus.freeSpinAvailable ? "Available" : "Used"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid Spins Today</p>
              <p className="text-2xl font-bold">{spinStatus.paidSpinsCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bulk Discounts</p>
              <p className="text-sm font-bold text-green-500">10-15% OFF</p>
            </div>
          </div>
        </Card>

        {/* Last Result */}
        {lastResult && (
          <Card className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <div className="flex-1">
                <p className="font-semibold">Last Spin Result:</p>
                {lastResult.summary.jackpot_won && (
                  <p className="text-lg font-bold text-yellow-500 animate-pulse">
                    🎰 1 TON JACKPOT WON! 🎰
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {lastResult.summary.spins_completed} spin(s): 
                  {lastResult.summary.total_cs > 0 && ` ${lastResult.summary.total_cs.toLocaleString()} CS`}
                  {lastResult.summary.total_chst > 0 && ` ${lastResult.summary.total_chst.toLocaleString()} CHST`}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Wheel Visualization */}
        <Card className="p-8 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <div className="relative">
            {/* Wheel */}
            <div className={`mx-auto w-64 h-64 rounded-full border-8 border-primary relative overflow-hidden ${
              isSpinning ? 'animate-spin' : ''
            }`} style={{ animationDuration: '2s' }}>
              {prizes.map((prize, index) => {
                const rotation = (360 / prizes.length) * index;
                return (
                  <div
                    key={index}
                    className={`absolute w-full h-full bg-gradient-to-br ${prize.color}`}
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      clipPath: `polygon(50% 50%, 100% 0%, 100% 50%)`,
                      opacity: prize.type === 'jackpot' ? 1 : 0.8,
                    }}
                  />
                );
              })}

              {/* Center */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-background border-4 border-primary flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-primary"></div>
            </div>
          </div>
        </Card>

        {/* Spin Buttons */}
        <div className="grid grid-cols-1 gap-4">
          {/* Free Spin */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Gift className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Free Daily Spin</h3>
                <p className="text-xs text-muted-foreground">1 free spin every 24 hours</p>
              </div>
            </div>
            <Button
              className="w-full h-12 text-lg"
              onClick={handleFreeSpin}
              disabled={!spinStatus.freeSpinAvailable || isSpinning || spinMutation.isPending}
            >
              {isSpinning ? (
                <>
                  <Disc3 className="w-5 h-5 mr-2 animate-spin" />
                  Spinning...
                </>
              ) : spinStatus.freeSpinAvailable ? (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Spin Free!
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  Come Back Tomorrow
                </>
              )}
            </Button>
          </Card>

          {/* Paid Spins */}
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Buy Extra Spins</h3>
                <p className="text-xs text-muted-foreground">Bulk purchases with discount!</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                className="h-16 flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600"
                onClick={() => handlePaidSpin(1)}
                disabled={isSpinning || spinMutation.isPending}
              >
                <span className="text-lg font-bold">1</span>
                <span className="text-xs">0.1 TON</span>
              </Button>
              <Button
                className="h-16 flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600 relative"
                onClick={() => handlePaidSpin(10)}
                disabled={isSpinning || spinMutation.isPending}
              >
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-xs">-10%</Badge>
                <span className="text-lg font-bold">10</span>
                <span className="text-xs">0.9 TON</span>
              </Button>
              <Button
                className="h-16 flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600 relative"
                onClick={() => handlePaidSpin(20)}
                disabled={isSpinning || spinMutation.isPending}
              >
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-xs">-15%</Badge>
                <span className="text-lg font-bold">20</span>
                <span className="text-xs">1.7 TON</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Possible Prizes */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Possible Prizes</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg text-center border border-yellow-500/50">
              <p className="text-2xl mb-1">🎰</p>
              <p className="text-sm font-semibold text-yellow-500">1 TON</p>
              <p className="text-xs text-muted-foreground">0.1% chance</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg text-center">
              <p className="text-2xl mb-1">💰</p>
              <p className="text-sm font-semibold">1K-25K CS</p>
              <p className="text-xs text-muted-foreground">40% chance</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg text-center">
              <p className="text-2xl mb-1">💎</p>
              <p className="text-sm font-semibold">50-500 CHST</p>
              <p className="text-xs text-muted-foreground">30% chance</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg text-center">
              <p className="text-2xl mb-1">⚡</p>
              <p className="text-sm font-semibold">Power-Up</p>
              <p className="text-xs text-muted-foreground">20% chance</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
              <p className="text-2xl mb-1">🎁</p>
              <p className="text-sm font-semibold">Equipment</p>
              <p className="text-xs text-muted-foreground">10% chance</p>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground mb-2">
            🎰 <strong>Jackpot Prize:</strong> Win 1 TON with paid spins! 0.1% chance (1 in 1000). Admin will process your payout.
          </p>
          <p className="text-sm text-muted-foreground">
            💡 <strong>Bulk Discounts:</strong> Buy 10 spins for 10% off or 20 spins for 15% off!
          </p>
        </Card>
      </div>
    </div>
  );
}
