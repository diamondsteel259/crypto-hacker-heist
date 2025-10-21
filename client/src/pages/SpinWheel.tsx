import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Disc3, Gift, Clock, Sparkles } from "lucide-react";
import { initializeUser } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { sendTONTransaction } from "@/lib/tonConnect";

interface SpinStatus {
  freeSpinAvailable: boolean;
  freeSpinUsed: boolean;
  paidSpinsCount: number;
}

interface SpinResult {
  success: boolean;
  prize: {
    type: string;
    value: number | string;
  };
  reward: any;
  message: string;
}

export default function SpinWheel() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastPrize, setLastPrize] = useState<any>(null);

  useEffect(() => {
    initializeUser()
      .then(setUserId)
      .catch(err => console.error('Failed to initialize user:', err));
  }, []);

  const { data: spinStatus, isLoading } = useQuery<SpinStatus>({
    queryKey: ['/api/user', userId, 'spin', 'status'],
    enabled: !!userId,
    refetchInterval: 10000,
  });

  const spinMutation = useMutation({
    mutationFn: async ({ isFree, tonData }: { isFree: boolean; tonData?: any }) => {
      const body: any = { isFree };
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
      setLastPrize(data.prize);
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'spin'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });

      toast({
        title: "🎉 You Won!",
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
    spinMutation.mutate({ isFree: true });
  };

  const handlePaidSpin = async () => {
    try {
      const result = await sendTONTransaction("0.1"); // 0.1 TON per spin
      if (result.success) {
        setIsSpinning(true);
        spinMutation.mutate({
          isFree: false,
          tonData: result,
        });
      } else {
        toast({
          title: "Transaction Cancelled",
          description: "TON transaction was cancelled",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send TON transaction",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !spinStatus) {
    return (
      <div className="min-h-screen bg-background p-3">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <p className="text-muted-foreground">Loading spin wheel...</p>
          </Card>
        </div>
      </div>
    );
  }

  const prizes = [
    { type: 'cs', label: '1,000 CS', color: 'from-green-500 to-emerald-500' },
    { type: 'chst', label: '100 CHST', color: 'from-blue-500 to-cyan-500' },
    { type: 'cs', label: '5,000 CS', color: 'from-green-500 to-emerald-500' },
    { type: 'powerup', label: 'Luck Boost', color: 'from-purple-500 to-pink-500' },
    { type: 'cs', label: '10,000 CS', color: 'from-yellow-500 to-orange-500' },
    { type: 'equipment', label: 'Equipment', color: 'from-red-500 to-pink-500' },
    { type: 'cs', label: '2,500 CS', color: 'from-green-500 to-emerald-500' },
    { type: 'chst', label: '250 CHST', color: 'from-blue-500 to-cyan-500' },
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
              Win amazing prizes every day!
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
              <p className="text-sm text-muted-foreground">Cost per Spin</p>
              <p className="text-xl font-bold text-blue-500">0.1 TON</p>
            </div>
          </div>
        </Card>

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
                      opacity: 0.8,
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

          {/* Last Prize */}
          {lastPrize && (
            <div className="mt-6 text-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Gift className="w-5 h-5 mr-2" />
                Last Win: {JSON.stringify(lastPrize)}
              </Badge>
            </div>
          )}
        </Card>

        {/* Spin Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Paid Spin */}
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Extra Spin</h3>
                <p className="text-xs text-muted-foreground">Buy additional spins with TON</p>
              </div>
            </div>
            <Button
              className="w-full h-12 text-lg bg-blue-500 hover:bg-blue-600"
              onClick={handlePaidSpin}
              disabled={isSpinning || spinMutation.isPending}
            >
              {isSpinning ? (
                <>
                  <Disc3 className="w-5 h-5 mr-2 animate-spin" />
                  Spinning...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Spin for 0.1 TON
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Possible Prizes */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Possible Prizes</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
          <p className="text-sm text-muted-foreground">
            🎰 <strong>How it works:</strong> Spin the wheel to win random prizes! You get 1 free spin every day. Want more? Buy extra spins for just 0.1 TON each!
          </p>
        </Card>
      </div>
    </div>
  );
}
