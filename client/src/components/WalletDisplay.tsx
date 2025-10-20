import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Coins, Gem } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserId } from "@/lib/user";
import type { User } from "@shared/schema";

export default function WalletDisplay() {
  const userId = getCurrentUserId();
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  const csBalance = user?.csBalance || 0;
  const chstBalance = user?.chstBalance || 0;
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

        <div className="flex items-center justify-between p-4 rounded-md bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-ton-blue/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-ton-blue" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">TON Balance</p>
              <p className="text-lg font-bold font-mono">{chstBalance.toFixed(2)}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" data-testid="button-connect-wallet">
            Connect
          </Button>
        </div>
      </div>
    </Card>
  );
}
