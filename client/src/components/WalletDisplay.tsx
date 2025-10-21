import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Coins, Gem, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserId } from "@/lib/user";
import { useTonConnect, getTonBalance } from "@/lib/tonConnect";
import type { User } from "@shared/schema";

export default function WalletDisplay() {
  const userId = getCurrentUserId();
  const { tonConnectUI, wallet, userFriendlyAddress, isConnected } = useTonConnect();
  const [tonBalance, setTonBalance] = useState<string>("0.0000");
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  // Fetch TON balance when wallet is connected
  useEffect(() => {
    if (isConnected && userFriendlyAddress) {
      getTonBalance(userFriendlyAddress)
        .then(setTonBalance)
        .catch(err => {
          console.error('Failed to fetch TON balance:', err);
          setTonBalance("0.0000");
        });
    } else {
      setTonBalance("0.0000");
    }
  }, [isConnected, userFriendlyAddress]);

  const handleConnect = async () => {
    try {
      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Failed to open wallet modal:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await tonConnectUI.disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const csBalance = user?.csBalance || 0;
  const chstBalance = user?.chstBalance || 0;

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-matrix-green" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Wallet</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          Phase 1
        </Badge>
      </div>
      
      <div className="space-y-4">
        {/* CS Balance */}
        <div className="flex items-center justify-between p-4 rounded-md bg-card border border-card-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-matrix-green/20 flex items-center justify-center">
              <Gem className="w-5 h-5 text-matrix-green" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Cipher Shards</p>
              <p className="text-2xl font-bold font-mono text-matrix-green">{csBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* CHST Balance */}
        <div className="flex items-center justify-between p-4 rounded-md bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-cyber-blue/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-cyber-blue" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">CHST Balance</p>
              <p className="text-lg font-bold font-mono">{chstBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* TON Wallet */}
        <div className="flex items-center justify-between p-4 rounded-md bg-ton-blue/10 border border-ton-blue/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-ton-blue/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-ton-blue" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">TON Balance</p>
              {isConnected ? (
                <>
                  <p className="text-lg font-bold font-mono text-ton-blue">{tonBalance} TON</p>
                  <p className="text-xs text-muted-foreground">{formatAddress(userFriendlyAddress)}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Not connected</p>
              )}
            </div>
          </div>
          {isConnected ? (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDisconnect}
              data-testid="button-disconnect-wallet"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Disconnect
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="default"
              className="bg-ton-blue hover:bg-ton-blue/90"
              onClick={handleConnect}
              data-testid="button-connect-wallet"
            >
              Connect TON
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
