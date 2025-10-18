import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Pause, Play, Users, Settings as SettingsIcon, DollarSign } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getTelegramInitData } from "@/lib/user";
import type { User, GameSetting } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const [miningPaused, setMiningPaused] = useState(false);

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
      </div>
    </div>
  );
}
