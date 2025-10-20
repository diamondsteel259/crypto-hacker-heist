import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface BlockTimerProps {
  onBlockMined?: () => void;
}

export default function BlockTimer({ onBlockMined }: BlockTimerProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Fetch latest block data
  const { data: latestBlock } = useQuery({
    queryKey: ['/api/blocks/latest'],
    refetchInterval: 1000, // Refetch every second
  });

  // Calculate time until next block based on actual mining schedule
  useEffect(() => {
    if (!latestBlock) return;

    const blockInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = Date.now();
    const lastBlockTime = new Date(latestBlock.timestamp).getTime();
    const nextBlockTime = lastBlockTime + blockInterval;
    const timeUntilNext = Math.max(0, Math.floor((nextBlockTime - now) / 1000));

    setTimeLeft(timeUntilNext);

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const timeUntilNext = Math.max(0, Math.floor((nextBlockTime - currentTime) / 1000));
      
      if (timeUntilNext === 0) {
        onBlockMined?.();
        // Reset timer for next block
        const newNextBlockTime = currentTime + blockInterval;
        setTimeLeft(Math.floor(blockInterval / 1000));
      } else {
        setTimeLeft(timeUntilNext);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [latestBlock, onBlockMined]);

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
          Block #{latestBlock ? latestBlock.blockNumber + 1 : '...'}
        </p>
      </div>
    </Card>
  );
}
