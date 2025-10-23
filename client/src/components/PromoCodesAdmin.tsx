import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Ticket, Plus, Trash2, Copy } from "lucide-react";
import { getTelegramInitData } from "@/lib/user";
import { queryClient } from "@/lib/queryClient";

interface PromoCode {
  id: number;
  code: string;
  description: string;
  rewardType: string;
  rewardAmount: string;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function PromoCodesAdmin() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    rewardType: "cs",
    rewardAmount: "",
    maxUses: "",
    expiresAt: "",
  });

  const { data: promoCodes, isLoading } = useQuery<PromoCode[]>({
    queryKey: ['/api/admin/promo-codes'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/promo-codes', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch promo codes');
      return response.json();
    },
  });

  const createPromoCodeMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const payload: any = {
        code: data.code.toUpperCase(),
        description: data.description,
        rewardType: data.rewardType,
        rewardAmount: data.rewardAmount,
      };

      if (data.maxUses) {
        payload.maxUses = parseInt(data.maxUses);
      }
      if (data.expiresAt) {
        payload.expiresAt = new Date(data.expiresAt).toISOString();
      }

      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create promo code');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promo-codes'] });
      setFormData({ code: "", description: "", rewardType: "cs", rewardAmount: "", maxUses: "", expiresAt: "" });
      setShowCreateForm(false);
      toast({
        title: "Promo Code Created",
        description: "The promo code has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const togglePromoCodeMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('Failed to update promo code');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promo-codes'] });
      toast({
        title: "Promo Code Updated",
        description: "The promo code status has been changed",
      });
    },
  });

  const deletePromoCodeMutation = useMutation({
    mutationFn: async (id: number) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'DELETE',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to delete promo code');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promo-codes'] });
      toast({
        title: "Promo Code Deleted",
        description: "The promo code has been removed",
      });
    },
  });

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: `Code "${code}" copied to clipboard`,
    });
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.rewardAmount) {
      toast({
        title: "Validation Error",
        description: "Code and reward amount are required",
        variant: "destructive",
      });
      return;
    }

    createPromoCodeMutation.mutate(formData);
  };

  const getRewardText = (code: PromoCode) => {
    const data = JSON.parse(code.rewardAmount);
    const parts: string[] = [];
    if (data.cs > 0) parts.push(`${data.cs.toLocaleString()} CS`);
    if (data.chst > 0) parts.push(`${data.chst.toLocaleString()} CHST`);
    if (data.hashrate > 0) parts.push(`${data.hashrate.toLocaleString()} HR`);
    return parts.join(', ') || 'N/A';
  };

  const isExpired = (code: PromoCode) => {
    if (!code.expiresAt) return false;
    return new Date(code.expiresAt) < new Date();
  };

  const isMaxedOut = (code: PromoCode) => {
    if (!code.maxUses) return false;
    return code.usedCount >= code.maxUses;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Ticket className="w-5 h-5 text-yellow-500" />
            Promo Codes Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Create marketing codes with CS, CHST, or hashrate rewards
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          size="sm"
          variant={showCreateForm ? "outline" : "default"}
        >
          <Plus className="w-4 h-4 mr-2" />
          {showCreateForm ? "Cancel" : "New Promo Code"}
        </Button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-4 bg-muted/30 rounded-md space-y-4">
          <div>
            <Label htmlFor="code">Code</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME2024"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={generateRandomCode}>
                Generate
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Welcome bonus for new users..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="rewardType">Reward Type</Label>
            <select
              id="rewardType"
              value={formData.rewardType}
              onChange={(e) => setFormData({ ...formData, rewardType: e.target.value })}
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="cs">CryptoScore (CS)</option>
              <option value="chst">CHST Tokens</option>
              <option value="hashrate">Hashrate Boost</option>
              <option value="mixed">Mixed Rewards (JSON)</option>
            </select>
          </div>

          <div>
            <Label htmlFor="rewardAmount">Reward Amount</Label>
            {formData.rewardType === 'mixed' ? (
              <textarea
                id="rewardAmount"
                value={formData.rewardAmount}
                onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
                placeholder='{"cs": 10000, "chst": 100, "hashrate": 50}'
                className="mt-1 w-full h-20 px-3 py-2 rounded-md border border-input bg-background font-mono text-sm"
              />
            ) : (
              <Input
                id="rewardAmount"
                type="number"
                value={formData.rewardAmount}
                onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
                placeholder="10000"
                className="mt-1"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxUses">Max Uses (Optional)</Label>
              <Input
                id="maxUses"
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                placeholder="Unlimited"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="expiresAt">Expires At (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={createPromoCodeMutation.isPending}
            >
              Create Promo Code
            </Button>
            <Button variant="outline" onClick={() => {
              setFormData({ code: "", description: "", rewardType: "cs", rewardAmount: "", maxUses: "", expiresAt: "" });
              setShowCreateForm(false);
            }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading promo codes...</p>
        ) : promoCodes && promoCodes.length > 0 ? (
          promoCodes.map((code) => {
            const expired = isExpired(code);
            const maxedOut = isMaxedOut(code);
            const inactive = !code.isActive || expired || maxedOut;

            return (
              <div
                key={code.id}
                className={`p-4 rounded-md ${
                  inactive ? 'bg-muted/30 opacity-60' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold font-mono text-lg">{code.code}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(code.code)}
                        className="h-6 px-2"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      {code.isActive && !expired && !maxedOut ? (
                        <Badge className="text-xs bg-matrix-green text-black">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {expired ? 'Expired' : maxedOut ? 'Max Uses' : 'Inactive'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{code.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">
                        Reward: {getRewardText(code)}
                      </Badge>
                      <Badge variant="outline">
                        Used: {code.usedCount}{code.maxUses ? ` / ${code.maxUses}` : ''}
                      </Badge>
                      {code.expiresAt && (
                        <Badge variant="outline">
                          Expires: {new Date(code.expiresAt).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={code.isActive ? "destructive" : "default"}
                      onClick={() => togglePromoCodeMutation.mutate({ id: code.id, isActive: !code.isActive })}
                      disabled={togglePromoCodeMutation.isPending || expired || maxedOut}
                    >
                      {code.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deletePromoCodeMutation.mutate(code.id)}
                      disabled={deletePromoCodeMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No promo codes yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first promo code for marketing campaigns
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
