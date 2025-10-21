import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Trash2, ShoppingCart, Check } from "lucide-react";
import { getCurrentUserId } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface PriceAlert {
  id: number;
  userId: string;
  equipmentTypeId: string;
  targetPrice: number;
  triggered: boolean;
  triggeredAt: string | null;
  createdAt: string;
  equipment: {
    id: string;
    name: string;
    basePrice: number;
    tier: string;
  };
  canAfford: boolean;
}

interface PriceAlertsCheckResponse {
  triggered: boolean;
  alerts: PriceAlert[];
}

export default function PriceAlerts() {
  const userId = getCurrentUserId();
  const { toast } = useToast();

  const { data: alerts = [], isLoading } = useQuery<PriceAlert[]>({
    queryKey: ["/api/user", userId, "price-alerts"],
    enabled: !!userId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Check for triggered alerts
  const { data: checkResult } = useQuery<PriceAlertsCheckResponse>({
    queryKey: ["/api/user", userId, "price-alerts", "check"],
    enabled: !!userId,
    refetchInterval: 60000, // Check every minute
  });

  // Show toast notifications when alerts trigger
  useEffect(() => {
    if (checkResult?.triggered && checkResult.alerts.length > 0) {
      checkResult.alerts.forEach((alert) => {
        toast({
          title: "Price Alert! 🔔",
          description: `You can now afford ${alert.equipment.name}!`,
          duration: 5000,
        });
      });

      // Refresh alerts list
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "price-alerts"] });
    }
  }, [checkResult, toast, userId]);

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const response = await apiRequest('DELETE', `/api/user/${userId}/price-alerts/${alertId}`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "price-alerts"] });
      toast({
        title: "Alert Deleted",
        description: data.message || "Price alert removed",
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

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-base">Price Alerts</h3>
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </Card>
    );
  }

  const activeAlerts = alerts.filter(a => !a.triggered);
  const affordableAlerts = activeAlerts.filter(a => a.canAfford);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-base">Price Alerts</h3>
        </div>
        <Badge variant={affordableAlerts.length > 0 ? "default" : "outline"} className="text-xs">
          {affordableAlerts.length} Ready
        </Badge>
      </div>

      {activeAlerts.length === 0 ? (
        <div className="text-center py-6">
          <BellOff className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground mb-2">
            No price alerts set
          </p>
          <p className="text-xs text-muted-foreground">
            Add alerts in the Shop to get notified when you can afford equipment
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border transition-all ${
                alert.canAfford
                  ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30'
                  : 'bg-background/50 border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm truncate">{alert.equipment.name}</p>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {alert.equipment.tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Target: {alert.targetPrice.toLocaleString()} CS
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 flex-shrink-0"
                  onClick={() => deleteAlertMutation.mutate(alert.id)}
                  disabled={deleteAlertMutation.isPending}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>

              {alert.canAfford && (
                <div className="flex items-center gap-1 text-xs font-semibold text-green-500 mt-2">
                  <Check className="w-3 h-3" />
                  <span>You can afford this now!</span>
                  <ShoppingCart className="w-3 h-3 ml-auto" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeAlerts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            Alerts check every minute for affordability
          </p>
        </div>
      )}
    </Card>
  );
}
