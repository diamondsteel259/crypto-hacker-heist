import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, Zap, TrendingUp } from "lucide-react";

interface InventoryItem {
  name: string;
  count: number;
  hashrate: number;
  tier: string;
}

export default function InventoryPanel() {
  // todo: remove mock functionality
  const inventory: InventoryItem[] = [
    { name: "Lenovo ThinkPad E14", count: 1, hashrate: 50, tier: "basic" },
    { name: "Dell Inspiron 15", count: 2, hashrate: 100, tier: "basic" },
  ];

  const totalHashrate = inventory.reduce((sum, item) => sum + item.hashrate * item.count, 0);
  const totalRigs = inventory.reduce((sum, item) => sum + item.count, 0);

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
          <p className="text-2xl font-bold font-mono text-matrix-green">{totalHashrate}</p>
          <p className="text-xs text-muted-foreground mt-1">GH/s</p>
        </div>

        <div className="p-4 rounded-md bg-muted/30 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyber-blue" />
            <p className="text-xs text-muted-foreground uppercase">Network %</p>
          </div>
          <p className="text-2xl font-bold font-mono text-cyber-blue">0.048</p>
          <p className="text-xs text-muted-foreground mt-1">of total</p>
        </div>
      </div>

      <div className="space-y-3">
        {inventory.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-md bg-card border border-card-border"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">x{item.count}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {item.tier}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-muted-foreground">Hashrate</span>
              <span className="font-mono font-semibold text-matrix-green">
                {item.hashrate * item.count} GH/s
              </span>
            </div>
          </div>
        ))}
      </div>

      {inventory.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">No rigs yet. Buy your first one!</p>
        </div>
      )}
    </Card>
  );
}
