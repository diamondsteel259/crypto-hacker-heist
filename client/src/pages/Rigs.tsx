import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Zap, Monitor, TrendingUp, AlertCircle, Save, Trash2, FolderOpen, Settings, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserId } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { OwnedEquipment, EquipmentType, User } from "@shared/schema";

type UserEquipment = OwnedEquipment & { equipmentType: EquipmentType };

interface EquipmentPreset {
  id: number;
  userId: string;
  presetName: string;
  equipmentSnapshot: string;
  createdAt: string;
  updatedAt: string;
}

interface UpgradeResponse {
  success: boolean;
  user: User;
  upgradeCost: number;
  newLevel: number;
  hashrateIncrease: number;
}

const MAX_UPGRADE_LEVEL = 10;

function calculateUpgradeCost(basePrice: number, currentLevel: number, tier: string): number {
  // Price scaling: +5% per buy after 10 (mid/high-tiers only)
  if (tier === 'Basic' || tier === 'Gaming') {
    // Basic and Gaming tiers: no price scaling
    return Math.floor(basePrice * Math.pow(1.1, currentLevel));
  } else {
    // Mid-tier (Gaming PCs/Server Farms) and High-tier (ASICs): +5% per buy after 10
    if (currentLevel >= 10) {
      const scalingFactor = Math.pow(1.05, currentLevel - 9); // Start scaling after 10th purchase
      return Math.floor(basePrice * scalingFactor);
    } else {
      return Math.floor(basePrice * Math.pow(1.1, currentLevel));
    }
  }
}

export default function Rigs() {
  const [selectedRig, setSelectedRig] = useState<UserEquipment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [viewPresetDialog, setViewPresetDialog] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<EquipmentPreset | null>(null);
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

  const { data: presets = [] } = useQuery<EquipmentPreset[]>({
    queryKey: ["/api/user", userId, "equipment", "presets"],
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

  const savePresetMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest('POST', `/api/user/${userId}/equipment/presets`, { presetName: name });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "equipment", "presets"] });
      setPresetDialogOpen(false);
      setPresetName("");
      toast({
        title: "Preset Saved!",
        description: data.message || "Equipment preset saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePresetMutation = useMutation({
    mutationFn: async (presetId: number) => {
      const response = await apiRequest('DELETE', `/api/user/${userId}/equipment/presets/${presetId}`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "equipment", "presets"] });
      toast({
        title: "Preset Deleted",
        description: data.message || "Preset deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
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

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your preset",
        variant: "destructive",
      });
      return;
    }
    savePresetMutation.mutate(presetName.trim());
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

        {/* Equipment Presets Section */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-cyan-500" />
              <h3 className="font-semibold text-base">Equipment Presets</h3>
            </div>
            <Button
              size="sm"
              onClick={() => setPresetDialogOpen(true)}
              disabled={equipment.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Current Setup
            </Button>
          </div>

          {presets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {presets.map((preset) => (
                <Card
                  key={preset.id}
                  className="p-3 hover-elevate transition-all cursor-pointer border-dashed"
                  onClick={() => {
                    setSelectedPreset(preset);
                    setViewPresetDialog(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm truncate">{preset.presetName}</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete preset "${preset.presetName}"?`)) {
                          deletePresetMutation.mutate(preset.id);
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Saved {new Date(preset.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-matrix-green mt-1">
                    {JSON.parse(preset.equipmentSnapshot).length} equipment items
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">
                No saved presets yet. Save your current equipment setup to quickly reference it later.
              </p>
            </div>
          )}
        </Card>

        {/* Rigs Grid */}
        {equipment.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {equipment.map((eq) => {
              const baseHashrate = eq.equipmentType.baseHashrate * eq.quantity;
              const boostPercent = ((eq.currentHashrate / baseHashrate - 1) * 100);
              const upgradeCost = eq.upgradeLevel < MAX_UPGRADE_LEVEL
                ? calculateUpgradeCost(eq.equipmentType.basePrice, eq.upgradeLevel, eq.equipmentType.tier)
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
                        {calculateUpgradeCost(selectedRig.equipmentType.basePrice, selectedRig.upgradeLevel, selectedRig.equipmentType.tier).toLocaleString()} CS
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your Balance</span>
                      <span className={`font-mono ${(user?.csBalance ?? 0) >= calculateUpgradeCost(selectedRig.equipmentType.basePrice, selectedRig.upgradeLevel, selectedRig.equipmentType.tier) ? 'text-matrix-green' : 'text-destructive'}`} data-testid="text-dialog-balance">
                        {user?.csBalance?.toLocaleString() ?? 0} CS
                      </span>
                    </div>
                  </div>

                  {(user?.csBalance ?? 0) < calculateUpgradeCost(selectedRig.equipmentType.basePrice, selectedRig.upgradeLevel, selectedRig.equipmentType.tier) && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 mb-4">
                      <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-destructive">
                        Insufficient CS balance. You need{' '}
                        {(calculateUpgradeCost(selectedRig.equipmentType.basePrice, selectedRig.upgradeLevel, selectedRig.equipmentType.tier) - (user?.csBalance ?? 0)).toLocaleString()}{' '}
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
                      (user?.csBalance ?? 0) < calculateUpgradeCost(selectedRig.equipmentType.basePrice, selectedRig.upgradeLevel, selectedRig.equipmentType.tier)
                    }
                    onClick={() => handleUpgrade(selectedRig.equipmentTypeId)}
                    data-testid="button-upgrade-confirm"
                  >
                    {upgradeMutation.isPending ? (
                      "Upgrading..."
                    ) : (
                      <>
                        Upgrade for {calculateUpgradeCost(selectedRig.equipmentType.basePrice, selectedRig.upgradeLevel, selectedRig.equipmentType.tier).toLocaleString()} CS
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

      {/* Save Preset Dialog */}
      <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-cyan-500" />
              Save Equipment Preset
            </DialogTitle>
            <DialogDescription>
              Save your current equipment configuration for easy reference
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="e.g., Mining Setup 2024"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSavePreset();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                {presetName.length}/50 characters
              </p>
            </div>

            <div className="p-3 rounded-md bg-muted/30 border">
              <p className="text-sm font-semibold mb-2">Current Equipment Summary</p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Total Equipment: {equipment.length} items
                </p>
                <p className="text-xs text-muted-foreground">
                  Total Hashrate: {totalHashrate.toFixed(2)} GH/s
                </p>
                <p className="text-xs text-muted-foreground">
                  Average Level: {avgUpgradeLevel.toFixed(1)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setPresetDialogOpen(false);
                  setPresetName("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSavePreset}
                disabled={savePresetMutation.isPending || !presetName.trim()}
              >
                {savePresetMutation.isPending ? "Saving..." : "Save Preset"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Preset Dialog */}
      <Dialog open={viewPresetDialog} onOpenChange={setViewPresetDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-cyan-500" />
              {selectedPreset?.presetName}
            </DialogTitle>
            <DialogDescription>
              Saved on {selectedPreset && new Date(selectedPreset.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedPreset && (() => {
            const snapshotData = JSON.parse(selectedPreset.equipmentSnapshot) as UserEquipment[];
            const presetTotalHashrate = snapshotData.reduce((sum, eq) => sum + eq.currentHashrate, 0);
            const presetAvgLevel = snapshotData.length > 0
              ? snapshotData.reduce((sum, eq) => sum + eq.upgradeLevel, 0) / snapshotData.length
              : 0;

            return (
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-muted/30 border">
                  <h4 className="text-sm font-semibold mb-3">Preset Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Equipment</p>
                      <p className="text-lg font-bold font-mono">{snapshotData.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total Hashrate</p>
                      <p className="text-lg font-bold font-mono text-matrix-green">
                        {presetTotalHashrate.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">GH/s</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Avg Level</p>
                      <p className="text-lg font-bold font-mono">
                        {presetAvgLevel.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Equipment List</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {snapshotData.map((eq, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Monitor className="w-4 h-4 text-matrix-green" />
                              <h5 className="font-semibold text-sm">{eq.equipmentType.name}</h5>
                              <Badge variant="outline" className="text-xs">
                                Level {eq.upgradeLevel}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Tier: </span>
                                <span className="font-mono">{eq.equipmentType.tier}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Quantity: </span>
                                <span className="font-mono">{eq.quantity}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Hashrate: </span>
                                <span className="font-mono text-matrix-green">
                                  {eq.currentHashrate.toFixed(2)} GH/s
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Base Price: </span>
                                <span className="font-mono">
                                  {eq.equipmentType.basePrice.toLocaleString()} CS
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setViewPresetDialog(false)}
                >
                  Close
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
