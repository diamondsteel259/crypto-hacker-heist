import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Edit, Trash2, Play, StopCircle } from "lucide-react";
import { getTelegramInitData } from "@/lib/user";
import { queryClient } from "@/lib/queryClient";

interface ScheduledEvent {
  id: number;
  name: string;
  eventType: string;
  eventData: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isRecurring: boolean;
  createdAt: string;
}

export default function EventsAdmin() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    eventType: "multiplier",
    eventData: "",
    startTime: "",
    endTime: "",
    isRecurring: false,
  });

  const { data: events, isLoading } = useQuery<ScheduledEvent[]>({
    queryKey: ['/api/admin/events'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/events', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const payload = {
        name: data.name,
        eventType: data.eventType,
        eventData: data.eventData,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        isRecurring: data.isRecurring,
      };

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create event');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      setFormData({ name: "", eventType: "multiplier", eventData: "", startTime: "", endTime: "", isRecurring: false });
      setShowCreateForm(false);
      setEditingId(null);
      toast({
        title: "Event Created",
        description: "The event has been scheduled successfully",
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

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const payload: any = { ...data };
      if (data.startTime) {
        payload.startTime = new Date(data.startTime).toISOString();
      }
      if (data.endTime) {
        payload.endTime = new Date(data.endTime).toISOString();
      }

      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      setFormData({ name: "", eventType: "multiplier", eventData: "", startTime: "", endTime: "", isRecurring: false });
      setEditingId(null);
      toast({
        title: "Event Updated",
        description: "The event has been updated successfully",
      });
    },
  });

  const activateEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/events/${id}/activate`, {
        method: 'POST',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to activate event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      toast({
        title: "Event Activated",
        description: "The event has been started",
      });
    },
  });

  const endEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/events/${id}/end`, {
        method: 'POST',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to end event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      toast({
        title: "Event Ended",
        description: "The event has been stopped",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to delete event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
      toast({
        title: "Event Deleted",
        description: "The event has been removed",
      });
    },
  });

  const getEventTypeTemplate = (type: string) => {
    const templates: Record<string, string> = {
      multiplier: '{"multiplier": 2.0, "description": "Double mining rewards!"}',
      flash_sale: '{"discount": 50, "itemType": "powerup", "description": "50% off all powerups!"}',
      community_goal: '{"targetCS": 1000000, "rewardPerUser": 1000, "description": "Mine 1M CS together!"}',
      tournament: '{"topN": 10, "rewards": [10000, 5000, 2500], "description": "Top miners win big!"}',
      custom: '{"message": "Special event!", "bonus": "Something cool"}',
    };
    return templates[type] || '{}';
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.startTime || !formData.endTime) {
      toast({
        title: "Validation Error",
        description: "Name, start time, and end time are required",
        variant: "destructive",
      });
      return;
    }

    // Validate JSON
    try {
      JSON.parse(formData.eventData || '{}');
    } catch (e) {
      toast({
        title: "Validation Error",
        description: "Event data must be valid JSON",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updateEventMutation.mutate({ id: editingId, data: formData });
    } else {
      createEventMutation.mutate(formData);
    }
  };

  const startEdit = (event: ScheduledEvent) => {
    setEditingId(event.id);
    setFormData({
      name: event.name,
      eventType: event.eventType,
      eventData: event.eventData,
      startTime: new Date(event.startTime).toISOString().slice(0, 16),
      endTime: new Date(event.endTime).toISOString().slice(0, 16),
      isRecurring: event.isRecurring,
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", eventType: "multiplier", eventData: "", startTime: "", endTime: "", isRecurring: false });
    setShowCreateForm(false);
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      multiplier: "Multiplier",
      flash_sale: "Flash Sale",
      community_goal: "Community Goal",
      tournament: "Tournament",
      custom: "Custom",
    };
    return labels[type] || type;
  };

  const getEventTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      multiplier: "bg-purple-500 text-white",
      flash_sale: "bg-yellow-500 text-black",
      community_goal: "bg-blue-500 text-white",
      tournament: "bg-red-500 text-white",
      custom: "bg-gray-500 text-white",
    };
    return colors[type] || "bg-gray-500";
  };

  const activeEvents = events?.filter(e => e.isActive) || [];
  const upcomingEvents = events?.filter(e => !e.isActive && new Date(e.startTime) > new Date()) || [];
  const pastEvents = events?.filter(e => !e.isActive && new Date(e.endTime) < new Date()) || [];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Event Scheduler
          </h3>
          <p className="text-sm text-muted-foreground">
            Automated limited-time events with rewards
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          size="sm"
          variant={showCreateForm ? "outline" : "default"}
        >
          <Plus className="w-4 h-4 mr-2" />
          {showCreateForm ? "Cancel" : "New Event"}
        </Button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-4 bg-muted/30 rounded-md space-y-4">
          <div>
            <Label htmlFor="name">Event Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Double Mining Weekend"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="eventType">Event Type</Label>
            <select
              id="eventType"
              value={formData.eventType}
              onChange={(e) => {
                const newType = e.target.value;
                setFormData({
                  ...formData,
                  eventType: newType,
                  eventData: getEventTypeTemplate(newType),
                });
              }}
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="multiplier">Multiplier (Mining Boost)</option>
              <option value="flash_sale">Flash Sale (Shop Discount)</option>
              <option value="community_goal">Community Goal</option>
              <option value="tournament">Tournament (Leaderboard)</option>
              <option value="custom">Custom Event</option>
            </select>
          </div>

          <div>
            <Label htmlFor="eventData">Event Configuration (JSON)</Label>
            <textarea
              id="eventData"
              value={formData.eventData}
              onChange={(e) => setFormData({ ...formData, eventData: e.target.value })}
              placeholder='{"multiplier": 2.0, "description": "Double rewards!"}'
              className="mt-1 w-full h-32 px-3 py-2 rounded-md border border-input bg-background font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="isRecurring" className="font-normal cursor-pointer">
              Recurring Event (repeats automatically)
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={createEventMutation.isPending || updateEventMutation.isPending}
            >
              {editingId ? "Update" : "Create"} Event
            </Button>
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Active Now ({activeEvents.length})
            </h4>
            <div className="space-y-2">
              {activeEvents.map((event) => (
                <div key={event.id} className="p-4 bg-matrix-green/10 border border-matrix-green/30 rounded-md">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{event.name}</p>
                        <Badge className={`text-xs ${getEventTypeBadgeColor(event.eventType)}`}>
                          {getEventTypeLabel(event.eventType)}
                        </Badge>
                        <Badge className="text-xs bg-matrix-green text-black">Active</Badge>
                        {event.isRecurring && <Badge variant="outline" className="text-xs">Recurring</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Ends: {new Date(event.endTime).toLocaleString()}
                      </p>
                      <pre className="text-xs bg-black/20 p-2 rounded overflow-x-auto">
                        {JSON.stringify(JSON.parse(event.eventData), null, 2)}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => endEventMutation.mutate(event.id)}
                        disabled={endEventMutation.isPending}
                      >
                        <StopCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Upcoming ({upcomingEvents.length})
            </h4>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{event.name}</p>
                        <Badge className={`text-xs ${getEventTypeBadgeColor(event.eventType)}`}>
                          {getEventTypeLabel(event.eventType)}
                        </Badge>
                        {event.isRecurring && <Badge variant="outline" className="text-xs">Recurring</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Starts: {new Date(event.startTime).toLocaleString()}
                        <br />
                        Ends: {new Date(event.endTime).toLocaleString()}
                      </p>
                      <pre className="text-xs bg-black/20 p-2 rounded overflow-x-auto">
                        {JSON.stringify(JSON.parse(event.eventData), null, 2)}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => activateEventMutation.mutate(event.id)}
                        disabled={activateEventMutation.isPending}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(event)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteEventMutation.mutate(event.id)}
                        disabled={deleteEventMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Past Events ({pastEvents.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pastEvents.map((event) => (
                <div key={event.id} className="p-4 bg-muted/30 rounded-md opacity-60">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{event.name}</p>
                        <Badge className={`text-xs ${getEventTypeBadgeColor(event.eventType)}`}>
                          {getEventTypeLabel(event.eventType)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">Ended</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.startTime).toLocaleDateString()} - {new Date(event.endTime).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteEventMutation.mutate(event.id)}
                      disabled={deleteEventMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading events...</p>
        )}

        {!isLoading && events?.length === 0 && (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No events scheduled</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first event to engage users
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
