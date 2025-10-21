import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Cpu, Server, Boxes, Zap, Rocket, Shield, ShoppingBag, CheckCircle2, Gem, Star, Crown, Sparkles, Gift, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUserId } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getTonConnectUI, isWalletConnected, getTonBalance, sendTonTransaction } from "@/lib/tonConnect";
import { Address, toNano } from "@ton/core";
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
  onTonPurchase: () => void;
  isPurchasing: boolean;
  userBalance: number;
}

function EquipmentCard({ equipment, owned, onPurchase, onTonPurchase, isPurchasing, userBalance }: EquipmentCardProps) {
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
    ? isWalletConnected() // TON purchases require wallet connection
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
        onClick={equipment.currency === "TON" ? onTonPurchase : onPurchase}
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
          equipment.currency === "TON" ? "Connect Wallet" : "Insufficient Funds"
        ) : currentPrice === 0 ? (
          "FREE - Claim Now!"
        ) : (
          `Buy for ${currentPrice.toLocaleString()} ${equipment.currency}`
        )}
      </Button>
    </Card>
  );
}

// TON payment address as specified by user
const TON_PAYMENT_ADDRESS = "UQBdFhwckY9C8MU0AC4uiPbRH_C3QIjZH6OzV47ROfHjnyfe";

export default function Shop() {
  const [activeTab, setActiveTab] = useState("equipment");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [tonBalance, setTonBalance] = useState<string>("0.0000");
  const { toast } = useToast();
  const userId = getCurrentUserId();

  console.log("Shop component rendering...");

  // Fetch TON balance when wallet is connected
  useEffect(() => {
    const fetchTonBalance = async () => {
      if (isWalletConnected()) {
        try {
          const balance = await getTonBalance();
          setTonBalance(balance);
        } catch (error) {
          console.error("Failed to fetch TON balance:", error);
          setTonBalance("0.0000");
        }
      } else {
        setTonBalance("0.0000");
      }
    };

    fetchTonBalance();
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchTonBalance, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const tonPurchaseMutation = useMutation({
    mutationFn: async ({ equipmentTypeId, price }: { equipmentTypeId: string; price: number }) => {
      console.log("Attempting TON purchase:", { equipmentTypeId, price });
      
      if (!isWalletConnected()) {
        throw new Error("Please connect your TON wallet first");
      }

      // Check if user has enough TON balance
      const currentBalance = parseFloat(tonBalance);
      if (currentBalance < price) {
        throw new Error(`Insufficient TON balance. You have ${tonBalance} TON but need ${price} TON`);
      }

      // Send TON payment using the new utility function
      const result = await sendTonTransaction(
        TON_PAYMENT_ADDRESS,
        price,
        `Equipment purchase: ${equipmentTypeId}`
      );

      console.log("TON transaction result:", result);

      // After successful TON payment, purchase the equipment
      const response = await apiRequest("POST", `/api/user/${userId}/equipment/purchase`, {
        equipmentTypeId
      });
      
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      console.log("TON purchase successful:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "equipment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      // Refresh TON balance after successful purchase
      if (isWalletConnected()) {
        getTonBalance().then(setTonBalance).catch(console.error);
      }
      toast({ 
        title: "Equipment purchased successfully!",
        description: "TON payment completed and equipment added to your inventory"
      });
    },
    onError: (error: any) => {
      console.error("TON purchase failed:", error);
      toast({ 
        title: "TON Purchase failed", 
        description: error.message || "Failed to complete TON payment. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const getOwnedCount = (equipmentTypeId: string): number => {
    const owned = ownedEquipment.find(e => e.equipmentTypeId === equipmentTypeId);
    return owned?.quantity || 0;
  };

  const handlePurchase = (equipmentTypeId: string) => {
    purchaseMutation.mutate(equipmentTypeId);
  };

  const handleTonPurchase = (equipmentTypeId: string, price: number) => {
    tonPurchaseMutation.mutate({ equipmentTypeId, price });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const taskClaimMutation = useMutation({
    mutationFn: async (taskId: string) => {
      console.log("Claiming task:", taskId);
      const response = await apiRequest("POST", `/api/user/${userId}/tasks/claim`, {
        taskId
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      console.log("Task claimed successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      toast({ 
        title: "Task completed!",
        description: data.reward ? `You earned ${data.reward} CS!` : "Reward claimed successfully!"
      });
    },
    onError: (error: any) => {
      console.error("Task claim failed:", error);
      toast({ 
        title: "Task claim failed", 
        description: error.message || "Failed to claim task reward. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const powerUpClaimMutation = useMutation({
    mutationFn: async (claimType: string) => {
      console.log("Claiming daily power-up:", claimType);
      
      // Get user's timezone offset in minutes
      const timezoneOffset = new Date().getTimezoneOffset();
      
      const response = await apiRequest("POST", `/api/user/${userId}/powerups/claim`, {
        type: claimType,
        timezoneOffset,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to claim");
      }
      
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      console.log("Daily claim successful:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      toast({ 
        title: "Daily claim successful!",
        description: `You received ${data.reward} ${data.currency}! ${data.remaining_claims} claims left today.`
      });
    },
    onError: (error: any) => {
      console.error("Daily claim failed:", error);
      toast({ 
        title: "Daily claim failed", 
        description: error.message || "Failed to claim daily reward. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const lootBoxOpenMutation = useMutation({
    mutationFn: async ({ boxType, cost }: { boxType: string; cost?: number }) => {
      console.log("Opening loot box:", { boxType, cost });
      
      if (cost && cost > 0) {
        // TON purchase for paid loot boxes
        if (!isWalletConnected()) {
          throw new Error("Please connect your TON wallet first");
        }

        const tonConnectUI = getTonConnectUI();
        const result = await tonConnectUI.sendTransaction({
          messages: [
            {
              address: TON_PAYMENT_ADDRESS,
              amount: toNano(cost).toString(),
              payload: `Loot box purchase: ${boxType}`,
            },
          ],
          validUntil: Math.floor(Date.now() / 1000) + 600,
        });
        console.log("TON transaction result:", result);
      }

      const response = await apiRequest("POST", `/api/user/${userId}/lootboxes/open`, {
        boxType
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      console.log("Loot box opened successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      toast({ 
        title: "Loot box opened!",
        description: `You received: ${data.rewards?.map((r: any) => `${r.amount} ${r.type}`).join(", ") || "Something special!"}`
      });
    },
    onError: (error: any) => {
      console.error("Loot box opening failed:", error);
      toast({ 
        title: "Loot box failed", 
        description: error.message || "Failed to open loot box. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const componentUpgradeMutation = useMutation({
    mutationFn: async ({ equipmentId, componentType, currency }: { equipmentId: string; componentType: string; currency: string }) => {
      const response = await apiRequest(
        "POST",
        `/api/user/${userId}/equipment/${equipmentId}/components/upgrade`,
        { componentType, currency }
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
    },
    onError: (error: Error) => {
      toast({
        title: "Upgrade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Group equipment by category and tier for proper display
  // Sort by orderIndex first to ensure correct display order
  const sortedEquipment = [...allEquipment].sort((a, b) => a.orderIndex - b.orderIndex);
  
  const groupedEquipment = sortedEquipment.reduce((acc, eq) => {
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
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-matrix-green" />
            <h1 className="text-base sm:text-lg font-bold terminal-gradient">SHOP</h1>
          </div>
          <div className="text-right">
            <div className="space-y-0.5">
              <div>
                <p className="text-xs text-muted-foreground">CS</p>
                <p className="text-sm sm:text-base font-mono text-matrix-green">{csBalance.toLocaleString()}</p>
              </div>
              {isWalletConnected() && (
                <div>
                  <p className="text-xs text-muted-foreground">TON</p>
                  <p className="text-sm sm:text-base font-mono text-cyber-blue">{tonBalance}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-4">
            <TabsTrigger value="equipment" data-testid="tab-equipment" className="text-xs px-1">
              <Cpu className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Equipment</span>
            </TabsTrigger>
            <TabsTrigger value="upgrades" data-testid="tab-upgrades" className="text-xs px-1">
              <Rocket className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Upgrades</span>
            </TabsTrigger>
            <TabsTrigger value="powerups" data-testid="tab-powerups" className="text-xs px-1">
              <Zap className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Power-Ups</span>
            </TabsTrigger>
            <TabsTrigger value="lootboxes" data-testid="tab-lootboxes" className="text-xs px-1">
              <Gem className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Loot Boxes</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" data-testid="tab-tasks" className="text-xs px-1">
              <CheckCircle2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Tasks</span>
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
              <div className="space-y-4">
                {Object.entries(groupedEquipment).map(([category, tierGroups]) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons] || Cpu;
                  const totalModels = Object.values(tierGroups).flat().length;
                  const isExpanded = expandedCategories[category];
                  
                  return (
                    <Card key={category} className="overflow-hidden">
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleCategory(category)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-matrix-green" />
                          <h2 className="text-lg font-semibold">{category}</h2>
                          <Badge variant="secondary">{totalModels} models</Badge>
                          <Badge variant="outline">
                            {category === "Basic Laptop" || category === "Gaming Laptop" ? "10 per model" : 
                             category === "Gaming PC" || category === "Server Farm" ? "25 per model" : 
                             category === "ASIC Rig" ? "50 per model" : "N/A"}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      
                      {isExpanded && (
                        <div className="p-4 pt-0 space-y-4">
                          {Object.entries(tierGroups).map(([tier, equipmentList]) => (
                            <div key={tier} className="space-y-3">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xs sm:text-sm font-medium">{tier} Tier</h3>
                                <Badge className={`${tierColors[tier as keyof typeof tierColors] || "bg-gray-500/20"} text-xs`}>
                                  {tier}
                                </Badge>
                                <Badge variant="outline" className="text-xs">{equipmentList.length}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                {equipmentList.map((equipment) => {
                                  const currentPrice = equipment.id === "laptop-lenovo-e14" && getOwnedCount(equipment.id) === 0 
                                    ? 0 
                                    : equipment.basePrice;
                                  
                                  return (
                                    <EquipmentCard
                                      key={equipment.id}
                                      equipment={equipment}
                                      owned={getOwnedCount(equipment.id)}
                                      onPurchase={() => handlePurchase(equipment.id)}
                                      onTonPurchase={() => handleTonPurchase(equipment.id, currentPrice)}
                                      isPurchasing={purchaseMutation.isPending || tonPurchaseMutation.isPending}
                                      userBalance={csBalance}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
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
                            const upgradeCost = Math.floor(baseCost * componentMultiplier);
                            
                            return (
                              <div key={componentType} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-sm">{componentType}</h5>
                                  <Badge variant="outline" className="text-xs">Level 0/10</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  +{(owned.equipmentType.baseHashrate * 0.05 * owned.quantity).toFixed(2)} GH/s
                                </p>
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    className="flex-1 text-xs"
                                    onClick={() => {
                                      componentUpgradeMutation.mutate({
                                        equipmentId: owned.id,
                                        componentType,
                                        currency: "CS"
                                      });
                                    }}
                                    disabled={componentUpgradeMutation.isPending}
                                  >
                                    {componentUpgradeMutation.isPending ? "..." : `CS: ${upgradeCost.toLocaleString()}`}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="flex-1 text-xs"
                                    onClick={() => {
                                      componentUpgradeMutation.mutate({
                                        equipmentId: owned.id,
                                        componentType,
                                        currency: "TON"
                                      });
                                    }}
                                    disabled={componentUpgradeMutation.isPending}
                                  >
                                    {componentUpgradeMutation.isPending ? "..." : `TON: ${Math.floor(upgradeCost * 0.001).toFixed(3)}`}
                                  </Button>
                                </div>
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
                  <Button 
                    className="bg-matrix-green hover:bg-matrix-green/90 text-black"
                    onClick={() => powerUpClaimMutation.mutate("cs")}
                    disabled={powerUpClaimMutation.isPending}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {powerUpClaimMutation.isPending ? "Claiming..." : "Claim CS (5/5)"}
                  </Button>
                  <Button 
                    className="bg-cyber-blue hover:bg-cyber-blue/90 text-white"
                    onClick={() => powerUpClaimMutation.mutate("chst")}
                    disabled={powerUpClaimMutation.isPending}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {powerUpClaimMutation.isPending ? "Claiming..." : "Claim CHST (5/5)"}
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
                  <Button 
                    className="bg-cyber-blue hover:bg-cyber-blue/90 text-white"
                    onClick={() => powerUpClaimMutation.mutate("hashrate-boost")}
                    disabled={powerUpClaimMutation.isPending}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {powerUpClaimMutation.isPending ? "Buying..." : "Buy Hashrate Boost (0.1 TON)"}
                  </Button>
                  <Button 
                    className="bg-cyber-blue hover:bg-cyber-blue/90 text-white"
                    onClick={() => powerUpClaimMutation.mutate("luck-boost")}
                    disabled={powerUpClaimMutation.isPending}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {powerUpClaimMutation.isPending ? "Buying..." : "Buy Luck Boost (0.2 TON)"}
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
                  <Button 
                    className="bg-cyber-blue hover:bg-cyber-blue/90 text-white"
                    onClick={() => lootBoxOpenMutation.mutate({ boxType: "basic", cost: 0.5 })}
                    disabled={lootBoxOpenMutation.isPending}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    {lootBoxOpenMutation.isPending ? "Opening..." : "Basic Box (0.5 TON)"}
                  </Button>
                  <Button 
                    className="bg-cyber-blue hover:bg-cyber-blue/90 text-white"
                    onClick={() => lootBoxOpenMutation.mutate({ boxType: "premium", cost: 2 })}
                    disabled={lootBoxOpenMutation.isPending}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    {lootBoxOpenMutation.isPending ? "Opening..." : "Premium Box (2 TON)"}
                  </Button>
                  <Button 
                    className="bg-cyber-blue hover:bg-cyber-blue/90 text-white"
                    onClick={() => lootBoxOpenMutation.mutate({ boxType: "epic", cost: 5 })}
                    disabled={lootBoxOpenMutation.isPending}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    {lootBoxOpenMutation.isPending ? "Opening..." : "Epic Box (5 TON)"}
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
                  <Button 
                    className="bg-matrix-green hover:bg-matrix-green/90 text-black"
                    onClick={() => lootBoxOpenMutation.mutate({ boxType: "daily-task", cost: 0 })}
                    disabled={lootBoxOpenMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {lootBoxOpenMutation.isPending ? "Opening..." : "Complete Daily Task (1/1)"}
                  </Button>
                  <Button 
                    className="bg-matrix-green hover:bg-matrix-green/90 text-black"
                    onClick={() => lootBoxOpenMutation.mutate({ boxType: "invite-friend", cost: 0 })}
                    disabled={lootBoxOpenMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {lootBoxOpenMutation.isPending ? "Opening..." : "Invite Friend (2/2)"}
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
                    <Button 
                      size="sm" 
                      className="bg-matrix-green hover:bg-matrix-green/90 text-black"
                      onClick={() => taskClaimMutation.mutate("mine-first-block")}
                      disabled={taskClaimMutation.isPending}
                    >
                      {taskClaimMutation.isPending ? "Claiming..." : "Claim 1,000 CS"}
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
                    <Button 
                      size="sm" 
                      className="bg-cyber-blue hover:bg-cyber-blue/90 text-white"
                      onClick={() => taskClaimMutation.mutate("reach-1000-hashrate")}
                      disabled={taskClaimMutation.isPending}
                    >
                      {taskClaimMutation.isPending ? "Claiming..." : "Claim 2,000 CS"}
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
                    <Button 
                      size="sm" 
                      className="bg-neon-orange hover:bg-neon-orange/90 text-white"
                      onClick={() => taskClaimMutation.mutate("buy-first-asic")}
                      disabled={taskClaimMutation.isPending}
                    >
                      {taskClaimMutation.isPending ? "Claiming..." : "Claim Free Loot Box"}
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
                    <Button 
                      size="sm" 
                      className="bg-pink-500 hover:bg-pink-500/90 text-white"
                      onClick={() => taskClaimMutation.mutate("invite-1-friend")}
                      disabled={taskClaimMutation.isPending}
                    >
                      {taskClaimMutation.isPending ? "Claiming..." : "Claim 5,000 CS"}
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
                    <Button 
                      size="sm" 
                      className="bg-purple-500 hover:bg-purple-500/90 text-white"
                      onClick={() => taskClaimMutation.mutate("invite-5-friends")}
                      disabled={taskClaimMutation.isPending}
                    >
                      {taskClaimMutation.isPending ? "Claiming..." : "Claim Premium Loot Box"}
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
