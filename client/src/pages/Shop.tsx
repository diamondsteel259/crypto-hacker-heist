import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Cpu, Server, Boxes, Zap, Rocket, Shield, ShoppingBag, CheckCircle2, Gem, Star, Crown, Sparkles, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserId } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { EquipmentType, OwnedEquipment, User } from "@shared/schema";

type UserEquipment = OwnedEquipment & { equipmentType: EquipmentType };

const tierColors = {
  Basic: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  Gaming: "bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30",
  Professional: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  Enterprise: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  Specialized: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  ASIC: "bg-neon-orange/20 text-neon-orange border-neon-orange/30",
  "Data Center": "bg-chart-5/20 text-chart-5 border-chart-5/30",
};

const categoryIcons = {
  "Basic Laptop": Monitor,
  "Gaming Laptop": Monitor,
  "Gaming PC": Cpu,
  "Server Farm": Server,
  "ASIC Rig": Boxes,
};

interface EquipmentCardProps {
  equipment: EquipmentType;
  owned: number;
  onPurchase: () => void;
  isPurchasing: boolean;
  userBalance: number;
}

function EquipmentCard({ equipment, owned, onPurchase, isPurchasing, userBalance }: EquipmentCardProps) {
  const Icon = categoryIcons[equipment.category as keyof typeof categoryIcons] || Cpu;
  const isMaxed = owned >= equipment.maxOwned;
  const canAfford = equipment.currency === "CS" 
    ? userBalance >= equipment.basePrice 
    : equipment.currency === "TON" 
    ? true // TON purchases handled by wallet connection
    : false;

  const formatHashrate = (hr: number) => {
    if (hr >= 1000000) return `${(hr / 1000000).toFixed(1)} MH/s`;
    if (hr >= 1000) return `${(hr / 1000).toFixed(1)} KH/s`;
    return `${hr.toFixed(0)} H/s`;
  };

  const formatPrice = (p: number) => {
    if (p >= 1000000) return `${(p / 1000000).toFixed(1)}M`;
    if (p >= 1000) return `${(p / 1000).toFixed(1)}K`;
    return p.toLocaleString();
  };

  return (
    <Card className="p-3 hover-elevate transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1">
          <Icon className="w-4 h-4 text-matrix-green" />
          <Badge 
            variant="outline" 
            className={`text-[10px] ${tierColors[equipment.tier as keyof typeof tierColors] || tierColors.Basic}`}
          >
            {equipment.tier.toUpperCase()}
          </Badge>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">{owned}/{equipment.maxOwned}</p>
        </div>
      </div>

      <h4 className="font-semibold text-xs mb-2 line-clamp-2">{equipment.name}</h4>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Hashrate
          </span>
          <span className="font-mono font-semibold text-matrix-green">
            {formatHashrate(equipment.baseHashrate)}
          </span>
        </div>
      </div>

      {isMaxed ? (
        <Button
          size="sm"
          variant="secondary"
          className="w-full"
          disabled
          data-testid={`button-buy-${equipment.id}`}
        >
          <CheckCircle2 className="w-3 h-3 mr-2" />
          Max Owned
        </Button>
      ) : (
        <Button
          size="sm"
          variant="default"
          className={`w-full ${
            equipment.currency === "TON" 
              ? "bg-cyber-blue hover:bg-cyber-blue/90 text-white" 
              : equipment.currency === "CS"
              ? "bg-matrix-green hover:bg-matrix-green/90 text-white"
              : "bg-muted hover:bg-muted/90"
          }`}
          onClick={onPurchase}
          disabled={isPurchasing || (equipment.currency === "CS" && !canAfford)}
          data-testid={`button-buy-${equipment.id}`}
        >
          {isPurchasing ? "Purchasing..." : `Buy ${formatPrice(equipment.basePrice)} ${equipment.currency}`}
        </Button>
      )}
      {equipment.currency === "CS" && !canAfford && !isMaxed && (
        <p className="text-[10px] text-destructive mt-1 text-center">Insufficient CS</p>
      )}
    </Card>
  );
}

export default function Shop() {
  const [activeTab, setActiveTab] = useState("equipment");
  const { toast } = useToast();
  const userId = getCurrentUserId();

  // Force render test
  console.log("Shop component rendering...");

  const { data: allEquipment = [], isLoading: isLoadingTypes, error: equipmentError, refetch: refetchEquipment } = useQuery<EquipmentType[]>({
    queryKey: ["/api/equipment-types"],
    staleTime: 0, // Always refetch
    cacheTime: 0, // Don't cache
  });

  const { data: ownedEquipment = [] } = useQuery<UserEquipment[]>({
    queryKey: ["/api/user", userId, "equipment"],
    enabled: !!userId,
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  const purchaseMutation = useMutation({
    mutationFn: async ({ equipmentTypeId }: { equipmentTypeId: string }) => {
      const response = await apiRequest(
        "POST",
        `/api/user/${userId}/equipment/purchase`,
        { equipmentTypeId, quantity: 1 }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful!",
        description: "Equipment added to your inventory",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "equipment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getOwnedCount = (equipmentTypeId: string): number => {
    const owned = ownedEquipment.find(e => e.equipmentTypeId === equipmentTypeId);
    return owned?.quantity || 0;
  };

  const groupedEquipment = allEquipment.reduce((acc, eq) => {
    try {
      if (!acc[eq.category]) {
        acc[eq.category] = {};
      }
      if (!acc[eq.category][eq.tier]) {
        acc[eq.category][eq.tier] = [];
      }
      acc[eq.category][eq.tier].push(eq);
    } catch (error) {
      console.error("Error processing equipment:", eq, error);
    }
    return acc;
  }, {} as Record<string, Record<string, EquipmentType[]>>);

  const csBalance = user?.csBalance || 0;

  // Debug logging
  console.log("Shop Debug:", {
    allEquipment: allEquipment.length,
    allEquipmentData: allEquipment,
    isLoadingTypes,
    equipmentError,
    groupedEquipment: Object.keys(groupedEquipment).length,
    groupedEquipmentData: groupedEquipment,
    userId
  });

  if (equipmentError) {
    return (
      <div className="min-h-screen bg-background p-3">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-6 h-6 text-matrix-green" />
            <h1 className="text-xl font-bold terminal-gradient">EQUIPMENT SHOP</h1>
          </div>
          <Card className="p-8 text-center">
            <p className="text-destructive">Error loading equipment: {equipmentError.message}</p>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoadingTypes) {
    return (
      <div className="min-h-screen bg-background p-3">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-6 h-6 text-matrix-green" />
            <h1 className="text-xl font-bold terminal-gradient">EQUIPMENT SHOP</h1>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Simple test render
  if (allEquipment.length === 0 && !isLoadingTypes) {
    return (
      <div className="min-h-screen bg-background p-3">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-6 h-6 text-matrix-green" />
            <h1 className="text-xl font-bold terminal-gradient">EQUIPMENT SHOP</h1>
          </div>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading equipment data...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Debug: {allEquipment.length} equipment items loaded
            </p>
            <Button onClick={() => refetchEquipment()} className="mt-4">
              Refresh Data
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-matrix-green" />
            <h1 className="text-xl font-bold terminal-gradient">EQUIPMENT SHOP</h1>
          </div>
          <Button 
            onClick={() => refetchEquipment()} 
            size="sm" 
            variant="outline"
            className="text-xs"
          >
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="equipment" data-testid="tab-equipment">
              <Cpu className="w-4 h-4 mr-2" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="powerups" data-testid="tab-powerups">
              <Zap className="w-4 h-4 mr-2" />
              Power-Ups
            </TabsTrigger>
            <TabsTrigger value="lootboxes" data-testid="tab-lootboxes">
              <Gem className="w-4 h-4 mr-2" />
              Loot Boxes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipment" className="space-y-4">
            {/* Always show equipment data for debugging */}
            {allEquipment.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Equipment Data ({allEquipment.length} items):</h3>
                <div className="grid grid-cols-1 gap-2">
                  {allEquipment.slice(0, 5).map((eq) => (
                    <Card key={eq.id} className="p-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-semibold">{eq.name}</h4>
                          <p className="text-xs text-muted-foreground">{eq.category} - {eq.tier}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-matrix-green">{eq.baseHashrate} H/s</p>
                          <p className="text-xs text-cyber-blue">{eq.basePrice} {eq.currency}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {Object.keys(groupedEquipment).length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  {allEquipment.length === 0 
                    ? "No equipment data loaded. Please refresh the page." 
                    : "No equipment available. Check back later!"
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Debug: {allEquipment.length} equipment items loaded
                </p>
                {allEquipment.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">Raw equipment data:</p>
                    <pre className="text-xs text-left mt-2 p-2 bg-muted rounded">
                      {JSON.stringify(allEquipment.slice(0, 3), null, 2)}
                    </pre>
                  </div>
                )}
                {allEquipment.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">Direct Equipment List:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {allEquipment.slice(0, 6).map((eq) => (
                        <Card key={eq.id} className="p-2">
                          <h4 className="text-xs font-semibold">{eq.name}</h4>
                          <p className="text-xs text-muted-foreground">{eq.category} - {eq.tier}</p>
                          <p className="text-xs text-matrix-green">{eq.baseHashrate} H/s</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              Object.entries(groupedEquipment).map(([category, tiers]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = categoryIcons[category as keyof typeof categoryIcons] || Cpu;
                      return <Icon className="w-5 h-5 text-matrix-green" />;
                    })()}
                    <h2 className="text-base font-semibold uppercase tracking-wider">
                      {category}
                    </h2>
                    <Badge variant="outline" className="text-xs">
                      {Object.values(tiers).flat().length} items
                    </Badge>
                  </div>

                  {Object.entries(tiers).map(([tier, equipment]) => (
                    <div key={tier} className="space-y-2">
                      <h3 className="text-xs text-muted-foreground uppercase pl-2">
                        {tier} Tier
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {equipment
                          .sort((a, b) => a.orderIndex - b.orderIndex)
                          .map((eq) => (
                            <EquipmentCard
                              key={eq.id}
                              equipment={eq}
                              owned={getOwnedCount(eq.id)}
                              onPurchase={() => purchaseMutation.mutate({ equipmentTypeId: eq.id })}
                              isPurchasing={purchaseMutation.isPending}
                              userBalance={csBalance}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="powerups" className="space-y-4">
            {/* Daily Free Power-Ups */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-neon-orange" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Daily Free Power-Ups</h3>
                <Badge variant="outline" className="text-xs">5 Free Today</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Get 5 free CS/CHST power-ups daily. Resets every 24 hours.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-12">
                  <Star className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="text-xs font-semibold">Hashrate Boost</div>
                    <div className="text-[10px] text-muted-foreground">+50% for 1 hour</div>
                  </div>
                </Button>
                <Button variant="outline" size="sm" className="h-12">
                  <Clock className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="text-xs font-semibold">Auto-Mine</div>
                    <div className="text-[10px] text-muted-foreground">24 hours</div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* TON Power-Ups */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-cyber-blue" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Premium Power-Ups</h3>
                <Badge variant="outline" className="text-xs">TON Only</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Unlimited TON purchases. No daily limits.
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" size="sm" className="h-12 justify-between">
                  <div className="flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="text-xs font-semibold">Mega Hashrate Boost</div>
                      <div className="text-[10px] text-muted-foreground">+200% for 6 hours</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-cyber-blue">0.5 TON</div>
                </Button>
                <Button variant="outline" size="sm" className="h-12 justify-between">
                  <div className="flex items-center">
                    <Rocket className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="text-xs font-semibold">Lucky Mining</div>
                      <div className="text-[10px] text-muted-foreground">2x rewards for 12 hours</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-cyber-blue">1.0 TON</div>
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="lootboxes" className="space-y-4">
            {/* Mystery Boxes */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gem className="w-5 h-5 text-matrix-green" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Mystery Boxes</h3>
                <Badge variant="outline" className="text-xs">RTP 100-110%</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Open boxes to receive random equipment, CS bonuses, or rare power-ups. 
                Guaranteed 100-110% RTP average (up to 175% epic rewards).
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" size="sm" className="h-12 justify-between">
                  <div className="flex items-center">
                    <Boxes className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="text-xs font-semibold">Basic Mystery Box</div>
                      <div className="text-[10px] text-muted-foreground">Common rewards</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-cyber-blue">0.5 TON</div>
                </Button>
                <Button variant="outline" size="sm" className="h-12 justify-between">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="text-xs font-semibold">Rare Mystery Box</div>
                      <div className="text-[10px] text-muted-foreground">Better rewards</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-cyber-blue">2.0 TON</div>
                </Button>
                <Button variant="outline" size="sm" className="h-12 justify-between">
                  <div className="flex items-center">
                    <Crown className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="text-xs font-semibold">Epic Mystery Box</div>
                      <div className="text-[10px] text-muted-foreground">Best rewards</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-cyber-blue">5.0 TON</div>
                </Button>
              </div>
            </Card>

            {/* Free Loot Boxes */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-neon-orange" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">Free Loot Boxes</h3>
                <Badge variant="outline" className="text-xs">1-2/week</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Earn free loot boxes through tasks and invites. 1-2 boxes per week.
              </p>
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Complete tasks to earn free boxes!</p>
                <Button variant="outline" size="sm" className="mt-2" disabled>
                  <Gift className="w-4 h-4 mr-2" />
                  Tasks Coming Soon
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
