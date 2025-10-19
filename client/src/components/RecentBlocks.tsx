import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users } from "lucide-react";
import { getCurrentUserId } from "@/lib/user";
import type { Block, BlockReward } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface BlockWithReward extends Block {
  userReward?: BlockReward;
}

export default function RecentBlocks() {
  const userId = getCurrentUserId();

  const { data: blocks = [], isLoading } = useQuery<Block[]>({
    queryKey: ['/api/blocks'],
    select: (data) => data.slice(0, 3),
  });

  const { data: userRewards = [] } = useQuery<BlockReward[]>({
    queryKey: [`/api/user/${userId}/rewards`],
    enabled: !!userId,
  });

  const blocksWithRewards: BlockWithReward[] = blocks.map(block => ({
    ...block,
    userReward: userRewards.find(r => r.blockId === block.id)
  }));

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider">Recent Blocks</h3>
          <Badge variant="outline" className="text-xs">Loading...</Badge>
        </div>
        <div className="text-sm text-muted-foreground">Loading recent blocks...</div>
      </Card>
    );
  }

  if (blocksWithRewards.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider">Recent Blocks</h3>
          <Badge variant="outline" className="text-xs">No blocks</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          No blocks mined yet. Start mining to see blocks appear!
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider">Recent Blocks</h3>
        <Badge variant="outline" className="text-xs">
          Last {blocksWithRewards.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {blocksWithRewards.map((block) => (
          <div
            key={block.id}
            className="p-4 rounded-md bg-card border border-card-border hover-elevate transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-matrix-green" />
                <span className="font-mono font-semibold text-sm">Block #{block.blockNumber}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(block.timestamp), { addSuffix: true })}
              </span>
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
                <p className="font-mono font-semibold">{block.totalMiners.toLocaleString()}</p>
              </div>
              {block.userReward && (
                <>
                  <div>
                    <p className="text-muted-foreground mb-1">Your Share</p>
                    <p className="font-mono font-semibold text-cyber-blue">
                      {block.userReward.sharePercent.toFixed(3)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Your Reward</p>
                    <p className="font-mono font-semibold text-neon-orange">
                      +{Math.floor(block.userReward.reward)} CS
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
