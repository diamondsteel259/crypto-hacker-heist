import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Cpu, Server, Boxes, Zap, Rocket, Shield, ShoppingBag, CheckCircle2 } from "lucide-react";
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
  Laptop: Monitor,
  Desktop: Cpu,
  Server: Server,
  ASIC: Boxes,
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
    <Card className="p-3 md:p-4 hover-elevate transition-all">
      <div className="flex items-start justify-between mb-2 md:mb-3">
        <div className="flex items-center gap-1 md:gap-2">
          <Icon className="w-4 md:w-5 h-4 md:h-5 text-matrix-green" />
          <Badge 
            variant="outline" 
            className={`text-[10px] md:text-xs ${tierColors[equipment.tier as keyof typeof tierColors] || tierColors.Basic}`}
          >
            {equipment.tier.toUpperCase()}
          </Badge>
        </div>
        <div className="text-right">
          <p className="text-[10px] md:text-xs text-muted-foreground">{owned}/{equipment.maxOwned}</p>
        </div>
      </div>

      <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">{equipment.name}</h4>

      <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
        <div className="flex items-center justify-between text-[10px] md:text-xs">
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
          variant={equipment.currency === "TON" ? "default" : "default"}
          className={equipment.currency === "TON" ? "w-full bg-ton-blue hover:bg-ton-blue/90" : "w-full"}
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

  const { data: allEquipment = [], isLoading: isLoadingTypes } = useQuery<EquipmentType[]>({
    queryKey: ["/api/equipment-types"],
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
    if (!acc[eq.category]) {
      acc[eq.category] = {};
    }
    if (!acc[eq.category][eq.tier]) {
      acc[eq.category][eq.tier] = [];
    }
    acc[eq.category][eq.tier].push(eq);
    return acc;
  }, {} as Record<string, Record<string, EquipmentType[]>>);

  const csBalance = user?.csBalance || 0;

  if (isLoadingTypes) {
    return (
      <div className="min-h-screen bg-background p-2 md:p-4">
        <div className="max-w-7xl mx-auto space-y-3 md:space-y-6">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <ShoppingBag className="w-6 md:w-8 h-6 md:h-8 text-matrix-green" />
            <h1 className="text-xl md:text-3xl font-bold terminal-gradient">EQUIPMENT SHOP</h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-2 md:p-4">
      <div className="max-w-7xl mx-auto space-y-3 md:space-y-6">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <ShoppingBag className="w-6 md:w-8 h-6 md:h-8 text-matrix-green" />
          <h1 className="text-xl md:text-3xl font-bold terminal-gradient">EQUIPMENT SHOP</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4 md:mb-6">
            <TabsTrigger value="equipment" data-testid="tab-equipment">
              <Cpu className="w-4 h-4 mr-2" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="powerups" data-testid="tab-powerups" disabled>
              <Zap className="w-4 h-4 mr-2" />
              Power-Ups (Soon)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipment" className="space-y-4 md:space-y-6">
            {Object.keys(groupedEquipment).length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No equipment available. Check back later!</p>
              </Card>
            ) : (
              Object.entries(groupedEquipment).map(([category, tiers]) => (
                <div key={category} className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = categoryIcons[category as keyof typeof categoryIcons] || Cpu;
                      return <Icon className="w-5 h-5 text-matrix-green" />;
                    })()}
                    <h2 className="text-base md:text-lg font-semibold uppercase tracking-wider">
                      {category}
                    </h2>
                    <Badge variant="outline" className="text-xs">
                      {Object.values(tiers).flat().length} items
                    </Badge>
                  </div>

                  {Object.entries(tiers).map(([tier, equipment]) => (
                    <div key={tier} className="space-y-2 md:space-y-3">
                      <h3 className="text-xs md:text-sm text-muted-foreground uppercase pl-2">
                        {tier} Tier
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
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

          <TabsContent value="powerups">
            <Card className="p-8 text-center">
              <Rocket className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Power-Ups coming soon!</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
