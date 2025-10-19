import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Gem, Coins, Lock } from "lucide-react";
import { useTonConnectUI, useTonAddress, useTonWallet } from '@tonconnect/ui-react';
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserId } from "@/lib/user";
import type { User } from "@shared/schema";

interface BlockReward {
  blockNumber: number;
  cipherShards: number;
  hashrate: number;
  createdAt: string;
}

interface Referral {
  id: string;
  bonusEarned: number;
}

export default function WalletPage() {
  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();
  const tonWallet = useTonWallet();
  const isWalletConnected = !!tonWallet;
  
  const userId = getCurrentUserId();
  const { data: user } = useQuery<User>({
    queryKey: [`/api/user/${userId}`],
    enabled: !!userId,
  });

  const { data: blockRewards = [] } = useQuery<BlockReward[]>({
    queryKey: [`/api/user/${userId}/rewards`],
    enabled: !!userId,
  });

  const { data: referrals = [] } = useQuery<Referral[]>({
    queryKey: [`/api/user/${userId}/referrals`],
    enabled: !!userId,
  });

  const csBalance = user?.csBalance ?? 0;
  const chstBalance = user?.chstBalance ?? 0;

  // Calculate total earned from mining
  const totalFromMining = blockRewards.reduce((sum, reward) => sum + reward.cipherShards, 0);

  // Calculate total earned from referrals
  const totalFromReferrals = referrals.reduce((sum, ref) => sum + ref.bonusEarned, 0);

  // Total earned = mining + referrals
  const totalEarned = totalFromMining + totalFromReferrals;

  const handleConnectWallet = async () => {
    await tonConnectUI.openModal();
  };

  const handleDisconnectWallet = async () => {
    await tonConnectUI.disconnect();
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background terminal-scanline">
      <div className="max-w-5xl mx-auto p-2 md:p-4 space-y-3 md:space-y-6">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-matrix-green/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-matrix-green" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Wallet</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Manage your assets and rewards
            </p>
          </div>
        </div>

        {/* Cipher Shards Balance */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Gem className="w-4 md:w-5 h-4 md:h-5 text-matrix-green" />
              <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider">Cipher Shards (CS)</h3>
            </div>
            <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 md:px-2">
              Pre-Airdrop
            </Badge>
          </div>
          
          <div className="text-center py-4 md:py-6">
            <p className="text-3xl md:text-5xl font-bold font-mono text-matrix-green matrix-glow mb-1 md:mb-2" data-testid="text-cs-balance">
              {csBalance.toLocaleString()}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              Available Balance
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-[10px] md:text-xs text-muted-foreground mb-1">Total Earned</p>
              <p className="text-sm md:text-lg font-bold font-mono" data-testid="text-total-earned">
                {totalEarned.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] md:text-xs text-muted-foreground mb-1">From Mining</p>
              <p className="text-sm md:text-lg font-bold font-mono text-matrix-green" data-testid="text-from-mining">
                {totalFromMining.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] md:text-xs text-muted-foreground mb-1">From Referrals</p>
              <p className="text-sm md:text-lg font-bold font-mono text-cyber-blue" data-testid="text-from-referrals">
                {totalFromReferrals.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* TON Wallet Connection */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-ton-blue" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">TON Wallet</h3>
            </div>
            <Badge variant="outline" className="text-xs bg-ton-blue/20 text-ton-blue border-ton-blue/30">
              Optional
            </Badge>
          </div>

          {!isWalletConnected ? (
            <div className="text-center py-8">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-sm text-muted-foreground mb-4">
                Connect your TON wallet to purchase premium equipment and access CHST claiming
              </p>
              <Button 
                variant="default" 
                className="bg-ton-blue hover:bg-ton-blue/90" 
                onClick={handleConnectWallet}
                data-testid="button-connect-ton-wallet"
              >
                Connect TON Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Connected Wallet</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDisconnectWallet}
                    className="h-6 text-xs"
                    data-testid="button-disconnect-wallet"
                  >
                    Disconnect
                  </Button>
                </div>
                <p className="font-mono text-sm">{formatAddress(tonAddress)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-card border border-card-border text-center">
                  <p className="text-xs text-muted-foreground mb-1">Wallet</p>
                  <p className="text-sm font-bold font-mono">
                    {(tonWallet as any).name || tonWallet.device?.appName || 'TON Wallet'}
                  </p>
                </div>
                <div className="p-4 rounded-md bg-card border border-card-border text-center">
                  <p className="text-xs text-muted-foreground mb-1">Connected</p>
                  <p className="text-sm font-bold font-mono text-chart-1">✓ Active</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* CHST Token (Locked) */}
        <Card className="p-6 opacity-75">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-matrix-green" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">CHST Token</h3>
            </div>
            <Badge variant="outline" className="text-xs bg-neon-orange/20 text-neon-orange border-neon-orange/30">
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </Badge>
          </div>

          <div className="text-center py-6 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-12 h-12 text-muted-foreground opacity-10" />
            </div>
            <p className="text-4xl font-bold font-mono text-muted-foreground mb-2 relative">
              {chstBalance.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground relative">
              Available after first halving
            </p>
          </div>

          <div className="mt-6 p-4 rounded-md bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground mb-2">
              <strong>Airdrop Information:</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Your CS will be converted to CHST at the first halving (Month 6). You'll be able to claim your CHST tokens here.
            </p>
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4" 
            disabled
            data-testid="button-claim-chst"
          >
            <Lock className="w-4 h-4 mr-2" />
            Claim CHST (Unlocks at Halving)
          </Button>
        </Card>
      </div>
    </div>
  );
}
