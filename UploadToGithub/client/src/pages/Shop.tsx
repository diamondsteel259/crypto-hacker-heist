import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import EquipmentCard from "@/components/EquipmentCard";
import PowerUpCard from "@/components/PowerUpCard";
import { Monitor, Cpu, Server, Boxes, Zap, Rocket, Shield, ShoppingBag } from "lucide-react";
import { initializeUser } from "@/lib/user";
import type { EquipmentType, OwnedEquipment } from "@shared/schema";

export default function Shop() {
  const [activeTab, setActiveTab] = useState("equipment");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeUser()
      .then(setUserId)
      .catch(err => {
        console.error('Failed to initialize user:', err);
      });
  }, []);

  const { data: equipmentTypes = [] } = useQuery<EquipmentType[]>({
    queryKey: ['/api/equipment-types'],
  });

  const { data: ownedEquipment = [] } = useQuery<OwnedEquipment[]>({
    queryKey: ['/api/user', userId, 'equipment'],
    enabled: !!userId,
  });

  // Group equipment by category and tier
  const groupedEquipment = equipmentTypes.reduce((acc, eq) => {
    const key = `${eq.category}-${eq.tier}`;
    if (!acc[key]) {
      acc[key] = {
        category: eq.category,
        tier: eq.tier,
        items: []
      };
    }
    acc[key].items.push(eq);
    return acc;
  }, {} as Record<string, { category: string, tier: string, items: EquipmentType[] }>);

  // Sort items within each group by orderIndex
  Object.values(groupedEquipment).forEach(group => {
    group.items.sort((a, b) => a.orderIndex - b.orderIndex);
  });

  const getOwnedQuantity = (equipmentTypeId: string): number => {
    const owned = ownedEquipment.find(e => e.equipmentTypeId === equipmentTypeId);
    return owned?.quantity ?? 0;
  };

  const isEquipmentUnlocked = (items: EquipmentType[], currentItem: EquipmentType): boolean => {
    if (currentItem.orderIndex === 1) return true;
    const previousItem = items.find(item => item.orderIndex === currentItem.orderIndex - 1);
    if (!previousItem) return false;
    return getOwnedQuantity(previousItem.id) > 0;
  };

  const getTierLabel = (category: string, tier: string) => {
    const labels: Record<string, string> = {
      'laptop-basic': 'Basic Laptops',
      'laptop-gaming': 'Gaming Laptops',
      'pc-gaming': 'Gaming PCs',
      'server-farm': 'Server Farms',
      'asic-rig': 'ASIC Rigs',
    };
    return labels[`${category}-${tier}`] || `${category} ${tier}`;
  };

  const getTierIcon = (category: string, tier: string) => {
    if (category === 'laptop' && tier === 'basic') return <Monitor className="w-4 md:w-5 h-4 md:h-5 text-chart-4" />;
    if (category === 'laptop' && tier === 'gaming') return <Monitor className="w-4 md:w-5 h-4 md:h-5 text-chart-1" />;
    if (category === 'pc' && tier === 'gaming') return <Cpu className="w-4 md:w-5 h-4 md:h-5 text-cyber-blue" />;
    if (category === 'server' && tier === 'farm') return <Server className="w-4 md:w-5 h-4 md:h-5 text-matrix-green" />;
    if (category === 'asic' && tier === 'rig') return <Boxes className="w-4 md:w-5 h-4 md:h-5 text-neon-orange" />;
    return <Monitor className="w-4 md:w-5 h-4 md:h-5" />;
  };

  const renderEquipmentSection = (key: string, group: { category: string, tier: string, items: EquipmentType[] }, showTitle = true) => {
    return (
      <div key={key}>
        {showTitle && (
          <h3 className="text-sm md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
            {getTierIcon(group.category, group.tier)}
            <span>{getTierLabel(group.category, group.tier)}</span>
          </h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {group.items.map((item) => {
            const unlocked = isEquipmentUnlocked(group.items, item);
            const owned = getOwnedQuantity(item.id);
            return (
              <EquipmentCard
                key={item.id}
                name={item.name}
                tier={item.tier as "basic" | "gaming" | "pc" | "server" | "asic"}
                hashrate={item.baseHashrate}
                price={item.basePrice}
                currency={item.currency as "CS" | "TON"}
                owned={owned}
                maxOwned={item.maxOwned}
                locked={!unlocked}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const sortedGroups = Object.entries(groupedEquipment).sort(([, a], [, b]) => {
    const order = ['laptop-basic', 'laptop-gaming', 'pc-gaming', 'server-farm', 'asic-rig'];
    const keyA = `${a.category}-${a.tier}`;
    const keyB = `${b.category}-${b.tier}`;
    return order.indexOf(keyA) - order.indexOf(keyB);
  });

  const powerUps = [
    {
      name: "Hash Overdrive",
      description: "Double your mining speed temporarily",
      boost: "2x Hashrate",
      duration: "1 hour",
      price: 1000,
      currency: "CS" as const,
      dailyFree: 5,
      usedFree: 0,
      icon: <Zap className="w-5 h-5 text-neon-orange" />,
    },
    {
      name: "Quantum Boost",
      description: "Triple mining output for limited time",
      boost: "3x Hashrate",
      duration: "30 min",
      price: 2500,
      currency: "CS" as const,
      dailyFree: 0,
      usedFree: 0,
      icon: <Rocket className="w-5 h-5 text-cyber-blue" />,
    },
    {
      name: "Network Shield",
      description: "Protection from network attack events",
      boost: "Event Protection",
      duration: "24 hours",
      price: 0.5,
      currency: "TON" as const,
      dailyFree: 0,
      usedFree: 0,
      icon: <Shield className="w-5 h-5 text-chart-1" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background terminal-scanline">
      <div className="max-w-7xl mx-auto p-2 md:p-4 space-y-3 md:space-y-6">
        {/* Desktop Header - hidden on mobile */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-matrix-green/20 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-matrix-green" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Equipment Shop</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Upgrade your mining operation
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="equipment" className="min-h-[44px] text-xs md:text-sm" data-testid="tab-equipment">
              Equipment
            </TabsTrigger>
            <TabsTrigger value="powerups" className="min-h-[44px] text-xs md:text-sm" data-testid="tab-powerups">
              Power-Ups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipment" className="space-y-4 md:space-y-6">
            {/* Mobile: Accordion view */}
            <div className="md:hidden">
              <Accordion type="single" collapsible className="space-y-2">
                {sortedGroups.map(([key, group]) => (
                  <AccordionItem key={key} value={key} className="border rounded-md">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        {getTierIcon(group.category, group.tier)}
                        <span className="font-semibold">{getTierLabel(group.category, group.tier)}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {renderEquipmentSection(key, group, false)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Desktop: Full view */}
            <div className="hidden md:block space-y-6">
              {sortedGroups.map(([key, group]) => renderEquipmentSection(key, group))}
            </div>
          </TabsContent>

          <TabsContent value="powerups" className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {powerUps.map((powerUp, index) => (
                <PowerUpCard key={index} {...powerUp} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
