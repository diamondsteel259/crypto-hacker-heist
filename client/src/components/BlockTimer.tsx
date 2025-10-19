import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface BlockTimerProps {
  onBlockMined?: () => void;
}

export default function BlockTimer({ onBlockMined }: BlockTimerProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onBlockMined?.();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onBlockMined]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isPulse = timeLeft <= 10;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-matrix-green" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Next Block</h3>
        </div>
      </div>
      <div className={`text-center ${isPulse ? 'pulse-scale' : ''}`}>
        <div className="text-5xl font-bold text-matrix-green matrix-glow font-mono">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
          Block #52,341
        </p>
      </div>
    </Card>
  );
}
