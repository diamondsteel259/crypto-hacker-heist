import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShoppingBag, Cpu, Rocket, Zap, Gem, CheckCircle2 } from "lucide-react";
import { getCurrentUserId } from "@/lib/user";
import { useTonPayment } from "./shop/hooks/useTonPayment";
import type { User } from "@shared/schema";
import type { UserEquipment } from "./shop/types";
import EquipmentShop from "./shop/EquipmentShop";
import ComponentUpgrades from "./shop/ComponentUpgrades";
import PowerUpsShop from "./shop/PowerUpsShop";
import LootBoxes from "./shop/LootBoxes";
import TasksPanel from "./shop/TasksPanel";

export default function Shop() {
  const [activeTab, setActiveTab] = useState("equipment");
  const userId = getCurrentUserId();
  const { tonBalance, isConnected, tonConnectUI } = useTonPayment();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  const { data: ownedEquipment = [] } = useQuery<UserEquipment[]>({
    queryKey: ["/api/user", userId, "equipment"],
    enabled: !!userId,
  });

  const csBalance = user?.csBalance || 0;
  const userHashrate = user?.totalHashrate || 0;

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Enhanced Shop Header with Stats */}
        <Card className="p-4 bg-gradient-to-r from-matrix-green/10 to-cyber-blue/10 border-matrix-green/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-matrix-green" />
              <h1 className="text-lg sm:text-xl font-bold terminal-gradient">SHOP</h1>
            </div>
            {!isConnected && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-cyber-blue text-cyber-blue"
                onClick={() => tonConnectUI.openModal()}
              >
                Connect TON Wallet
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">CS Balance</p>
              <p className="text-base sm:text-lg font-mono font-bold text-matrix-green">{csBalance.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Your Hashrate</p>
              <p className="text-base sm:text-lg font-mono font-bold text-cyber-blue">{userHashrate.toLocaleString()} H/s</p>
            </div>
            {isConnected && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">TON Balance</p>
                <p className="text-base sm:text-lg font-mono font-bold text-cyber-blue">{tonBalance}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Equipment Owned</p>
              <p className="text-base sm:text-lg font-mono font-bold text-neon-orange">{ownedEquipment.length}</p>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-4">
            <TabsTrigger value="equipment" data-testid="tab-equipment" className="text-xs px-1">
              <Cpu className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">⚡ Rigs</span>
            </TabsTrigger>
            <TabsTrigger value="upgrades" data-testid="tab-upgrades" className="text-xs px-1">
              <Rocket className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">🔧 Upgrades</span>
            </TabsTrigger>
            <TabsTrigger value="powerups" data-testid="tab-powerups" className="text-xs px-1">
              <Zap className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">⚡ Boosts</span>
            </TabsTrigger>
            <TabsTrigger value="lootboxes" data-testid="tab-lootboxes" className="text-xs px-1">
              <Gem className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">🎁 Boxes</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks" className="text-xs px-1">
              <CheckCircle2 className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">✅ Tasks</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipment">
            <EquipmentShop userId={userId} csBalance={csBalance} />
          </TabsContent>

          <TabsContent value="upgrades">
            <ComponentUpgrades userId={userId} ownedEquipment={ownedEquipment} />
          </TabsContent>

          <TabsContent value="powerups">
            <PowerUpsShop userId={userId} />
          </TabsContent>

          <TabsContent value="lootboxes">
            <LootBoxes userId={userId} />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksPanel userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
