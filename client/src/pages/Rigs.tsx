import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Zap, Monitor, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserId } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { OwnedEquipment, EquipmentType, User } from "@shared/schema";

type UserEquipment = OwnedEquipment & { equipmentType: EquipmentType };

interface UpgradeResponse {
  success: boolean;
  user: User;
  upgradeCost: number;
  newLevel: number;
  hashrateIncrease: number;
}

const MAX_UPGRADE_LEVEL = 10;

function calculateUpgradeCost(basePrice: number, currentLevel: number): number {
  return Math.floor(basePrice * Math.pow(1.5, currentLevel + 1));
}

export default function Rigs() {
  const [selectedRig, setSelectedRig] = useState<UserEquipment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const userId = getCurrentUserId();

  const { data: equipment = [], isLoading: isLoadingEquipment } = useQuery<UserEquipment[]>({
    queryKey: ["/api/user", userId, "equipment"],
    enabled: !!userId,
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  const upgradeMutation = useMutation({
    mutationFn: async ({ equipmentTypeId }: { equipmentTypeId: string }) => {
      const response = await apiRequest(
        "POST",
        `/api/user/${userId}/equipment/upgrade`,
        { equipmentTypeId }
      );
      return response.json() as Promise<UpgradeResponse>;
    },
    onSuccess: (data) => {
      toast({
        title: "Upgrade Successful!",
        description: `Level ${data.newLevel} - Hashrate increased by ${data.hashrateIncrease.toFixed(2)} GH/s`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "equipment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Upgrade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRigClick = (rig: UserEquipment) => {
    setSelectedRig(rig);
    setDialogOpen(true);
  };

  const handleUpgrade = (equipmentTypeId: string) => {
    upgradeMutation.mutate({ equipmentTypeId });
  };

  const totalHashrate = equipment.reduce((sum, eq) => sum + eq.currentHashrate, 0);
  const avgUpgradeLevel = equipment.length > 0 
    ? equipment.reduce((sum, eq) => sum + eq.upgradeLevel, 0) / equipment.length 
    : 0;

  if (isLoadingEquipment) {
    return (
      <div className="min-h-screen bg-background terminal-scanline">
        <div className="max-w-7xl mx-auto p-2 md:p-4 space-y-3 md:space-y-6">
          <div className="hidden md:flex items-center justify-between">
            <Skeleton className="h-12 w-64" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-2.5 md:p-4">
                <Skeleton className="h-20 w-full" />
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-3 md:p-4">
                <Skeleton className="h-48 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background terminal-scanline">
      <div className="max-w-7xl mx-auto p-3 space-y-4">

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="p-2.5 md:p-4" data-testid="card-total-rigs">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Package className="w-3 md:w-4 h-3 md:h-4 text-matrix-green" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Total Rigs</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono" data-testid="text-total-rigs">
              {equipment.length}
            </p>
          </Card>

          <Card className="p-2.5 md:p-4" data-testid="card-total-hashrate">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Zap className="w-3 md:w-4 h-3 md:h-4 text-neon-orange" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Total Hashrate</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono text-matrix-green" data-testid="text-total-hashrate">
              {totalHashrate.toFixed(2)}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground">GH/s</p>
          </Card>

          <Card className="p-2.5 md:p-4" data-testid="card-avg-upgrade">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <TrendingUp className="w-3 md:w-4 h-3 md:h-4 text-cyber-blue" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Avg Upgrade</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono" data-testid="text-avg-upgrade">
              {avgUpgradeLevel.toFixed(1)}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground">/ {MAX_UPGRADE_LEVEL}.0</p>
          </Card>

          <Card className="p-2.5 md:p-4" data-testid="card-cs-balance">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Zap className="w-3 md:w-4 h-3 md:h-4 text-chart-1" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">CS Balance</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono text-cyber-blue" data-testid="text-cs-balance">
              {user?.csBalance?.toLocaleString() ?? 0}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground">CS</p>
          </Card>
        </div>

        {/* Rigs Grid */}
        {equipment.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {equipment.map((eq) => {
              const baseHashrate = eq.equipmentType.baseHashrate * eq.quantity;
              const boostPercent = ((eq.currentHashrate / baseHashrate - 1) * 100);
              const upgradeCost = eq.upgradeLevel < MAX_UPGRADE_LEVEL 
                ? calculateUpgradeCost(eq.equipmentType.basePrice, eq.upgradeLevel)
                : 0;

              return (
                <Card
                  key={eq.id}
                  className="p-3 md:p-4 hover-elevate transition-all cursor-pointer"
                  onClick={() => handleRigClick(eq)}
                  data-testid={`rig-card-${eq.equipmentTypeId}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-matrix-green" />
                      <Badge variant="outline" className="text-xs">
                        {eq.equipmentType.tier}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs" data-testid={`badge-level-${eq.equipmentTypeId}`}>
                      Level {eq.upgradeLevel}
                    </Badge>
                  </div>

                  <h4 className="font-semibold mb-1" data-testid={`text-name-${eq.equipmentTypeId}`}>
                    {eq.equipmentType.name}
                  </h4>
                  {eq.quantity > 1 && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Quantity: {eq.quantity}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Base Hashrate</span>
                      <span className="font-mono" data-testid={`text-base-hashrate-${eq.equipmentTypeId}`}>
                        {baseHashrate.toFixed(2)} GH/s
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Current Hashrate</span>
                      <span className="font-mono font-semibold text-matrix-green" data-testid={`text-current-hashrate-${eq.equipmentTypeId}`}>
                        {eq.currentHashrate.toFixed(2)} GH/s
                      </span>
                    </div>
                    {boostPercent > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Boost</span>
                        <span className="font-mono text-neon-orange" data-testid={`text-boost-${eq.equipmentTypeId}`}>
                          +{boostPercent.toFixed(0)}%
                        </span>
                      </div>
                    )}
                    {eq.upgradeLevel < MAX_UPGRADE_LEVEL && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Next Upgrade</span>
                        <span className="font-mono" data-testid={`text-upgrade-cost-${eq.equipmentTypeId}`}>
                          {upgradeCost.toLocaleString()} CS
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Upgrade Progress</span>
                      <span className="font-mono">
                        {eq.upgradeLevel}/{MAX_UPGRADE_LEVEL}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-matrix-green rounded-full h-2 transition-all"
                        style={{ width: `${(eq.upgradeLevel / MAX_UPGRADE_LEVEL) * 100}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-semibold mb-2">No Rigs Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Visit the Shop to purchase your first mining rig
            </p>
            <Button variant="default" data-testid="button-go-to-shop">
              Go to Shop
            </Button>
          </Card>
        )}
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-matrix-green" />
              {selectedRig?.equipmentType.name}
            </DialogTitle>
            <DialogDescription>
              Upgrade your rig to increase its mining performance
            </DialogDescription>
          </DialogHeader>

          {selectedRig && (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-muted/30 border border-border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current HR</p>
                    <p className="text-lg font-bold font-mono text-matrix-green" data-testid="text-dialog-current-hashrate">
                      {selectedRig.currentHashrate.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Level</p>
                    <p className="text-lg font-bold font-mono" data-testid="text-dialog-level">
                      {selectedRig.upgradeLevel}/{MAX_UPGRADE_LEVEL}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Boost</p>
                    <p className="text-lg font-bold font-mono text-neon-orange" data-testid="text-dialog-boost">
                      +{((selectedRig.currentHashrate / (selectedRig.equipmentType.baseHashrate * selectedRig.quantity) - 1) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                    <p className="text-lg font-bold font-mono" data-testid="text-dialog-quantity">
                      {selectedRig.quantity}
                    </p>
                  </div>
                </div>
              </div>

              {selectedRig.upgradeLevel < MAX_UPGRADE_LEVEL ? (
                <div className="p-4 rounded-md border bg-card">
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">
                    Next Upgrade Available
                  </h4>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Upgrade to Level</span>
                      <span className="font-mono font-semibold" data-testid="text-next-level">
                        {selectedRig.upgradeLevel + 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Hashrate Increase</span>
                      <span className="font-mono text-matrix-green" data-testid="text-hashrate-increase">
                        +{(selectedRig.equipmentType.baseHashrate * 0.1 * selectedRig.quantity).toFixed(2)} GH/s
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Upgrade Cost</span>
                      <span className="font-mono font-semibold" data-testid="text-dialog-upgrade-cost">
                        {calculateUpgradeCost(selectedRig.equipmentType.basePrice, selectedRig.upgradeLevel).toLocaleString()} CS
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your Balance</span>
                      <span className={`font-mono ${(user?.csBalance ?? 0) >= calculateUpgradeCost(selectedRig.equipmentType.basePrice, selectedRig.upgradeLevel) ? 'text-matrix-green' : 'text-destructive'}`} data-testid="text-dialog-balance">
                        {user?.csBalance?.toLocaleString() ?? 0} CS
                      </span>
                    </div>
                  </div>

                  {(user?.csBalance ?? 0) < calculateUpgradeCost(selectedRig.equipmentType.basePrice, selectedRig.upgradeLevel) && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 mb-4">
                      <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-destructive">
                        Insufficient CS balance. You need{' '}
                        {(calculateUpgradeCost(selectedRig.equipmentType.basePrice, selectedRig.upgradeLevel) - (user?.csBalance ?? 0)).toLocaleString()}{' '}
                        more CS to upgrade.
                      </p>
                    </div>
                  )}

                  <Button
                    size="default"
                    variant="default"
                    className="w-full"
                    disabled={
                      upgradeMutation.isPending ||
                      (user?.csBalance ?? 0) < calculateUpgradeCost(selectedRig.equipmentType.basePrice, selectedRig.upgradeLevel)
                    }
                    onClick={() => handleUpgrade(selectedRig.equipmentTypeId)}
                    data-testid="button-upgrade-confirm"
                  >
                    {upgradeMutation.isPending ? (
                      "Upgrading..."
                    ) : (
                      <>
                        Upgrade for {calculateUpgradeCost(selectedRig.equipmentType.basePrice, selectedRig.upgradeLevel).toLocaleString()} CS
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="p-6 rounded-md border bg-muted/30 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-matrix-green" />
                  <h4 className="text-lg font-semibold mb-2">Maximum Level Reached</h4>
                  <p className="text-sm text-muted-foreground">
                    This equipment is fully upgraded to level {MAX_UPGRADE_LEVEL}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
