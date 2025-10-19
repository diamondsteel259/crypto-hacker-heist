import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function HashrateChart() {
  // todo: remove mock functionality
  const data = [
    { time: "12h ago", hashrate: 50 },
    { time: "10h ago", hashrate: 100 },
    { time: "8h ago", hashrate: 150 },
    { time: "6h ago", hashrate: 200 },
    { time: "4h ago", hashrate: 250 },
    { time: "2h ago", hashrate: 280 },
    { time: "Now", hashrate: 280 },
  ];

  const maxHashrate = Math.max(...data.map(d => d.hashrate));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-matrix-green" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Hashrate History</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Last 12 hours</p>
        </div>
      </div>

      <div className="relative h-48">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
          <span>{maxHashrate} GH/s</span>
          <span>{(maxHashrate * 0.5).toFixed(0)} GH/s</span>
          <span>0 GH/s</span>
        </div>

        {/* Chart area */}
        <div className="ml-16 h-full flex items-end gap-2">
          {data.map((point, index) => {
            const heightPercent = (point.hashrate / maxHashrate) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="w-full flex flex-col justify-end h-full">
                  <div
                    className="w-full bg-gradient-to-t from-matrix-green to-cyber-blue rounded-t-sm transition-all group-hover:opacity-80"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 whitespace-nowrap">
                  {point.time}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Peak HR</p>
          <p className="text-lg font-bold font-mono text-neon-orange">{maxHashrate}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Avg HR</p>
          <p className="text-lg font-bold font-mono text-cyber-blue">
            {(data.reduce((sum, d) => sum + d.hashrate, 0) / data.length).toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current HR</p>
          <p className="text-lg font-bold font-mono text-matrix-green">
            {data[data.length - 1].hashrate}
          </p>
        </div>
      </div>
    </Card>
  );
}
