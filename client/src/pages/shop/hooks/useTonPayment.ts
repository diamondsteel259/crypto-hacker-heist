import { useTonConnect, sendTonTransaction, getTonBalance } from "@/lib/tonConnect";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { TON_PAYMENT_ADDRESS } from "../types";

export function useTonPayment() {
  const [tonBalance, setTonBalance] = useState<string>("0.0000");
  const { toast } = useToast();
  const { tonConnectUI, isConnected, userFriendlyAddress } = useTonConnect();

  // Fetch TON balance when wallet is connected
  useEffect(() => {
    const fetchTonBalance = async () => {
      if (isConnected) {
        try {
          const balance = await getTonBalance(userFriendlyAddress);
          setTonBalance(balance);
        } catch (error) {
          console.error("Failed to fetch TON balance:", error);
          setTonBalance("0.0000");
        }
      } else {
        setTonBalance("0.0000");
      }
    };

    fetchTonBalance();
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchTonBalance, 30000);
    return () => clearInterval(interval);
  }, [isConnected, userFriendlyAddress]);

  const refreshBalance = async () => {
    if (isConnected) {
      try {
        const balance = await getTonBalance(userFriendlyAddress);
        setTonBalance(balance);
      } catch (error) {
        console.error("Failed to refresh TON balance:", error);
      }
    }
  };

  const checkBalance = (requiredAmount: number): boolean => {
    const currentBalance = parseFloat(tonBalance);
    if (currentBalance < requiredAmount) {
      toast({
        title: "Insufficient TON balance",
        description: `You have ${tonBalance} TON but need ${requiredAmount} TON`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const confirmPurchase = (itemName: string, amount: number): boolean => {
    return window.confirm(
      `Purchase ${itemName} for ${amount} TON?\n\nThis will deduct ${amount} TON from your wallet.`
    );
  };

  return {
    tonBalance,
    isConnected,
    userFriendlyAddress,
    tonConnectUI,
    refreshBalance,
    checkBalance,
    confirmPurchase,
    toast,
  };
}
