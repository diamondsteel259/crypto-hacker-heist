import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Gift, Copy } from "lucide-react";

export default function ReferralPanel() {
  const referralCode = "HACK4F2X";
  const referrals = 3;
  const botUsername = import.meta.env.VITE_BOT_USERNAME || "cryptohackerheist_bot";

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://t.me/${botUsername}?start=${referralCode}`);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-matrix-green" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">Referrals</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {referrals} Friends
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-md bg-matrix-green/10 border border-matrix-green/30">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-matrix-green" />
            <p className="text-xs font-semibold uppercase tracking-wider">Rewards</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Earn <span className="font-bold text-matrix-green">500 CS</span> + 
            <span className="font-bold text-cyber-blue"> 1 Loot Box</span> per referral
          </p>
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
            Your Referral Link
          </label>
          <div className="flex gap-2">
            <Input
              value={`t.me/chh_bot?start=${referralCode}`}
              readOnly
              className="font-mono text-xs"
              data-testid="input-referral-link"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopy}
              data-testid="button-copy-referral"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Your referrals have earned you:</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-md bg-muted/30">
              <p className="text-2xl font-bold font-mono text-matrix-green">1,500</p>
              <p className="text-xs text-muted-foreground mt-1">CS</p>
            </div>
            <div className="text-center p-3 rounded-md bg-muted/30">
              <p className="text-2xl font-bold font-mono text-cyber-blue">3</p>
              <p className="text-xs text-muted-foreground mt-1">Boxes</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
