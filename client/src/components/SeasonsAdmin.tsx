import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getTelegramInitData } from "@/lib/user";

interface Season {
  id: number;
  seasonId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  bonusMultiplier: number;
  specialRewards: string | null;
  isActive: boolean;
}

export default function SeasonsAdmin() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [formData, setFormData] = useState({
    seasonId: "",
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    bonusMultiplier: "1.0",
    specialRewards: "",
  });

  const { data: seasons = [], isLoading } = useQuery<Season[]>({
    queryKey: ["/api/seasons"],
    queryFn: async () => {
      const response = await fetch("/api/seasons");
      if (!response.ok) throw new Error("Failed to fetch seasons");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const initData = getTelegramInitData();
      const response = await fetch("/api/admin/seasons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": initData || "",
        },
        body: JSON.stringify({
          ...data,
          bonusMultiplier: parseFloat(data.bonusMultiplier),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create season");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      toast({
        title: "Season Created",
        description: data.message || "Season created successfully",
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ seasonId, data }: { seasonId: string; data: typeof formData }) => {
      const initData = getTelegramInitData();
      const response = await fetch(`/api/admin/seasons/${seasonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": initData || "",
        },
        body: JSON.stringify({
          ...data,
          bonusMultiplier: parseFloat(data.bonusMultiplier),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update season");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      toast({
        title: "Season Updated",
        description: data.message || "Season updated successfully",
      });
      setDialogOpen(false);
      setEditingSeason(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ seasonId, isActive }: { seasonId: string; isActive: boolean }) => {
      const initData = getTelegramInitData();
      const response = await fetch(`/api/admin/seasons/${seasonId}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": initData || "",
        },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to toggle season");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seasons/active"] });
      toast({
        title: data.message || "Season Updated",
        description: `Season has been ${data.season.isActive ? "activated" : "deactivated"}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (seasonId: string) => {
      const initData = getTelegramInitData();
      const response = await fetch(`/api/admin/seasons/${seasonId}`, {
        method: "DELETE",
        headers: {
          "X-Telegram-Init-Data": initData || "",
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete season");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      toast({
        title: "Season Deleted",
        description: data.message || "Season deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      seasonId: "",
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      bonusMultiplier: "1.0",
      specialRewards: "",
    });
  };

  const handleEdit = (season: Season) => {
    setEditingSeason(season);
    setFormData({
      seasonId: season.seasonId,
      name: season.name,
      description: season.description,
      startDate: new Date(season.startDate).toISOString().slice(0, 16),
      endDate: new Date(season.endDate).toISOString().slice(0, 16),
      bonusMultiplier: season.bonusMultiplier.toString(),
      specialRewards: season.specialRewards || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingSeason) {
      updateMutation.mutate({ seasonId: editingSeason.seasonId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Seasons Management</h3>
        </div>
        <Button
          onClick={() => {
            setEditingSeason(null);
            resetForm();
            setDialogOpen(true);
          }}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Season
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading seasons...</p>
      ) : seasons.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">No seasons created yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {seasons.map((season) => {
            const now = new Date();
            const start = new Date(season.startDate);
            const end = new Date(season.endDate);
            const isLive = season.isActive && start <= now && end >= now;

            return (
              <div
                key={season.id}
                className={`p-4 rounded-lg border ${
                  isLive
                    ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30'
                    : 'bg-background/50 border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{season.name}</h4>
                      {isLive && (
                        <Badge className="text-xs bg-purple-500">LIVE</Badge>
                      )}
                      {season.isActive && !isLive && (
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{season.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {start.toLocaleDateString()} - {end.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => handleEdit(season)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        toggleMutation.mutate({
                          seasonId: season.seasonId,
                          isActive: !season.isActive,
                        })
                      }
                    >
                      {season.isActive ? (
                        <PowerOff className="w-3 h-3 text-orange-500" />
                      ) : (
                        <Power className="w-3 h-3 text-green-500" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        if (confirm(`Delete season "${season.name}"?`)) {
                          deleteMutation.mutate(season.seasonId);
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div>
                    <span className="text-muted-foreground">Bonus Multiplier:</span>
                    <span className="ml-1 font-mono text-matrix-green">
                      {season.bonusMultiplier}x
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Season ID:</span>
                    <span className="ml-1 font-mono">{season.seasonId}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSeason ? "Edit Season" : "Create New Season"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seasonId">Season ID</Label>
                <Input
                  id="seasonId"
                  value={formData.seasonId}
                  onChange={(e) => setFormData({ ...formData, seasonId: e.target.value })}
                  placeholder="winter-2024"
                  disabled={!!editingSeason}
                />
              </div>
              <div>
                <Label htmlFor="name">Season Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Winter Wonderland"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A festive winter event with bonus rewards..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bonusMultiplier">Bonus Multiplier</Label>
              <Input
                id="bonusMultiplier"
                type="number"
                step="0.1"
                min="1"
                value={formData.bonusMultiplier}
                onChange={(e) => setFormData({ ...formData, bonusMultiplier: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                2.0 = 2x referral bonuses, mining rewards, etc.
              </p>
            </div>

            <div>
              <Label htmlFor="specialRewards">Special Rewards (JSON)</Label>
              <Textarea
                id="specialRewards"
                value={formData.specialRewards}
                onChange={(e) => setFormData({ ...formData, specialRewards: e.target.value })}
                placeholder='{"equipment": ["asic-s19"], "cs": 10000}'
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional: JSON object for special season rewards
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingSeason(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingSeason
                  ? "Update Season"
                  : "Create Season"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
