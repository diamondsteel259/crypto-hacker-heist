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
  
  // Calculate price with +5% scaling after 10 purchases for mid/high tiers
  const getCurrentPrice = () => {
    // Only the first Basic Laptop model (Lenovo ThinkPad E14) is free for first purchase
    if (equipment.id === "laptop-lenovo-e14" && owned === 0) {
      return 0;
    }
    
    if (owned < 10) return equipment.basePrice;
    
    const isMidHighTier = equipment.category === "Gaming PC" || 
                         equipment.category === "Server Farm" || 
                         equipment.category === "ASIC Rig";
    
    if (isMidHighTier) {
      const scalingFactor = Math.pow(1.05, owned - 9); // +5% per buy after 10
      return Math.floor(equipment.basePrice * scalingFactor);
    }
    
    return equipment.basePrice;
  };
  
  const currentPrice = getCurrentPrice();
  const canAfford = equipment.currency === "CS" 
    ? userBalance >= currentPrice 
    : equipment.currency === "TON" 
    ? true // TON purchases handled by wallet connection
    : false;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="w-5 h-5 text-matrix-green" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{equipment.name}</h3>
            <p className="text-xs text-muted-foreground">{equipment.category}</p>
          </div>
        </div>
        <Badge className={tierColors[equipment.tier as keyof typeof tierColors] || "bg-gray-500/20"}>
          {equipment.tier}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Hashrate:</span>
          <span className="text-matrix-green font-mono">{equipment.baseHashrate.toLocaleString()} H/s</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Price:</span>
          <div className="text-right">
            {currentPrice === 0 ? (
              <span className="font-mono text-matrix-green">FREE</span>
            ) : (
              <span className={`font-mono ${equipment.currency === "CS" ? "text-matrix-green" : "text-cyber-blue"}`}>
                {currentPrice.toLocaleString()} {equipment.currency}
              </span>
            )}
            {owned >= 10 && (equipment.category === "Gaming PC" || equipment.category === "Server Farm" || equipment.category === "ASIC Rig") && (
              <p className="text-xs text-orange-500">+5% scaling</p>
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Owned:</span>
          <span className="text-muted-foreground">{owned}/{equipment.maxOwned}</span>
        </div>
      </div>

      <Button
        onClick={onPurchase}
        disabled={isPurchasing || isMaxed || !canAfford}
        className={`w-full text-xs ${
          equipment.currency === "CS" 
            ? "bg-matrix-green hover:bg-matrix-green/90 text-black" 
            : "bg-cyber-blue hover:bg-cyber-blue/90 text-white"
        }`}
      >
        {isPurchasing ? (
          "Purchasing..."
        ) : isMaxed ? (
          <CheckCircle2 className="w-4 h-4 mr-2" />
        ) : !canAfford ? (
          "Insufficient Funds"
        ) : currentPrice === 0 ? (
          "FREE - Claim Now!"
        ) : (
          `Buy for ${currentPrice.toLocaleString()} ${equipment.currency}`
        )}
      </Button>
    </Card>
  );
}

export default function Shop() {
  const [activeTab, setActiveTab] = useState("equipment");
  const { toast } = useToast();
  const userId = getCurrentUserId();

  console.log("Shop component rendering...");

  const { data: allEquipment = [], isLoading: isLoadingTypes, error: equipmentError, refetch: refetchEquipment } = useQuery<EquipmentType[]>({
    queryKey: ["/api/equipment-types"],
    staleTime: 0,
    cacheTime: 0,
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
    mutationFn: async (equipmentTypeId: string) => {
      console.log("Attempting to purchase equipment:", equipmentTypeId);
      const response = await apiRequest("POST", `/api/user/${userId}/equipment/purchase`, {
        equipmentTypeId
      });
      console.log("Purchase response:", response);
      const data = await response.json();
      console.log("Purchase response data:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Purchase successful:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "equipment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      toast({ 
        title: "Equipment purchased successfully!",
        description: "Your new equipment has been added to your inventory"
      });
    },
    onError: (error: any) => {
      console.error("Purchase failed:", error);
      toast({ 
        title: "Purchase failed", 
        description: error.message || "Failed to purchase equipment. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const getOwnedCount = (equipmentTypeId: string): number => {
    const owned = ownedEquipment.find(e => e.equipmentTypeId === equipmentTypeId);
    return owned?.quantity || 0;
  };

  // Group equipment by category and tier for proper display
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

  console.log("Shop Debug:", {
    allEquipment: allEquipment.length,
    allEquipmentData: allEquipment.slice(0, 3),
    isLoadingTypes,
    equipmentError,
    groupedEquipment: Object.keys(groupedEquipment).length,
    groupedEquipmentKeys: Object.keys(groupedEquipment),
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
            <Button onClick={() => refetchEquipment()} className="mt-4">
              Retry
            </Button>
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
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-8 w-full" />
              </Card>
            ))}
          </div>
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
          <div className="text-right">
            <p className="text-sm text-muted-foreground">CS Balance</p>
            <p className="text-lg font-mono text-matrix-green">{csBalance.toLocaleString()}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-4">
            <TabsTrigger value="equipment" data-testid="tab-equipment">
              <Cpu className="w-4 h-4 mr-2" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="upgrades" data-testid="tab-upgrades">
              <Rocket className="w-4 h-4 mr-2" />
              Upgrades
            </TabsTrigger>
            <TabsTrigger value="powerups" data-testid="tab-powerups">
              <Zap className="w-4 h-4 mr-2" />
              Power-Ups
            </TabsTrigger>
            <TabsTrigger value="lootboxes" data-testid="tab-lootboxes">
              <Gem className="w-4 h-4 mr-2" />
              Loot Boxes
            </TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipment" className="space-y-4">
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
                <Button onClick={() => refetchEquipment()} className="mt-4">
                  Refresh Data
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedEquipment).map(([category, tierGroups]) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons] || Cpu;
                  const totalModels = Object.values(tierGroups).flat().length;
                  
                  return (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-matrix-green" />
                        <h2 className="text-lg font-semibold">{category}</h2>
                        <Badge variant="secondary">{totalModels} models</Badge>
                        <Badge variant="outline">
                          {category === "Basic Laptop" || category === "Gaming Laptop" ? "10 per model" : 
                           category === "Gaming PC" || category === "Server Farm" ? "25 per model" : 
                           category === "ASIC Rig" ? "50 per model" : "N/A"}
                        </Badge>
                      </div>
                      
                      {Object.entries(tierGroups).map(([tier, equipmentList]) => (
                        <div key={tier} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <h3 className="text-md font-medium">{tier} Tier</h3>
                            <Badge className={tierColors[tier as keyof typeof tierColors] || "bg-gray-500/20"}>
                              {tier}
                            </Badge>
                            <Badge variant="outline">{equipmentList.length} models</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {equipmentList.map((equipment) => (
                              <EquipmentCard
                                key={equipment.id}
                                equipment={equipment}
                                owned={getOwnedCount(equipment.id)}
                                onPurchase={() => purchaseMutation.mutate(equipment.id)}
                                isPurchasing={purchaseMutation.isPending}
                                userBalance={csBalance}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upgrades" className="space-y-4">
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Rocket className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold">Equipment Upgrades</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Upgrade your owned equipment to increase hashrate by +20%
                </p>
                
                {ownedEquipment.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No equipment owned yet</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Buy equipment first, then come back to upgrade it
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ownedEquipment.map((owned) => (
                      <div key={owned.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            <Cpu className="w-4 h-4 text-matrix-green" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{owned.equipmentType.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {owned.quantity} owned • {owned.equipmentType.baseHashrate.toLocaleString()} H/s each
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Upgrade Cost</p>
                          <p className="text-sm font-mono text-matrix-green">
                            {Math.floor(owned.equipmentType.basePrice * 0.5).toLocaleString()} CS
                          </p>
                          <Button size="sm" className="mt-1">
                            Upgrade All
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Network Status</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">TON Rigs %</p>
                    <p className="text-lg font-mono text-cyber-blue">45%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="text-lg font-mono text-matrix-green">Healthy</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  TON rigs must stay ≤70% of total network hashrate
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="powerups" className="space-y-4">
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Daily Free Power-Ups</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Get 5 free CS/CHST power-ups every day!
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="bg-matrix-green hover:bg-matrix-green/90 text-black">
                    <Star className="w-4 h-4 mr-2" />
                    Claim CS (5/5)
                  </Button>
                  <Button className="bg-cyber-blue hover:bg-cyber-blue/90 text-white">
                    <Crown className="w-4 h-4 mr-2" />
                    Claim CHST (5/5)
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Rocket className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold">Premium Power-Ups</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Unlimited TON purchases for boosts and upgrades
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Button className="bg-cyber-blue hover:bg-cyber-blue/90 text-white">
                    <Shield className="w-4 h-4 mr-2" />
                    Buy Hashrate Boost (0.1 TON)
                  </Button>
                  <Button className="bg-cyber-blue hover:bg-cyber-blue/90 text-white">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Buy Luck Boost (0.2 TON)
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lootboxes" className="space-y-4">
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Gem className="w-5 h-5 text-pink-500" />
                  <h3 className="text-lg font-semibold">Mystery Boxes</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  TON-cost boxes with 100-110% RTP average
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button className="bg-cyber-blue hover:bg-cyber-blue/90 text-white">
                    <Gift className="w-4 h-4 mr-2" />
                    Basic Box (0.5 TON)
                  </Button>
                  <Button className="bg-cyber-blue hover:bg-cyber-blue/90 text-white">
                    <Gift className="w-4 h-4 mr-2" />
                    Premium Box (2 TON)
                  </Button>
                  <Button className="bg-cyber-blue hover:bg-cyber-blue/90 text-white">
                    <Gift className="w-4 h-4 mr-2" />
                    Epic Box (5 TON)
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Free Loot Boxes</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Earn free boxes through tasks and invites
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Button className="bg-matrix-green hover:bg-matrix-green/90 text-black">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Daily Task (1/1)
                  </Button>
                  <Button className="bg-matrix-green hover:bg-matrix-green/90 text-black">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Invite Friend (2/2)
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-matrix-green" />
                  <h3 className="text-lg font-semibold">Daily Tasks</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete daily tasks to earn rewards and free loot boxes
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-matrix-green/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-matrix-green" />
                      <div>
                        <p className="font-medium">Mine Your First Block</p>
                        <p className="text-sm text-muted-foreground">Purchase any equipment to start mining</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-matrix-green hover:bg-matrix-green/90 text-black">
                      Claim 1,000 CS
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-cyber-blue/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-cyber-blue" />
                      <div>
                        <p className="font-medium">Reach 1,000 H/s</p>
                        <p className="text-sm text-muted-foreground">Accumulate 1,000 total hashrate</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-cyber-blue hover:bg-cyber-blue/90 text-white">
                      Claim 2,000 CS
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neon-orange/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Crown className="w-5 h-5 text-neon-orange" />
                      <div>
                        <p className="font-medium">Buy Your First ASIC</p>
                        <p className="text-sm text-muted-foreground">Purchase any ASIC mining rig</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-neon-orange hover:bg-neon-orange/90 text-white">
                      Claim Free Loot Box
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Gem className="w-5 h-5 text-pink-500" />
                  <h3 className="text-lg font-semibold">Referral Tasks</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Invite friends to earn bonus rewards
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-pink-500/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-pink-500" />
                      <div>
                        <p className="font-medium">Invite 1 Friend</p>
                        <p className="text-sm text-muted-foreground">Get them to join the network</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-pink-500 hover:bg-pink-500/90 text-white">
                      Claim 5,000 CS
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Invite 5 Friends</p>
                        <p className="text-sm text-muted-foreground">Build your mining network</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-purple-500 hover:bg-purple-500/90 text-white">
                      Claim Premium Loot Box
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
