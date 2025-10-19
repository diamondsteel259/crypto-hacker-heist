import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EquipmentCard from "@/components/EquipmentCard";
import PowerUpCard from "@/components/PowerUpCard";
import { Monitor, Cpu, Server, Boxes, Zap, Rocket, Shield, ShoppingBag, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Shop() {
  const [activeTab, setActiveTab] = useState("equipment");

  // todo: remove mock functionality
  const basicLaptops = [
    { name: "Lenovo ThinkPad E14", hashrate: 50, price: 5000, owned: 1, maxOwned: 10 },
    { name: "Dell Inspiron 15", hashrate: 100, price: 10000, owned: 2, maxOwned: 10 },
    { name: "HP Pavilion 15", hashrate: 150, price: 15000, owned: 0, maxOwned: 10 },
    { name: "Acer Aspire 5", hashrate: 180, price: 18000, owned: 0, maxOwned: 10 },
    { name: "ASUS VivoBook 15", hashrate: 200, price: 20000, owned: 0, maxOwned: 10 },
  ];

  const gamingLaptops = [
    { name: "Acer Predator Helios", hashrate: 300, price: 30000, owned: 0, maxOwned: 10 },
    { name: "MSI Stealth 15", hashrate: 400, price: 40000, owned: 0, maxOwned: 10 },
    { name: "ASUS ROG Strix", hashrate: 500, price: 50000, owned: 0, maxOwned: 10 },
    { name: "Razer Blade 15", hashrate: 550, price: 55000, owned: 0, maxOwned: 10 },
    { name: "Alienware m15", hashrate: 600, price: 60000, owned: 0, maxOwned: 10 },
  ];

  const gamingPCs = [
    { name: "VIXIA High-End i9", hashrate: 700, price: 70000, owned: 0, maxOwned: 25 },
    { name: "Custom Build RTX4080", hashrate: 1000, price: 100000, owned: 0, maxOwned: 25 },
    { name: "Corsair Vengeance", hashrate: 1400, price: 140000, owned: 0, maxOwned: 25 },
    { name: "NZXT Pro Gaming", hashrate: 1700, price: 170000, owned: 0, maxOwned: 25 },
    { name: "Origin PC Millennium", hashrate: 2000, price: 200000, owned: 0, maxOwned: 25 },
  ];

  const serverFarms = [
    { name: "Supermicro SYS-4029GP", hashrate: 5000, price: 2, owned: 0, maxOwned: 25 },
    { name: "Dell PowerEdge R750", hashrate: 8000, price: 3, owned: 0, maxOwned: 25 },
    { name: "HP ProLiant DL380", hashrate: 12000, price: 5, owned: 0, maxOwned: 25 },
    { name: "Lenovo ThinkSystem", hashrate: 16000, price: 7, owned: 0, maxOwned: 25 },
    { name: "Cisco UCS C240", hashrate: 20000, price: 10, owned: 0, maxOwned: 25 },
  ];

  const asicRigs = [
    { name: "Bitmain Antminer S21 Pro", hashrate: 50000, price: 5, owned: 0, maxOwned: 50 },
    { name: "WhatsMiner M60S", hashrate: 100000, price: 10, owned: 0, maxOwned: 50 },
    { name: "Bitmain Antminer S21 XP", hashrate: 150000, price: 15, owned: 0, maxOwned: 50 },
    { name: "MicroBT WhatsMiner M50", hashrate: 200000, price: 20, owned: 0, maxOwned: 50 },
    { name: "Bitmain Antminer S23", hashrate: 250000, price: 25, owned: 0, maxOwned: 50 },
    { name: "AxionMiner 800", hashrate: 300000, price: 30, owned: 0, maxOwned: 50 },
    { name: "Antminer S21 XP+ Hyd", hashrate: 350000, price: 35, owned: 0, maxOwned: 50 },
    { name: "Canaan Avalon Q", hashrate: 400000, price: 40, owned: 0, maxOwned: 50 },
    { name: "Antminer S21e XP Hydro", hashrate: 450000, price: 45, owned: 0, maxOwned: 50 },
    { name: "WhatsMiner M63S Hydro", hashrate: 500000, price: 50, owned: 0, maxOwned: 50 },
  ];

  const powerUps = [
    {
      name: "Hash Overdrive",
      description: "Double your mining speed temporarily",
      boost: "2x Hashrate",
      duration: "1 hour",
      price: 1000,
      currency: "CS" as const,
      dailyFree: 5,
      usedFree: 2,
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

  const isEquipmentUnlocked = (items: any[], index: number) => {
    if (index === 0) return true;
    return items[index - 1].owned > 0;
  };

  const getTierFromTitle = (title: string): "basic" | "gaming" | "pc" | "server" | "asic" => {
    if (title.includes("Basic")) return "basic";
    if (title.includes("Gaming Laptop")) return "gaming";
    if (title.includes("Gaming PC")) return "pc";
    if (title.includes("Server")) return "server";
    if (title.includes("ASIC")) return "asic";
    return "basic";
  };

  const renderEquipmentSection = (items: any[], title: string, icon: React.ReactNode, currency: "CS" | "TON") => {
    const tier = getTierFromTitle(title);
    return (
      <div>
        <h3 className="text-sm md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {items.map((item, index) => {
            const unlocked = isEquipmentUnlocked(items, index);
            return (
              <div key={index} className="relative">
                <EquipmentCard
                  name={item.name}
                  tier={tier}
                  hashrate={item.hashrate}
                  price={item.price}
                  currency={currency}
                  owned={item.owned}
                  maxOwned={item.maxOwned}
                  locked={!unlocked}
                />
                {!unlocked && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-md flex flex-col items-center justify-center">
                    <Lock className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground mb-2" />
                    <Badge variant="outline" className="text-[10px] md:text-xs">
                      Purchase {items[index - 1].name} first
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
            <TabsTrigger value="equipment" className="min-h-[44px] text-xs md:text-sm" data-testid="tab-equipment">Equipment</TabsTrigger>
            <TabsTrigger value="powerups" className="min-h-[44px] text-xs md:text-sm" data-testid="tab-powerups">Power-Ups</TabsTrigger>
            <TabsTrigger value="basic" className="hidden lg:block" data-testid="tab-basic">Basic</TabsTrigger>
            <TabsTrigger value="gaming" className="hidden lg:block" data-testid="tab-gaming">Gaming</TabsTrigger>
            <TabsTrigger value="server" className="hidden lg:block" data-testid="tab-server">Server</TabsTrigger>
            <TabsTrigger value="asic" className="hidden lg:block" data-testid="tab-asic">ASIC</TabsTrigger>
          </TabsList>

          <TabsContent value="equipment" className="space-y-4 md:space-y-6">
            {renderEquipmentSection(basicLaptops, "Basic Laptops", <Monitor className="w-4 md:w-5 h-4 md:h-5 text-chart-4" />, "CS")}
            {renderEquipmentSection(gamingLaptops, "Gaming Laptops", <Monitor className="w-4 md:w-5 h-4 md:h-5 text-chart-1" />, "CS")}
            {renderEquipmentSection(gamingPCs, "Gaming PCs", <Cpu className="w-4 md:w-5 h-4 md:h-5 text-cyber-blue" />, "CS")}
            {renderEquipmentSection(serverFarms, "Server Farms", <Server className="w-4 md:w-5 h-4 md:h-5 text-neon-orange" />, "TON")}
            {renderEquipmentSection(asicRigs, "ASIC Miners", <Boxes className="w-4 md:w-5 h-4 md:h-5 text-matrix-green" />, "TON")}
          </TabsContent>

          <TabsContent value="powerups" className="space-y-4 md:space-y-6">
            <div>
              <h3 className="text-sm md:text-lg font-semibold mb-3 md:mb-4">Power-Ups & Boosts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {powerUps.map((powerUp, index) => (
                  <PowerUpCard key={index} {...powerUp} onActivate={() => console.log(`Activate ${powerUp.name}`)} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="basic" className="space-y-4 md:space-y-6">
            {renderEquipmentSection(basicLaptops, "Basic Laptops", <Monitor className="w-4 md:w-5 h-4 md:h-5 text-chart-4" />, "CS")}
          </TabsContent>

          <TabsContent value="gaming" className="space-y-4 md:space-y-6">
            {renderEquipmentSection(gamingLaptops, "Gaming Laptops", <Monitor className="w-4 md:w-5 h-4 md:h-5 text-chart-1" />, "CS")}
            {renderEquipmentSection(gamingPCs, "Gaming PCs", <Cpu className="w-4 md:w-5 h-4 md:h-5 text-cyber-blue" />, "CS")}
          </TabsContent>

          <TabsContent value="server" className="space-y-4 md:space-y-6">
            {renderEquipmentSection(serverFarms, "Server Farms", <Server className="w-4 md:w-5 h-4 md:h-5 text-neon-orange" />, "TON")}
          </TabsContent>

          <TabsContent value="asic" className="space-y-4 md:space-y-6">
            {renderEquipmentSection(asicRigs, "ASIC Miners", <Boxes className="w-4 md:w-5 h-4 md:h-5 text-matrix-green" />, "TON")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
