import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Zap, Sparkles, Lock } from "lucide-react";

export default function LootBoxes() {
  return (
    <div className="min-h-screen bg-background terminal-scanline">
      <div className="max-w-5xl mx-auto p-2 md:p-4 space-y-3 md:space-y-6">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-matrix-green/20 flex items-center justify-center">
            <Package className="w-6 h-6 text-matrix-green" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Loot Boxes & Power-Ups</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Boost your mining power
            </p>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <Card className="p-8 text-center">
          <div className="inline-block p-4 rounded-full bg-matrix-green/10 mb-4">
            <Package className="w-12 h-12 text-matrix-green" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Coming Soon!</h2>
          <p className="text-muted-foreground mb-6">
            Loot boxes and power-ups are currently under development. Stay tuned for exciting rewards and mining boosts!
          </p>
          <Badge variant="outline" className="text-xs bg-matrix-green/20 text-matrix-green border-matrix-green/30">
            In Development
          </Badge>
        </Card>

        {/* Preview Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 opacity-75">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-neon-orange" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Mystery Boxes</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Open boxes to receive random equipment, CS bonuses, or rare power-ups with guaranteed 100-110% RTP.
            </p>
            <Button variant="outline" className="w-full" disabled data-testid="button-mystery-box">
              <Lock className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          </Card>

          <Card className="p-6 opacity-75">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-cyber-blue" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Power-Ups</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Temporary hashrate boosts, auto-mining, and other special abilities to accelerate your progress.
            </p>
            <Button variant="outline" className="w-full" disabled data-testid="button-power-ups">
              <Lock className="w-4 h-4 mr-2" />
              Coming Soon
            </Button>
          </Card>
        </div>

        {/* Planned Features */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Planned Features</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-matrix-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-matrix-green">1</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Provably Fair System</p>
                <p className="text-xs text-muted-foreground">
                  Cryptographically verifiable loot box results using HMAC-SHA256
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyber-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-cyber-blue">2</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Multiple Box Tiers</p>
                <p className="text-xs text-muted-foreground">
                  Basic, Premium, and Elite boxes with increasing rewards
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neon-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-neon-orange">3</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Time-Limited Power-Ups</p>
                <p className="text-xs text-muted-foreground">
                  2x hashrate boosts, auto-mining, and bonus CS collection
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
