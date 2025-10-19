import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Zap, TrendingUp } from "lucide-react";
import { getCurrentUserId } from "@/lib/user";
import type { OwnedEquipment, EquipmentType } from "@shared/schema";

interface OwnedEquipmentWithType extends OwnedEquipment {
  equipmentType: EquipmentType;
}

interface NetworkStatsData {
  totalNetworkHashrate: number;
  activeMiners: number;
  userHashrate: number;
  networkShare: number;
}

export default function InventoryPanel() {
  const userId = getCurrentUserId();

  const { data: equipment = [], isLoading } = useQuery<OwnedEquipmentWithType[]>({
    queryKey: ['/api/user', userId, 'equipment'],
    enabled: !!userId,
  });

  const { data: stats } = useQuery<NetworkStatsData>({
    queryKey: ['/api/user', userId, 'network-stats'],
    enabled: !!userId,
  });

  const totalHashrate = equipment.reduce((sum, item) => sum + item.currentHashrate, 0);
  const totalRigs = equipment.reduce((sum, item) => sum + item.quantity, 0);
  const networkShare = stats?.networkShare ?? 0;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-matrix-green" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">Your Rigs</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-matrix-green" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Your Rigs</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {totalRigs} Active
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-md bg-muted/30 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-matrix-green" />
            <p className="text-xs text-muted-foreground uppercase">Total HR</p>
          </div>
          <p className="text-2xl font-bold font-mono text-matrix-green">{totalHashrate.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-1">H/s</p>
        </div>

        <div className="p-4 rounded-md bg-muted/30 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyber-blue" />
            <p className="text-xs text-muted-foreground uppercase">Network %</p>
          </div>
          <p className="text-2xl font-bold font-mono text-cyber-blue">
            {networkShare > 0 ? networkShare.toFixed(3) : "0"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">of total</p>
        </div>
      </div>

      <div className="space-y-3">
        {equipment.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-md bg-card border border-card-border"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold">{item.equipmentType.name}</p>
                <p className="text-xs text-muted-foreground">x{item.quantity}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {item.equipmentType.tier}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-muted-foreground">Hashrate</span>
              <span className="font-mono font-semibold text-matrix-green">
                {item.currentHashrate.toFixed(0)} H/s
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground">Level</span>
              <span className="font-mono font-semibold text-cyber-blue">
                {item.upgradeLevel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {equipment.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No rigs yet. Buy your first one!</p>
        </div>
      )}
    </Card>
  );
}
