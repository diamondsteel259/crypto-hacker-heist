import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock } from "lucide-react";

interface PowerUpCardProps {
  name: string;
  description: string;
  boost: string;
  duration: string;
  price: number;
  currency: "CS" | "TON";
  dailyFree?: number;
  usedFree?: number;
  icon?: React.ReactNode;
}

export default function PowerUpCard({
  name,
  description,
  boost,
  duration,
  price,
  currency,
  dailyFree = 0,
  usedFree = 0,
  icon,
}: PowerUpCardProps) {
  const hasFreeAvailable = dailyFree > 0 && usedFree < dailyFree;

  return (
    <Card className="p-4 hover-elevate transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon || <Zap className="w-5 h-5 text-neon-orange" />}
          <h4 className="font-semibold text-sm">{name}</h4>
        </div>
        {hasFreeAvailable && (
          <Badge variant="outline" className="text-xs bg-chart-1/20 text-chart-1 border-chart-1/30">
            {dailyFree - usedFree} Free
          </Badge>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-3">{description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Boost
          </span>
          <span className="font-mono font-semibold text-neon-orange">{boost}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Duration
          </span>
          <span className="font-mono font-semibold">{duration}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {hasFreeAvailable && (
          <Button
            size="sm"
            variant="default"
            className="flex-1"
            data-testid={`button-use-free-${name.toLowerCase().replace(/\s/g, '-')}`}
          >
            Use Free
          </Button>
        )}
        <Button
          size="sm"
          variant={currency === "TON" ? "outline" : "outline"}
          className={hasFreeAvailable ? "flex-1" : "w-full"}
          data-testid={`button-buy-${name.toLowerCase().replace(/\s/g, '-')}`}
        >
          {price} {currency}
        </Button>
      </div>
    </Card>
  );
}
