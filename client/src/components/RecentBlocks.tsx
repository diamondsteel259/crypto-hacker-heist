import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users } from "lucide-react";

interface Block {
  id: number;
  timestamp: string;
  reward: number;
  miners: number;
  userShare: number;
  userReward: number;
}

export default function RecentBlocks() {
  // todo: remove mock functionality
  const blocks: Block[] = [
    { id: 52341, timestamp: "2m ago", reward: 100000, miners: 8432, userShare: 0.048, userReward: 48 },
    { id: 52340, timestamp: "7m ago", reward: 100000, miners: 8421, userShare: 0.047, userReward: 47 },
    { id: 52339, timestamp: "12m ago", reward: 100000, miners: 8410, userShare: 0.046, userReward: 46 },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider">Recent Blocks</h3>
        <Badge variant="outline" className="text-xs">
          Last 3
        </Badge>
      </div>

      <div className="space-y-3">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="p-4 rounded-md bg-card border border-card-border hover-elevate transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-matrix-green" />
                <span className="font-mono font-semibold text-sm">Block #{block.id}</span>
              </div>
              <span className="text-xs text-muted-foreground">{block.timestamp}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Total Reward</p>
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
                <p className="text-muted-foreground mb-1">Your Share</p>
                <p className="font-mono font-semibold text-cyber-blue">{block.userShare}%</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Your Reward</p>
                <p className="font-mono font-semibold text-neon-orange">
                  +{block.userReward} CS
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
