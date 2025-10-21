import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Sparkles } from "lucide-react";

interface Season {
  id: number;
  seasonId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  bonusMultiplier: number;
  specialRewards: string | null;
  isActive: boolean;
}

export default function ActiveSeason() {
  const { data: season } = useQuery<Season | null>({
    queryKey: ["/api/seasons/active"],
    queryFn: async () => {
      const response = await fetch("/api/seasons/active");
      if (!response.ok) return null;
      return response.json();
    },
    refetchInterval: 60000, // Check every minute
  });

  if (!season) return null;

  const endDate = new Date(season.endDate);
  const now = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-500/30">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-500" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">{season.name}</h3>
              <Badge className="text-xs bg-purple-500">
                <Sparkles className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{season.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="p-2 bg-background/50 rounded">
          <p className="text-xs text-muted-foreground">Bonus Multiplier</p>
          <p className="text-lg font-bold text-matrix-green">{season.bonusMultiplier}x</p>
        </div>
        <div className="p-2 bg-background/50 rounded">
          <p className="text-xs text-muted-foreground">Time Left</p>
          <p className="text-lg font-bold text-orange-500">
            {daysLeft} {daysLeft === 1 ? "day" : "days"}
          </p>
        </div>
      </div>

      {season.specialRewards && (
        <div className="mt-3 p-2 bg-background/50 rounded">
          <p className="text-xs text-muted-foreground mb-1">Special Rewards</p>
          <p className="text-xs font-mono">{season.specialRewards}</p>
        </div>
      )}
    </Card>
  );
}
