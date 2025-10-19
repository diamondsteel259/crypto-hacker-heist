import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Siren, Sparkles } from "lucide-react";

interface HeistEventBannerProps {
  type: "bonus" | "penalty";
  message: string;
  timeLeft?: string;
}

export default function HeistEventBanner({ type, message, timeLeft }: HeistEventBannerProps) {
  return (
    <Alert className={`border-2 ${type === "bonus" ? "border-chart-1 bg-chart-1/10" : "border-neon-orange bg-neon-orange/10"}`}>
      <div className="flex items-center gap-3">
        {type === "bonus" ? (
          <Sparkles className="w-5 h-5 text-chart-1" />
        ) : (
          <Siren className="w-5 h-5 text-neon-orange" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">
              {type === "bonus" ? "Heist Bonus Active!" : "Network Alert!"}
            </span>
            {timeLeft && (
              <Badge variant="outline" className="text-xs">
                {timeLeft} left
              </Badge>
            )}
          </div>
          <AlertDescription className="text-sm">{message}</AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
