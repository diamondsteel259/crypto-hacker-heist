import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Cpu, Server, Boxes, CheckCircle2, Search, Filter, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLoadingTimeout } from "@/hooks/use-loading-timeout";
import { getCurrentUserId } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { sendTonTransaction } from "@/lib/tonConnect";
import { useTonPayment } from "./hooks/useTonPayment";
import { tierColors, TON_PAYMENT_ADDRESS, type UserEquipment } from "./types";
import type { EquipmentType } from "@shared/schema";

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
  isConnected: boolean;
}

function EquipmentCard({ equipment, owned, onPurchase, onTonPurchase, isPurchasing, userBalance, isConnected }: EquipmentCardProps) {
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
    ? isConnected // TON purchases require wallet connection
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

interface EquipmentShopProps {
  userId: string | null;
  csBalance: number;
}

export default function EquipmentShop({ userId, csBalance }: EquipmentShopProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({ "Basic Laptop": true });
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState<"all" | "CS" | "TON">("all");
  const { toast } = useToast();
  const { tonConnectUI, isConnected, refreshBalance } = useTonPayment();

  const { data: allEquipment = [], isLoading: isLoadingTypes, error: equipmentError, refetch: refetchEquipment } = useQuery<EquipmentType[]>({
    queryKey: ["/api/equipment-types"],
    staleTime: 0,
    gcTime: 0,
  });
  const isTimedOut = useLoadingTimeout({ isLoading: isLoadingTypes, timeoutMs: 5000 });

  const { data: ownedEquipment = [] } = useQuery<UserEquipment[]>({
    queryKey: ["/api/user", userId, "equipment"],
    enabled: !!userId,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (equipmentTypeId: string) => {
      const response = await apiRequest("POST", `/api/user/${userId}/equipment/purchase`, {
        equipmentTypeId
      });
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "equipment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      toast({
        title: "Equipment purchased successfully!",
        description: "Your new equipment has been added to your inventory"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Failed to purchase equipment. Please try again.",
        variant: "destructive"
      });
    },
  });

  const tonPurchaseMutation = useMutation({
    mutationFn: async ({ equipmentTypeId, price }: { equipmentTypeId: string; price: number }) => {
      if (!window.confirm(`Purchase this equipment for ${price} TON?\n\nThis will deduct ${price} TON from your wallet.`)) {
        throw new Error("Purchase cancelled by user");
      }

      if (!isConnected) {
        throw new Error("Please connect your TON wallet first");
      }

      try {
        const result = await sendTonTransaction(tonConnectUI, TON_PAYMENT_ADDRESS, price.toString(), `Equipment purchase: ${equipmentTypeId}`);

        const response = await apiRequest("POST", `/api/user/${userId}/equipment/purchase`, {
          equipmentTypeId
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to purchase equipment");
        }

        return await response.json();
      } catch (txError: any) {
        if (txError.message && txError.message.includes("Transaction was not sent")) {
          throw new Error("Transaction cancelled or rejected by wallet. Please try again.");
        }
        throw new Error(txError.message || "Failed to complete purchase");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "equipment"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      refreshBalance();
      toast({
        title: "Equipment purchased successfully!",
        description: "TON payment completed and equipment added to your inventory"
      });
    },
    onError: (error: any) => {
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

  // Sort by orderIndex first to ensure correct display order
  const sortedEquipment = [...allEquipment].sort((a, b) => a.orderIndex - b.orderIndex);

  // Filter equipment based on search query and currency filter
  const filteredEquipment = useMemo(() => {
    return sortedEquipment.filter(eq => {
      const matchesSearch = searchQuery === "" ||
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.tier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCurrency = currencyFilter === "all" || eq.currency === currencyFilter;

      return matchesSearch && matchesCurrency;
    });
  }, [sortedEquipment, searchQuery, currencyFilter]);

  const groupedEquipment = filteredEquipment.reduce((acc, eq) => {
    if (!acc[eq.category]) {
      acc[eq.category] = {};
    }
    if (!acc[eq.category][eq.tier]) {
      acc[eq.category][eq.tier] = [];
    }
    acc[eq.category][eq.tier].push(eq);
    return acc;
  }, {} as Record<string, Record<string, EquipmentType[]>>);

  if (equipmentError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-destructive">Error loading equipment: {equipmentError.message}</p>
        <Button onClick={() => refetchEquipment()} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  if (isLoadingTypes) {
    return (
      <div className="space-y-4">
        {isTimedOut && (
          <Card className="p-6 border-yellow-500/50">
            <div className="flex flex-col items-center text-center gap-4">
              <AlertCircle className="w-10 h-10 text-yellow-500" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Still Loading...</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This is taking longer than expected. Check your connection or try refreshing.
                </p>
              </div>
              <Button onClick={() => refetchEquipment()} variant="outline" className="min-h-11">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </Card>
        )}
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
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={currencyFilter === "all" ? "default" : "outline"}
            onClick={() => setCurrencyFilter("all")}
            className="text-xs"
          >
            <Filter className="w-3 h-3 mr-1" />
            All
          </Button>
          <Button
            size="sm"
            variant={currencyFilter === "CS" ? "default" : "outline"}
            onClick={() => setCurrencyFilter("CS")}
            className="text-xs"
          >
            CS Only
          </Button>
          <Button
            size="sm"
            variant={currencyFilter === "TON" ? "default" : "outline"}
            onClick={() => setCurrencyFilter("TON")}
            className="text-xs"
          >
            TON Only
          </Button>
        </div>
      </div>

      {Object.keys(groupedEquipment).length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {allEquipment.length === 0
              ? "No equipment data loaded. Please refresh the page."
              : "No equipment matches your filters."
            }
          </p>
          {allEquipment.length === 0 && (
            <Button onClick={() => refetchEquipment()} className="mt-4">
              Refresh Data
            </Button>
          )}
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
                                isConnected={isConnected}
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
    </div>
  );
}
