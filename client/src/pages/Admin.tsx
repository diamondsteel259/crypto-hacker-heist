import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Pause, Play, Users, Settings as SettingsIcon, DollarSign, RotateCcw, AlertTriangle, Edit, TrendingUp, ToggleLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getTelegramInitData } from "@/lib/user";
import type { User, GameSetting, EquipmentType, FeatureFlag } from "@shared/schema";
import SeasonsAdmin from "@/components/SeasonsAdmin";
import AnnouncementsAdmin from "@/components/AnnouncementsAdmin";
import PromoCodesAdmin from "@/components/PromoCodesAdmin";
import AnalyticsAdmin from "@/components/AnalyticsAdmin";
import EventsAdmin from "@/components/EventsAdmin";
import EconomyAdmin from "@/components/EconomyAdmin";
import SegmentationAdmin from "@/components/SegmentationAdmin";

export default function Admin() {
  const { toast } = useToast();
  const [miningPaused, setMiningPaused] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [showResetSection, setShowResetSection] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [editCurrency, setEditCurrency] = useState<string>("");
  const [selectedUserForPayments, setSelectedUserForPayments] = useState<string | null>(null);
  const [selectedUserForBalanceEdit, setSelectedUserForBalanceEdit] = useState<string | null>(null);
  const [editCs, setEditCs] = useState<string>("");
  const [editChst, setEditChst] = useState<string>("");

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

  const { data: featureFlags, isLoading: flagsLoading } = useQuery<FeatureFlag[]>({
    queryKey: ['/api/admin/feature-flags'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const response = await fetch('/api/admin/feature-flags', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch feature flags');
      return response.json();
    },
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

  const updateBalanceMutation = useMutation({
    mutationFn: async ({ userId, csBalance, chstBalance }: { userId: string; csBalance?: number; chstBalance?: number }) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/admin/users/${userId}/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify({ csBalance, chstBalance }),
      });
      if (!response.ok) throw new Error('Failed to update balance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setSelectedUserForBalanceEdit(null);
      setEditCs("");
      setEditChst("");
      toast({
        title: "Balance Updated",
        description: "User balance has been updated successfully",
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

  const recalculateHashratesMutation = useMutation({
    mutationFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/admin/recalculate-hashrates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
      });
      if (!response.ok) throw new Error('Failed to recalculate hashrates');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Hashrates Recalculated",
        description: `Updated ${data.usersUpdated} out of ${data.totalUsers} users with corrected hashrates`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Recalculation Failed",
        description: error.message || "Failed to recalculate hashrates",
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

  const toggleFeatureFlagMutation = useMutation({
    mutationFn: async ({ featureKey, isEnabled }: { featureKey: string; isEnabled: boolean }) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/admin/feature-flags/${featureKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify({ isEnabled }),
      });
      if (!response.ok) throw new Error('Failed to update feature flag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feature-flags'] });
      queryClient.invalidateQueries({ queryKey: ['/api/feature-flags'] });
      toast({
        title: "Feature Updated",
        description: "Feature visibility has been changed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update feature flag",
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
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Game Management Console
            </p>
          </div>
        </div>

        {/* Stats - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <Card className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyber-blue" />
              <p className="text-xs text-muted-foreground uppercase">Total Users</p>
            </div>
            <p className="text-xl md:text-2xl font-bold font-mono" data-testid="text-total-users">
              {usersLoading ? '...' : totalUsers}
            </p>
          </Card>

          <Card className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-matrix-green" />
              <p className="text-xs text-muted-foreground uppercase">Total CS</p>
            </div>
            <p className="text-xl md:text-2xl font-bold font-mono text-matrix-green" data-testid="text-total-cs">
              {usersLoading ? '...' : totalBalance.toLocaleString()}
            </p>
          </Card>

          <Card className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2">
              <SettingsIcon className="w-4 h-4 text-neon-orange" />
              <p className="text-xs text-muted-foreground uppercase">Total HR</p>
            </div>
            <p className="text-xl md:text-2xl font-bold font-mono" data-testid="text-total-hashrate">
              {usersLoading ? '...' : totalHashrate.toLocaleString()}
            </p>
          </Card>
        </div>

        {/* Mining Control */}
        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <SettingsIcon className="w-4 md:w-5 h-4 md:h-5" />
            Mining Control
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 md:p-4 bg-muted/30 rounded-md">
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

        {/* Feature Flags Management */}
        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <ToggleLeft className="w-4 md:w-5 h-4 md:h-5 text-purple-500" />
            Feature Flags - Enable/Disable Pages
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mb-4">
            Control which features and pages are visible to users in navigation
          </p>
          <div className="space-y-2 max-h-[60vh] md:max-h-96 overflow-y-auto">
            {flagsLoading ? (
              <p className="text-xs md:text-sm text-muted-foreground">Loading feature flags...</p>
            ) : featureFlags && featureFlags.length > 0 ? (
              featureFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 md:p-4 bg-muted/30 rounded-md"
                >
                  <div className="flex-1 w-full sm:w-auto">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm md:text-base">{flag.featureName}</p>
                      {flag.isEnabled ? (
                        <Badge className="text-xs bg-matrix-green text-black">Enabled</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Disabled</Badge>
                      )}
                    </div>
                    {flag.description && (
                      <p className="text-xs text-muted-foreground mb-1">{flag.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground/70">
                      Key: {flag.featureKey}
                    </p>
                  </div>
                  <Switch
                    checked={flag.isEnabled}
                    onCheckedChange={(checked) =>
                      toggleFeatureFlagMutation.mutate({
                        featureKey: flag.featureKey,
                        isEnabled: checked,
                      })
                    }
                    disabled={toggleFeatureFlagMutation.isPending}
                    className="flex-shrink-0"
                  />
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <ToggleLeft className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground text-sm">No feature flags configured</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Feature flags will be seeded automatically on first deploy
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Equipment Price Management */}
        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <DollarSign className="w-4 md:w-5 h-4 md:h-5" />
            Equipment Price Management
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mb-4">
            Modify equipment prices and currency types (CS, CHST, or TON)
          </p>
          <div className="space-y-2 max-h-[60vh] md:max-h-96 overflow-y-auto">
            {equipmentLoading ? (
              <p className="text-xs md:text-sm text-muted-foreground">Loading equipment...</p>
            ) : (
              equipment?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-md"
                >
                  {editingEquipment === item.id ? (
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
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
        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
            <Users className="w-4 md:w-5 h-4 md:h-5" />
            User Management
          </h3>
          <div className="space-y-2 max-h-[60vh] md:max-h-96 overflow-y-auto">
            {usersLoading ? (
              <p className="text-xs md:text-sm text-muted-foreground">Loading users...</p>
            ) : (
              users?.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 md:p-4 bg-muted/30 rounded-md"
                  data-testid={`user-row-${user.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-sm md:text-base">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        CS: {user.csBalance.toLocaleString()} | HR: {user.totalHashrate.toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {user.isAdmin && (
                      <Badge variant="destructive" className="text-xs">Admin</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUserForPayments(user.id)}
                      className="text-xs"
                    >
                      View Payments
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUserForBalanceEdit(user.id);
                        setEditCs(user.csBalance.toString());
                        setEditChst(user.chstBalance.toString());
                      }}
                      className="text-xs"
                    >
                      Edit Balance
                    </Button>
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

        {/* Payment Logs */}
        {selectedUserForPayments && <PaymentLogsSection userId={selectedUserForPayments} onClose={() => setSelectedUserForPayments(null)} />}

        {/* Balance Editor */}
        {selectedUserForBalanceEdit && (
          <BalanceEditorSection 
            userId={selectedUserForBalanceEdit} 
            user={users?.find(u => u.id === selectedUserForBalanceEdit)}
            editCs={editCs}
            editChst={editChst}
            setEditCs={setEditCs}
            setEditChst={setEditChst}
            updateBalanceMutation={updateBalanceMutation}
            onClose={() => {
              setSelectedUserForBalanceEdit(null);
              setEditCs("");
              setEditChst("");
            }} 
          />
        )}

        {/* Game Content Overview */}
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

        {/* New Admin Features */}
        <AnnouncementsAdmin />
        <PromoCodesAdmin />
        <AnalyticsAdmin />
        <EventsAdmin />
        <EconomyAdmin />
        <SegmentationAdmin />

        {/* Recalculate Hashrates Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-500" />
            Recalculate Hashrates
          </h3>
          
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold mb-2">
                  Fix Hashrate Inconsistencies
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  This will recalculate all users' total hashrate based on their actual equipment. 
                  Use this to fix data inconsistencies (e.g., user shows hashrate but has no rigs).
                  This is a safe operation that only updates hashrate values.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => recalculateHashratesMutation.mutate()}
                  disabled={recalculateHashratesMutation.isPending}
                  className="border-cyan-500 text-cyan-500 hover:bg-cyan-500/10"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {recalculateHashratesMutation.isPending ? "Recalculating..." : "Recalculate All Hashrates"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

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

// Payment Logs Component
function PaymentLogsSection({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: paymentData, isLoading } = useQuery({
    queryKey: [`/api/admin/users/${userId}/payment-history`],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/admin/users/${userId}/payment-history`, {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch payment history');
      return response.json();
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-yellow-500" />
          Payment Logs - User {userId.slice(0, 8)}...
        </h3>
        <Button size="sm" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading payment history...</p>
      ) : paymentData && paymentData.payments.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
              <p className="text-xs text-muted-foreground uppercase mb-1">Total TON Spent</p>
              <p className="text-2xl font-bold font-mono text-yellow-500">
                {paymentData.totalTonSpent} TON
              </p>
            </div>
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-md">
              <p className="text-xs text-muted-foreground uppercase mb-1">Total Purchases</p>
              <p className="text-2xl font-bold font-mono text-cyan-500">
                {paymentData.totalPayments}
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {paymentData.payments.map((payment: any) => (
              <div
                key={payment.id}
                className="p-4 bg-muted/30 rounded-md border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={payment.verified ? "default" : "secondary"} className="text-xs">
                        {payment.type}
                      </Badge>
                      {payment.verified && (
                        <Badge variant="outline" className="text-xs border-green-500 text-green-500">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="font-semibold text-sm capitalize">{payment.itemName.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.purchasedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-yellow-500">
                      {payment.tonAmount} TON
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Transaction Hash:</p>
                  <p className="text-xs font-mono break-all bg-black/20 p-2 rounded">
                    {payment.transactionHash}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Rewards:</p>
                  <div className="flex flex-wrap gap-2">
                    {payment.rewards.cs > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {payment.rewards.cs.toLocaleString()} CS
                      </Badge>
                    )}
                    {payment.rewards.chst > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {payment.rewards.chst.toLocaleString()} CHST
                      </Badge>
                    )}
                    {payment.rewards.items && payment.rewards.items.length > 0 && (
                      payment.rewards.items.map((item: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs capitalize">
                          {item.replace(/_/g, ' ')}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="p-8 text-center">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No payment history found for this user.</p>
          <p className="text-xs text-muted-foreground mt-1">
            TON purchases will appear here once made.
          </p>
        </div>
      )}
    </Card>
  );
}

// Balance Editor Component
function BalanceEditorSection({ 
  userId, 
  user,
  editCs,
  editChst,
  setEditCs,
  setEditChst,
  updateBalanceMutation,
  onClose 
}: { 
  userId: string; 
  user?: User;
  editCs: string;
  editChst: string;
  setEditCs: (val: string) => void;
  setEditChst: (val: string) => void;
  updateBalanceMutation: any;
  onClose: () => void;
}) {
  const handleUpdate = () => {
    const csBalance = editCs ? parseFloat(editCs) : undefined;
    const chstBalance = editChst ? parseFloat(editChst) : undefined;
    
    if (csBalance !== undefined || chstBalance !== undefined) {
      updateBalanceMutation.mutate({ userId, csBalance, chstBalance });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Edit className="w-5 h-5 text-matrix-green" />
          Edit Balance - {user?.username || userId.slice(0, 8) + '...'}
        </h3>
        <Button size="sm" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-muted/30 rounded-md">
          <p className="text-sm text-muted-foreground mb-2">Current Balances:</p>
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-muted-foreground">CS</p>
              <p className="text-lg font-mono font-bold text-matrix-green">
                {user?.csBalance.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CHST</p>
              <p className="text-lg font-mono font-bold text-cyber-blue">
                {user?.chstBalance.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-cs" className="text-sm font-medium">
              New CS Balance
            </Label>
            <Input
              id="edit-cs"
              type="number"
              value={editCs}
              onChange={(e) => setEditCs(e.target.value)}
              placeholder="Enter CS amount"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="edit-chst" className="text-sm font-medium">
              New CHST Balance
            </Label>
            <Input
              id="edit-chst"
              type="number"
              value={editChst}
              onChange={(e) => setEditChst(e.target.value)}
              placeholder="Enter CHST amount"
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleUpdate}
            disabled={updateBalanceMutation.isPending || (!editCs && !editChst)}
            className="bg-matrix-green hover:bg-matrix-green/90 text-black"
          >
            {updateBalanceMutation.isPending ? "Updating..." : "Update Balance"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>

        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            ⚠️ This will set the user's balance to the exact amounts entered. Use this for testing or support purposes.
          </p>
        </div>
      </div>
    </Card>
  );
}
