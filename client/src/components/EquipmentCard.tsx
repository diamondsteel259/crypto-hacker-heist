import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, Zap, Lock, CheckCircle2 } from "lucide-react";

interface EquipmentCardProps {
  name: string;
  tier: "basic" | "gaming" | "pc" | "server" | "asic";
  hashrate: number;
  price: number;
  owned: number;
  maxOwned: number;
  currency: "CS" | "TON";
  locked?: boolean;
  icon?: React.ReactNode;
}

const tierColors = {
  basic: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  gaming: "bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30",
  pc: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  server: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  asic: "bg-neon-orange/20 text-neon-orange border-neon-orange/30",
};

export default function EquipmentCard({
  name,
  tier,
  hashrate,
  price,
  owned,
  maxOwned,
  currency,
  locked = false,
  icon,
}: EquipmentCardProps) {
  const formatHashrate = (hr: number) => {
    if (hr >= 1000) return `${(hr / 1000).toFixed(1)} TH/s`;
    return `${hr} GH/s`;
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
          {icon || <Cpu className="w-4 md:w-5 h-4 md:h-5 text-matrix-green" />}
          <Badge variant="outline" className={`text-[10px] md:text-xs ${tierColors[tier]}`}>
            {tier.toUpperCase()}
          </Badge>
        </div>
        <div className="text-right">
          <p className="text-[10px] md:text-xs text-muted-foreground">{owned}/{maxOwned}</p>
        </div>
      </div>

      <h4 className="font-semibold text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">{name}</h4>

      <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
        <div className="flex items-center justify-between text-[10px] md:text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Hashrate
          </span>
          <span className="font-mono font-semibold text-matrix-green">
            {formatHashrate(hashrate)}
          </span>
        </div>
      </div>

      {locked ? (
        <Button
          size="sm"
          variant="secondary"
          className="w-full"
          disabled
          data-testid={`button-buy-${name.toLowerCase().replace(/\s/g, '-')}`}
        >
          <Lock className="w-3 h-3 mr-2" />
          Locked
        </Button>
      ) : owned >= maxOwned ? (
        <Button
          size="sm"
          variant="secondary"
          className="w-full"
          disabled
          data-testid={`button-buy-${name.toLowerCase().replace(/\s/g, '-')}`}
        >
          <CheckCircle2 className="w-3 h-3 mr-2" />
          Max Owned
        </Button>
      ) : (
        <Button
          size="sm"
          variant={currency === "TON" ? "default" : "default"}
          className={currency === "TON" ? "w-full bg-ton-blue hover:bg-ton-blue/90" : "w-full"}
          data-testid={`button-buy-${name.toLowerCase().replace(/\s/g, '-')}`}
        >
          Buy {formatPrice(price)} {currency}
        </Button>
      )}
    </Card>
  );
}
