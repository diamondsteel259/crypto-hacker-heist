import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Blocks, Search, Trophy, Users, Clock } from "lucide-react";

interface Block {
  number: number;
  timestamp: string;
  timeAgo: string;
  reward: number;
  miners: number;
  totalHashrate: string;
  difficulty: number;
  yourShare: number;
  yourReward: number;
}

export default function BlockExplorer() {
  // todo: remove mock functionality
  const blocks: Block[] = Array.from({ length: 20 }, (_, i) => {
    const blockNum = 52341 - i;
    const minutesAgo = (i + 1) * 5;
    return {
      number: blockNum,
      timestamp: new Date(Date.now() - minutesAgo * 60000).toLocaleString(),
      timeAgo: `${minutesAgo}m ago`,
      reward: 100000,
      miners: 8432 - i * 2,
      totalHashrate: `${(2.47 - i * 0.01).toFixed(2)} PH/s`,
      difficulty: 1250 + i * 5,
      yourShare: parseFloat((0.048 - i * 0.001).toFixed(3)),
      yourReward: Math.floor(48 - i * 0.5),
    };
  });

  return (
    <div className="min-h-screen bg-background terminal-scanline">
      <div className="max-w-7xl mx-auto p-2 md:p-4 space-y-3 md:space-y-6">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-matrix-green/20 flex items-center justify-center">
              <Blocks className="w-6 h-6 text-matrix-green" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Block Explorer</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Recent block mining history
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search block #..."
                className="pl-9 w-[200px]"
                data-testid="input-search-block"
              />
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search block #..."
              className="pl-9"
              data-testid="input-search-block-mobile"
            />
          </div>
        </div>

        {/* Network Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <Card className="p-2.5 md:p-4">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <Blocks className="w-3 md:w-4 h-3 md:h-4 text-matrix-green" />
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase">Latest Block</p>
            </div>
            <p className="text-lg md:text-2xl font-bold font-mono">{blocks[0].number}</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-neon-orange" />
              <p className="text-xs text-muted-foreground uppercase">Block Reward</p>
            </div>
            <p className="text-2xl font-bold font-mono text-matrix-green">100K</p>
            <p className="text-xs text-muted-foreground">CS</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyber-blue" />
              <p className="text-xs text-muted-foreground uppercase">Active Miners</p>
            </div>
            <p className="text-2xl font-bold font-mono">{blocks[0].miners.toLocaleString()}</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-chart-2" />
              <p className="text-xs text-muted-foreground uppercase">Avg Block Time</p>
            </div>
            <p className="text-2xl font-bold font-mono">5:00</p>
            <p className="text-xs text-muted-foreground">minutes</p>
          </Card>
        </div>

        {/* Blocks List */}
        <Card className="p-4 md:p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Recent Blocks</h3>
          
          <div className="space-y-3">
            {blocks.map((block) => (
              <div
                key={block.number}
                className="p-4 rounded-md bg-card border border-card-border hover-elevate transition-all"
                data-testid={`block-${block.number}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-matrix-green" />
                    <span className="font-mono font-semibold">Block #{block.number}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{block.timeAgo}</p>
                    <p className="text-xs text-muted-foreground">{block.timestamp}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Reward</p>
                    <p className="font-mono font-semibold text-matrix-green">
                      {block.reward.toLocaleString()} CS
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Miners
                    </p>
                    <p className="font-mono font-semibold">{block.miners.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Network HR</p>
                    <p className="font-mono font-semibold text-cyber-blue">{block.totalHashrate}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Difficulty</p>
                    <p className="font-mono font-semibold">{block.difficulty}</p>
                  </div>
                </div>

                {block.yourReward > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Your Share: {block.yourShare}%</span>
                      <Badge variant="outline" className="text-xs bg-neon-orange/20 text-neon-orange border-neon-orange/30">
                        +{block.yourReward} CS Earned
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
