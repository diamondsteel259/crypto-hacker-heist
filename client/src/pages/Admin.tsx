import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Pause, Play, Users, Settings as SettingsIcon, DollarSign, RotateCcw, AlertTriangle, Edit } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getTelegramInitData } from "@/lib/user";
import type { User, GameSetting, EquipmentType } from "@shared/schema";
import SeasonsAdmin from "@/components/SeasonsAdmin";

export default function Admin() {
  const { toast } = useToast();
  const [miningPaused, setMiningPaused] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [showResetSection, setShowResetSection] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [editCurrency, setEditCurrency] = useState<string>("");

  const { data: settings, isLoading: settingsLoading } = useQuery<GameSetting[]>({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const response = await fetch('/api/admin/settings', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const response = await fetch('/api/admin/users', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const { data: equipment, isLoading: equipmentLoading } = useQuery<EquipmentType[]>({
    queryKey: ['/api/equipment-types'],
  });

  useEffect(() => {
    const pausedSetting = settings?.find(s => s.key === 'mining_paused');
    setMiningPaused(pausedSetting?.value === 'true');
  }, [settings]);

  const pauseMiningMutation = useMutation({
    mutationFn: async (paused: boolean) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const endpoint = paused ? '/api/admin/mining/pause' : '/api/admin/mining/resume';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to update mining status');
      return response.json();
    },
    onSuccess: (_, paused) => {
      setMiningPaused(paused);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: paused ? "Mining Paused" : "Mining Resumed",
        description: paused ? "Block mining has been paused" : "Block mining has resumed",
      });
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/admin/users/${userId}/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify({ isAdmin }),
      });
      if (!response.ok) throw new Error('Failed to update admin status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Admin Status Updated",
        description: "User permissions have been changed",
      });
    },
  });

  const resetGameMutation = useMutation({
    mutationFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/admin/reset-all-users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
      });
      if (!response.ok) throw new Error('Failed to reset game data');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setResetConfirmText("");
      setShowResetSection(false);
      toast({
        title: "Game Reset Successful",
        description: `Reset ${data.users_reset} users and deleted ${Object.values(data.records_deleted || {}).reduce((a: number, b: any) => a + (b || 0), 0)} records`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset game data",
        variant: "destructive",
      });
    },
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ equipmentId, basePrice, currency }: { equipmentId: string; basePrice?: number; currency?: string }) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/admin/equipment/${equipmentId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify({ basePrice, currency }),
      });
      if (!response.ok) throw new Error('Failed to update equipment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment-types'] });
      setEditingEquipment(null);
      setEditPrice("");
      setEditCurrency("");
      toast({
        title: "Equipment Updated",
        description: "Price and currency have been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update equipment",
        variant: "destructive",
      });
    },
  });

  const totalUsers = users?.length || 0;
  const totalBalance = users?.reduce((sum, u) => sum + u.csBalance, 0) || 0;
  const totalHashrate = users?.reduce((sum, u) => sum + u.totalHashrate, 0) || 0;

  return (
    <div className="min-h-screen bg-background p-2 md:p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-destructive/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Game Management Console
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyber-blue" />
              <p className="text-xs text-muted-foreground uppercase">Total Users</p>
            </div>
            <p className="text-2xl font-bold font-mono" data-testid="text-total-users">
              {usersLoading ? '...' : totalUsers}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-matrix-green" />
              <p className="text-xs text-muted-foreground uppercase">Total CS</p>
            </div>
            <p className="text-2xl font-bold font-mono text-matrix-green" data-testid="text-total-cs">
              {usersLoading ? '...' : totalBalance.toLocaleString()}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <SettingsIcon className="w-4 h-4 text-neon-orange" />
              <p className="text-xs text-muted-foreground uppercase">Total HR</p>
            </div>
            <p className="text-2xl font-bold font-mono" data-testid="text-total-hashrate">
              {usersLoading ? '...' : totalHashrate.toLocaleString()}
            </p>
          </Card>
        </div>

        {/* Mining Control */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Mining Control
          </h3>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-md">
            <div className="flex items-center gap-3">
              {miningPaused ? (
                <Pause className="w-5 h-5 text-destructive" />
              ) : (
                <Play className="w-5 h-5 text-matrix-green" />
              )}
              <div>
                <p className="font-semibold">Block Mining</p>
                <p className="text-sm text-muted-foreground">
                  {miningPaused ? 'Currently paused' : 'Currently active'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => pauseMiningMutation.mutate(!miningPaused)}
              variant={miningPaused ? "default" : "destructive"}
              data-testid={miningPaused ? "button-resume-mining" : "button-pause-mining"}
            >
              {miningPaused ? "Resume Mining" : "Pause Mining"}
            </Button>
          </div>
        </Card>

        {/* Equipment Price Management */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Equipment Price Management
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Modify equipment prices and currency types (CS, CHST, or TON)
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {equipmentLoading ? (
              <p className="text-sm text-muted-foreground">Loading equipment...</p>
            ) : (
              equipment?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-md"
                >
                  {editingEquipment === item.id ? (
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-2">{item.name}</p>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`price-${item.id}`} className="text-xs">Price</Label>
                            <Input
                              id={`price-${item.id}`}
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              placeholder={item.basePrice.toString()}
                              className="mt-1"
                            />
                          </div>
                          <div className="w-32">
                            <Label htmlFor={`currency-${item.id}`} className="text-xs">Currency</Label>
                            <select
                              id={`currency-${item.id}`}
                              value={editCurrency}
                              onChange={(e) => setEditCurrency(e.target.value)}
                              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background"
                            >
                              <option value="CS">CS</option>
                              <option value="CHST">CHST</option>
                              <option value="TON">TON</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const newPrice = editPrice ? parseFloat(editPrice) : undefined;
                            const newCurrency = editCurrency || undefined;
                            if (newPrice || newCurrency) {
                              updateEquipmentMutation.mutate({
                                equipmentId: item.id,
                                basePrice: newPrice,
                                currency: newCurrency,
                              });
                            }
                          }}
                          disabled={updateEquipmentMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingEquipment(null);
                            setEditPrice("");
                            setEditCurrency("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.category} • {item.tier}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-mono text-sm font-semibold">
                            {item.basePrice.toLocaleString()} {item.currency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.baseHashrate.toLocaleString()} H/s
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingEquipment(item.id);
                            setEditPrice(item.basePrice.toString());
                            setEditCurrency(item.currency);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* User Management */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {usersLoading ? (
              <p className="text-sm text-muted-foreground">Loading users...</p>
            ) : (
              users?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-md"
                  data-testid={`user-row-${user.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        CS: {user.csBalance.toLocaleString()} | HR: {user.totalHashrate.toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {user.isAdmin && (
                      <Badge variant="destructive" className="text-xs">Admin</Badge>
                    )}
                    <Switch
                      checked={user.isAdmin}
                      onCheckedChange={(checked) => 
                        toggleAdminMutation.mutate({ userId: user.id, isAdmin: checked })
                      }
                      data-testid={`switch-admin-${user.id}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Game Content Management */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Game Content Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">Daily Challenges</Badge>
              </div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-muted-foreground">Active challenges</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">Achievements</Badge>
              </div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-muted-foreground">Total achievements</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">Cosmetics</Badge>
              </div>
              <p className="text-2xl font-bold">13</p>
              <p className="text-xs text-muted-foreground">Available items</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            💡 Game content is automatically seeded from server/seedGameContent.ts. To modify challenges, achievements, or cosmetic items, update that file and redeploy.
          </p>
        </Card>
        <SeasonsAdmin />


        {/* Game Reset Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-destructive" />
            Game Reset
          </h3>
          
          {!showResetSection ? (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-destructive font-semibold mb-2">
                    Reset Game Data
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    This will permanently delete all user equipment, balances, hashrate, and progress. 
                    This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowResetSection(true)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Show Reset Options
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-destructive font-semibold mb-2">
                      ⚠️ DANGER ZONE ⚠️
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      This will permanently delete ALL game data for ALL users:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-3">
                      <li>All equipment and upgrades</li>
                      <li>All CS and CHST balances</li>
                      <li>All hashrate and mining progress</li>
                      <li>All block rewards and referrals</li>
                    </ul>
                    <p className="text-sm text-destructive font-semibold">
                      This action CANNOT be undone!
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="reset-confirm" className="text-sm font-medium">
                    Type "RESET ALL DATA" to confirm:
                  </Label>
                  <Input
                    id="reset-confirm"
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    placeholder="RESET ALL DATA"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    disabled={resetConfirmText !== "RESET ALL DATA" || resetGameMutation.isPending}
                    onClick={() => {
                      resetGameMutation.mutate();
                    }}
                  >
                    {resetGameMutation.isPending ? (
                      "Resetting..."
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset All Users
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowResetSection(false);
                      setResetConfirmText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
