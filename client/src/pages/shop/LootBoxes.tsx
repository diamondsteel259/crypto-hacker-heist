import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gem, Star, Gift, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toNano } from "@ton/core";
import { RewardModal } from "@/components/RewardModal";
import { TransactionConfirmationModal } from "@/components/TransactionConfirmationModal";
import { useTonPayment } from "./hooks/useTonPayment";
import { TON_PAYMENT_ADDRESS } from "./types";

interface LootBoxesProps {
  userId: string | null;
}

export default function LootBoxes({ userId }: LootBoxesProps) {
  const { toast } = useToast();
  const { tonConnectUI, isConnected, tonBalance, refreshBalance } = useTonPayment();
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [rewardModalData, setRewardModalData] = useState<any>(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<"confirming" | "success" | "error" | "idle">("idle");
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const lootBoxOpenMutation = useMutation({
    mutationFn: async ({ boxType, cost }: { boxType: string; cost?: number }) => {
      let txHash = undefined;
      let userAddress = undefined;

      if (cost && cost > 0) {
        const boxName = boxType === 'basic' ? 'Basic Box' : boxType === 'premium' ? 'Premium Box' : 'Epic Box';
        const confirmed = window.confirm(
          `Open ${boxName} for ${cost} TON?\n\nExpected rewards: CS/CHST (100-110% RTP)\nThis will deduct ${cost} TON from your wallet.`
        );

        if (!confirmed) {
          throw new Error("Purchase cancelled by user");
        }

        if (!isConnected) {
          throw new Error("Please connect your TON wallet first");
        }

        const currentBalance = parseFloat(tonBalance);
        if (currentBalance < cost) {
          throw new Error(`Insufficient TON balance. You have ${tonBalance} TON but need ${cost} TON`);
        }

        userAddress = tonConnectUI.account?.address;

        if (!userAddress) {
          throw new Error("Wallet not properly connected. Please reconnect your wallet.");
        }

        try {
          const result = await tonConnectUI.sendTransaction({
            messages: [
              {
                address: TON_PAYMENT_ADDRESS,
                amount: toNano(cost).toString(),
              },
            ],
            validUntil: Math.floor(Date.now() / 1000) + 600,
          });
          txHash = result.boc;
          
          // Show confirmation modal
          setConfirmationStatus("confirming");
          setConfirmationMessage("Verifying your payment on the TON blockchain. This may take 2-5 minutes...");
          setConfirmationModalOpen(true);
        } catch (txError: any) {
          if (txError.message && txError.message.includes("Transaction was not sent")) {
            throw new Error("Transaction cancelled or rejected by wallet. Please try again.");
          }
          throw new Error(txError.message || "Failed to send TON transaction");
        }
      }

      const response = await apiRequest("POST", `/api/user/${userId}/lootbox/open`, {
        boxType,
        ...(txHash && { tonTransactionHash: txHash, userWalletAddress: userAddress, tonAmount: cost })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to open loot box");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      // Close confirmation modal and show success
      if (confirmationModalOpen) {
        setConfirmationStatus("success");
        setConfirmationMessage("Payment confirmed! Your loot box has been opened.");
        setTimeout(() => {
          setConfirmationModalOpen(false);
          setConfirmationStatus("idle");
        }, 2000);
      }

      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      refreshBalance();

      setRewardModalData({
        rewards: data.rewards,
        boxType: data.boxType || 'mystery',
      });
      setRewardModalOpen(true);
    },
    onError: (error: any) => {
      // Show error in confirmation modal if open
      if (confirmationModalOpen) {
        setConfirmationStatus("error");
        setConfirmationMessage(error.message || "Transaction verification failed");
      } else {
        toast({
          title: "Failed to open loot box",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      }
    },
  });

  return (
    <>
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Gem className="w-4 md:w-5 h-4 md:h-5 text-pink-500" />
            <h3 className="text-sm md:text-lg font-semibold">Mystery Boxes</h3>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mb-4">
            TON boxes with 100-110% RTP
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="bg-cyber-blue hover:bg-cyber-blue/90 text-white text-xs md:text-sm"
              onClick={() => lootBoxOpenMutation.mutate({ boxType: "basic", cost: 0.5 })}
              disabled={lootBoxOpenMutation.isPending}
            >
              <Gift className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
              {lootBoxOpenMutation.isPending ? "..." : "Basic (0.5)"}
            </Button>
            <Button
              className="bg-cyber-blue hover:bg-cyber-blue/90 text-white text-xs md:text-sm"
              onClick={() => lootBoxOpenMutation.mutate({ boxType: "premium", cost: 2 })}
              disabled={lootBoxOpenMutation.isPending}
            >
              <Gift className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
              {lootBoxOpenMutation.isPending ? "..." : "Premium (2)"}
            </Button>
            <Button
              className="bg-cyber-blue hover:bg-cyber-blue/90 text-white text-xs md:text-sm col-span-2"
              onClick={() => lootBoxOpenMutation.mutate({ boxType: "epic", cost: 5 })}
              disabled={lootBoxOpenMutation.isPending}
            >
              <Gift className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
              {lootBoxOpenMutation.isPending ? "..." : "Epic Box (5 TON)"}
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-4 md:w-5 h-4 md:h-5 text-yellow-500" />
            <h3 className="text-sm md:text-lg font-semibold">Free Loot Boxes</h3>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mb-4">
            Earn through tasks and invites
          </p>
          <div className="grid grid-cols-1 gap-3">
            <Button
              className="bg-matrix-green hover:bg-matrix-green/90 text-black text-xs md:text-sm"
              onClick={() => lootBoxOpenMutation.mutate({ boxType: "daily-task", cost: 0 })}
              disabled={lootBoxOpenMutation.isPending}
            >
              <CheckCircle2 className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
              {lootBoxOpenMutation.isPending ? "..." : "Daily Task (1/1)"}
            </Button>
            <Button
              className="bg-matrix-green hover:bg-matrix-green/90 text-black text-xs md:text-sm"
              onClick={() => lootBoxOpenMutation.mutate({ boxType: "invite-friend", cost: 0 })}
              disabled={lootBoxOpenMutation.isPending}
            >
              <CheckCircle2 className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
              {lootBoxOpenMutation.isPending ? "..." : "Invite Friend (2/2)"}
            </Button>
          </div>
        </Card>
      </div>

      <RewardModal
        open={rewardModalOpen}
        onClose={() => {
          setRewardModalOpen(false);
          setRewardModalData(null);
        }}
        rewards={rewardModalData?.rewards || {}}
        boxType={rewardModalData?.boxType}
      />

      <TransactionConfirmationModal
        open={confirmationModalOpen}
        status={confirmationStatus}
        message={confirmationMessage}
        onClose={() => {
          setConfirmationModalOpen(false);
          setConfirmationStatus("idle");
        }}
      />
    </>
  );
}
