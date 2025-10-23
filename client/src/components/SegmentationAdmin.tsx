import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Edit, Trash2, RefreshCw, Send, Target } from "lucide-react";
import { getTelegramInitData } from "@/lib/user";
import { queryClient } from "@/lib/queryClient";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SegmentOverview {
  totalUsers: number;
  segments: Record<string, { count: number; percentage: number }>;
}

interface UserInSegment {
  id: number;
  telegramId: string;
  username: string | null;
  segment: string;
  lifetimeValue: string;
  daysSinceLastActive: number;
  totalSessions: number;
  retentionD7: boolean;
}

interface TargetedOffer {
  id: number;
  targetSegment: string;
  offerType: string;
  offerData: string;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function SegmentationAdmin() {
  const { toast } = useToast();
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);

  // Form state
  const [offerForm, setOfferForm] = useState({
    targetSegment: "whale",
    offerType: "promo_code",
    offerData: "",
    validFrom: "",
    validUntil: "",
  });

  const { data: overview, isLoading: overviewLoading } = useQuery<SegmentOverview>({
    queryKey: ['/api/admin/segments/overview'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/segments/overview', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch segment overview');
      return response.json();
    },
  });

  const { data: segmentUsers, isLoading: segmentUsersLoading } = useQuery<UserInSegment[]>({
    queryKey: ['/api/admin/segments', selectedSegment, 'users'],
    queryFn: async () => {
      if (!selectedSegment) return [];
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/segments/${selectedSegment}/users`, {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch segment users');
      return response.json();
    },
    enabled: !!selectedSegment,
  });

  const { data: offers, isLoading: offersLoading } = useQuery<TargetedOffer[]>({
    queryKey: ['/api/admin/segments/offers'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/segments/offers', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json();
    },
  });

  const refreshSegmentsMutation = useMutation({
    mutationFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/segments/refresh', {
        method: 'POST',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to refresh segments');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/segments'] });
      toast({
        title: "Segments Refreshed",
        description: "User segments are being recalculated in the background",
      });
    },
  });

  const sendReEngagementMutation = useMutation({
    mutationFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/segments/send-reengagement', {
        method: 'POST',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to send messages');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Messages Sent",
        description: "Re-engagement messages are being sent to at-risk users",
      });
    },
  });

  const sendChurnedMutation = useMutation({
    mutationFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/segments/send-churned', {
        method: 'POST',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to send messages');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Messages Sent",
        description: "Win-back messages are being sent to churned users",
      });
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data: typeof offerForm) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const payload = {
        ...data,
        validFrom: new Date(data.validFrom).toISOString(),
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
      };

      const response = await fetch('/api/admin/segments/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create offer');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/segments/offers'] });
      setOfferForm({ targetSegment: "whale", offerType: "promo_code", offerData: "", validFrom: "", validUntil: "" });
      setShowCreateOffer(false);
      setEditingOfferId(null);
      toast({
        title: "Offer Created",
        description: "The targeted offer has been created successfully",
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

  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof offerForm> }) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const payload: any = { ...data };
      if (data.validFrom) {
        payload.validFrom = new Date(data.validFrom).toISOString();
      }
      if (data.validUntil) {
        payload.validUntil = new Date(data.validUntil).toISOString();
      }

      const response = await fetch(`/api/admin/segments/offers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update offer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/segments/offers'] });
      setOfferForm({ targetSegment: "whale", offerType: "promo_code", offerData: "", validFrom: "", validUntil: "" });
      setEditingOfferId(null);
      toast({
        title: "Offer Updated",
        description: "The offer has been updated successfully",
      });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: number) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/segments/offers/${id}`, {
        method: 'DELETE',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to delete offer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/segments/offers'] });
      toast({
        title: "Offer Deleted",
        description: "The offer has been removed",
      });
    },
  });

  const getOfferTypeTemplate = (type: string) => {
    const templates: Record<string, string> = {
      promo_code: '{"code": "WHALE50", "description": "50% bonus for whales"}',
      flash_sale: '{"discount": 30, "description": "30% off premium items"}',
      bonus_cs: '{"amount": 10000, "description": "10K CS bonus"}',
      exclusive_equipment: '{"equipmentId": "titan_rig", "description": "Exclusive equipment"}',
    };
    return templates[type] || '{}';
  };

  const handleOfferSubmit = () => {
    if (!offerForm.targetSegment || !offerForm.offerData || !offerForm.validFrom) {
      toast({
        title: "Validation Error",
        description: "Segment, offer data, and start date are required",
        variant: "destructive",
      });
      return;
    }

    // Validate JSON
    try {
      JSON.parse(offerForm.offerData);
    } catch (e) {
      toast({
        title: "Validation Error",
        description: "Offer data must be valid JSON",
        variant: "destructive",
      });
      return;
    }

    if (editingOfferId) {
      updateOfferMutation.mutate({ id: editingOfferId, data: offerForm });
    } else {
      createOfferMutation.mutate(offerForm);
    }
  };

  const startEditOffer = (offer: TargetedOffer) => {
    setEditingOfferId(offer.id);
    setOfferForm({
      targetSegment: offer.targetSegment,
      offerType: offer.offerType,
      offerData: offer.offerData,
      validFrom: new Date(offer.validFrom).toISOString().slice(0, 16),
      validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().slice(0, 16) : "",
    });
    setShowCreateOffer(true);
  };

  const cancelOfferEdit = () => {
    setEditingOfferId(null);
    setOfferForm({ targetSegment: "whale", offerType: "promo_code", offerData: "", validFrom: "", validUntil: "" });
    setShowCreateOffer(false);
  };

  // Segment colors and labels
  const segmentConfig: Record<string, { color: string; label: string; icon: string }> = {
    whale: { color: '#a855f7', label: 'Whale', icon: '🐋' },
    dolphin: { color: '#06b6d4', label: 'Dolphin', icon: '🐬' },
    minnow: { color: '#10b981', label: 'Minnow', icon: '🐟' },
    new_user: { color: '#f59e0b', label: 'New User', icon: '✨' },
    active: { color: '#22c55e', label: 'Active', icon: '⚡' },
    at_risk: { color: '#f97316', label: 'At Risk', icon: '⚠️' },
    churned: { color: '#ef4444', label: 'Churned', icon: '💤' },
    returning: { color: '#8b5cf6', label: 'Returning', icon: '🔄' },
  };

  const pieData = overview ? Object.entries(overview.segments).map(([segment, data]) => ({
    name: segmentConfig[segment]?.label || segment,
    value: data.count,
    color: segmentConfig[segment]?.color || '#888',
  })) : [];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              User Segmentation
            </h3>
            <p className="text-sm text-muted-foreground">
              User classification and targeted engagement
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendReEngagementMutation.mutate()}
              disabled={sendReEngagementMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Re-engage At-Risk
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendChurnedMutation.mutate()}
              disabled={sendChurnedMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Win-Back Churned
            </Button>
            <Button
              size="sm"
              onClick={() => refreshSegmentsMutation.mutate()}
              disabled={refreshSegmentsMutation.isPending}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Segments
            </Button>
          </div>
        </div>

        {/* Overview */}
        {overviewLoading ? (
          <p className="text-sm text-muted-foreground">Loading overview...</p>
        ) : overview && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <h4 className="font-semibold mb-4">Segment Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Segment Buttons */}
            <div>
              <h4 className="font-semibold mb-4">View Segment Details</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(overview.segments).map(([segment, data]) => (
                  <Button
                    key={segment}
                    variant={selectedSegment === segment ? "default" : "outline"}
                    onClick={() => setSelectedSegment(segment)}
                    className="justify-start"
                  >
                    <span className="mr-2">{segmentConfig[segment]?.icon}</span>
                    <div className="text-left flex-1">
                      <div className="font-semibold">{segmentConfig[segment]?.label}</div>
                      <div className="text-xs opacity-70">
                        {data.count} users ({data.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Segment Users */}
      {selectedSegment && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <span>{segmentConfig[selectedSegment]?.icon}</span>
            {segmentConfig[selectedSegment]?.label} Users
          </h4>

          {segmentUsersLoading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : segmentUsers && segmentUsers.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {segmentUsers.map((user) => (
                <div key={user.id} className="p-4 bg-muted/30 rounded-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{user.username || 'Anonymous'}</p>
                      <div className="flex flex-wrap gap-2 text-xs mt-2">
                        <Badge variant="outline">
                          LTV: ${parseFloat(user.lifetimeValue).toFixed(2)}
                        </Badge>
                        <Badge variant="outline">
                          Sessions: {user.totalSessions}
                        </Badge>
                        <Badge variant="outline">
                          Last Active: {user.daysSinceLastActive}d ago
                        </Badge>
                        {user.retentionD7 && (
                          <Badge className="bg-matrix-green text-black text-xs">
                            D7 Retained
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No users in this segment</p>
          )}
        </Card>
      )}

      {/* Targeted Offers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-500" />
              Targeted Offers
            </h4>
            <p className="text-sm text-muted-foreground">
              Create segment-specific promotions and rewards
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateOffer(!showCreateOffer)}
            variant={showCreateOffer ? "outline" : "default"}
          >
            <Plus className="w-4 h-4 mr-2" />
            {showCreateOffer ? "Cancel" : "New Offer"}
          </Button>
        </div>

        {showCreateOffer && (
          <div className="mb-6 p-4 bg-muted/30 rounded-md space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetSegment">Target Segment</Label>
                <select
                  id="targetSegment"
                  value={offerForm.targetSegment}
                  onChange={(e) => setOfferForm({ ...offerForm, targetSegment: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="whale">Whale</option>
                  <option value="dolphin">Dolphin</option>
                  <option value="minnow">Minnow</option>
                  <option value="new_user">New User</option>
                  <option value="active">Active</option>
                  <option value="at_risk">At Risk</option>
                  <option value="churned">Churned</option>
                  <option value="returning">Returning</option>
                </select>
              </div>

              <div>
                <Label htmlFor="offerType">Offer Type</Label>
                <select
                  id="offerType"
                  value={offerForm.offerType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setOfferForm({
                      ...offerForm,
                      offerType: newType,
                      offerData: getOfferTypeTemplate(newType),
                    });
                  }}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="promo_code">Promo Code</option>
                  <option value="flash_sale">Flash Sale</option>
                  <option value="bonus_cs">Bonus CS</option>
                  <option value="exclusive_equipment">Exclusive Equipment</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="offerData">Offer Configuration (JSON)</Label>
              <textarea
                id="offerData"
                value={offerForm.offerData}
                onChange={(e) => setOfferForm({ ...offerForm, offerData: e.target.value })}
                placeholder='{"code": "WHALE50", "description": "Special offer"}'
                className="mt-1 w-full h-24 px-3 py-2 rounded-md border border-input bg-background font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  value={offerForm.validFrom}
                  onChange={(e) => setOfferForm({ ...offerForm, validFrom: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                <Input
                  id="validUntil"
                  type="datetime-local"
                  value={offerForm.validUntil}
                  onChange={(e) => setOfferForm({ ...offerForm, validUntil: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleOfferSubmit}
                disabled={createOfferMutation.isPending || updateOfferMutation.isPending}
              >
                {editingOfferId ? "Update" : "Create"} Offer
              </Button>
              <Button variant="outline" onClick={cancelOfferEdit}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Offers List */}
        {offersLoading ? (
          <p className="text-sm text-muted-foreground">Loading offers...</p>
        ) : offers && offers.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {offers.map((offer) => {
              const isExpired = offer.validUntil && new Date(offer.validUntil) < new Date();
              const isActive = offer.isActive && !isExpired;

              return (
                <div
                  key={offer.id}
                  className={`p-4 rounded-md ${
                    isActive ? 'bg-matrix-green/10 border border-matrix-green/30' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs`} style={{ backgroundColor: segmentConfig[offer.targetSegment]?.color }}>
                          {segmentConfig[offer.targetSegment]?.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {offer.offerType.replace(/_/g, ' ')}
                        </Badge>
                        {isActive ? (
                          <Badge className="text-xs bg-matrix-green text-black">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {isExpired ? 'Expired' : 'Inactive'}
                          </Badge>
                        )}
                      </div>
                      <pre className="text-xs bg-black/20 p-2 rounded overflow-x-auto mb-2">
                        {JSON.stringify(JSON.parse(offer.offerData), null, 2)}
                      </pre>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>From: {new Date(offer.validFrom).toLocaleDateString()}</span>
                        {offer.validUntil && (
                          <span>Until: {new Date(offer.validUntil).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditOffer(offer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteOfferMutation.mutate(offer.id)}
                        disabled={deleteOfferMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No targeted offers yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create segment-specific offers to engage users
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
