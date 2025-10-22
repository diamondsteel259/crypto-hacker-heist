import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Shield, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { sendTonTransaction } from "@/lib/tonConnect";
import { useTonPayment } from "./hooks/useTonPayment";
import type { UserEquipment } from "./types";

interface ComponentUpgradesProps {
  userId: string | null;
  ownedEquipment: UserEquipment[];
}

export default function ComponentUpgrades({ userId, ownedEquipment }: ComponentUpgradesProps) {
  const { toast } = useToast();
  const { tonConnectUI, isConnected, userFriendlyAddress, refreshBalance } = useTonPayment();

  // Fetch component upgrades for all owned equipment
  const { data: allComponentUpgrades = {} } = useQuery<Record<string, any[]>>({
    queryKey: ["/api/user", userId, "components", "all"],
    queryFn: async () => {
      if (!ownedEquipment || ownedEquipment.length === 0) {
        return {};
      }

      const componentData: Record<string, any[]> = {};

      await Promise.all(
        ownedEquipment.map(async (equipment) => {
          try {
            const response = await apiRequest(
              "GET",
              `/api/user/${userId}/equipment/${equipment.id}/components`
            );
            const data = await response.json();
            componentData[equipment.id] = data;
          } catch (error) {
            console.error(`Failed to fetch components for ${equipment.id}:`, error);
            componentData[equipment.id] = [];
          }
        })
      );

      return componentData;
    },
    enabled: !!userId && ownedEquipment.length > 0,
  });

  const getComponentLevel = (equipmentId: string, componentType: string): number => {
    const components = allComponentUpgrades[equipmentId] || [];
    const component = components.find(
      (c: any) => c.component_upgrades?.componentType === componentType
    );
    return component?.component_upgrades?.currentLevel || 0;
  };

  const componentUpgradeMutation = useMutation({
    mutationFn: async ({
      equipmentId,
      componentType,
      currency,
      tonTransactionHash,
      userWalletAddress,
      tonAmount,
    }: {
      equipmentId: string;
      componentType: string;
      currency: string;
      tonTransactionHash?: string;
      userWalletAddress?: string;
      tonAmount?: string;
    }) => {
      const response = await apiRequest(
        "POST",
        `/api/user/${userId}/equipment/${equipmentId}/components/upgrade`,
        {
          componentType,
          currency,
          ...(tonTransactionHash && { tonTransactionHash, userWalletAddress, tonAmount })
        }
      );
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Component Upgraded!",
        description: data.message || `${data.componentType} upgraded to level ${data.newLevel}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "equipment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "components", "all"] });

      if (data.currency === "TON" && isConnected) {
        refreshBalance();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Upgrade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleComponentUpgrade = async (
    equipmentId: string,
    componentType: string,
    currency: string,
    upgradeCostTON: string,
    currentLevel: number
  ) => {
    if (currentLevel >= 10) return;

    if (currency === "TON") {
      if (!isConnected) {
        await tonConnectUI.openModal();
        return;
      }

      try {
        const txHash = await sendTonTransaction(
          tonConnectUI,
          "GAME_WALLET_ADDRESS_HERE",
          upgradeCostTON,
          `Component: ${componentType} Upgrade`
        );

        if (txHash) {
          componentUpgradeMutation.mutate({
            equipmentId,
            componentType,
            currency,
            tonTransactionHash: txHash,
            userWalletAddress: userFriendlyAddress,
            tonAmount: upgradeCostTON,
          });
        }
      } catch (error: any) {
        toast({
          title: "Transaction Failed",
          description: error.message || "Failed to send TON transaction",
          variant: "destructive",
        });
      }
    } else {
      componentUpgradeMutation.mutate({
        equipmentId,
        componentType,
        currency
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Rocket className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Component Upgrades</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Upgrade individual components (RAM, CPU, Storage, GPU) to boost hashrate by +5% per level
        </p>

        {ownedEquipment.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No equipment owned yet</p>
            <p className="text-xs text-muted-foreground mt-2">
              Buy equipment first, then come back to upgrade its components
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ownedEquipment.map((owned) => (
              <Card key={owned.id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Cpu className="w-4 h-4 text-matrix-green" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{owned.equipmentType.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {owned.quantity} owned • {owned.currentHashrate.toFixed(2)} GH/s current
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {["RAM", "CPU", "Storage", "GPU"].map((componentType) => {
                    const componentMultiplier = {
                      "RAM": 0.8,
                      "CPU": 1.2,
                      "Storage": 0.6,
                      "GPU": 1.5
                    }[componentType] || 1;

                    const baseCost = owned.equipmentType.basePrice * 0.1;
                    const currentLevel = getComponentLevel(owned.id, componentType);
                    const upgradeCostCS = Math.floor(baseCost * componentMultiplier * Math.pow(1.15, currentLevel));
                    const upgradeCostTON = (upgradeCostCS / 10000).toFixed(3);

                    return (
                      <div key={componentType} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">{componentType}</h5>
                          <Badge variant="outline" className="text-xs">Level {currentLevel}/10</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          +{(owned.equipmentType.baseHashrate * 0.05 * owned.quantity).toFixed(2)} GH/s
                        </p>
                        {currentLevel >= 10 ? (
                          <Button size="sm" className="w-full text-xs" disabled>
                            Max Level
                          </Button>
                        ) : (
                          <div className="space-y-1">
                            <Button
                              size="sm"
                              className="w-full text-xs bg-matrix-green hover:bg-matrix-green/90 text-black"
                              onClick={() => handleComponentUpgrade(owned.id, componentType, "CS", upgradeCostTON, currentLevel)}
                              disabled={componentUpgradeMutation.isPending}
                            >
                              {componentUpgradeMutation.isPending ? "..." : `${upgradeCostCS.toLocaleString()} CS`}
                            </Button>
                            <div className="grid grid-cols-2 gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => handleComponentUpgrade(owned.id, componentType, "CHST", upgradeCostTON, currentLevel)}
                                disabled={componentUpgradeMutation.isPending}
                              >
                                {componentUpgradeMutation.isPending ? "..." : `${upgradeCostCS.toLocaleString()} CHST`}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-cyber-blue text-cyber-blue"
                                onClick={() => handleComponentUpgrade(owned.id, componentType, "TON", upgradeCostTON, currentLevel)}
                                disabled={componentUpgradeMutation.isPending}
                              >
                                {componentUpgradeMutation.isPending ? "..." : `${upgradeCostTON} TON`}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Upgrade Benefits</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">RAM Upgrade</p>
            <p className="text-lg font-mono text-cyber-blue">+5% Hashrate</p>
          </div>
          <div>
            <p className="text-muted-foreground">CPU Upgrade</p>
            <p className="text-lg font-mono text-matrix-green">+5% Hashrate</p>
          </div>
          <div>
            <p className="text-muted-foreground">Storage Upgrade</p>
            <p className="text-lg font-mono text-neon-orange">+5% Hashrate</p>
          </div>
          <div>
            <p className="text-muted-foreground">GPU Upgrade</p>
            <p className="text-lg font-mono text-purple-500">+5% Hashrate</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Each component can be upgraded up to 10 levels. Costs scale with level.
        </p>
      </Card>
    </div>
  );
}
