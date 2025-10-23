import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Plus, Edit, Trash2, Send } from "lucide-react";
import { getTelegramInitData } from "@/lib/user";
import { queryClient } from "@/lib/queryClient";

interface Announcement {
  id: number;
  title: string;
  message: string;
  targetAudience: string;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
  createdBy: string;
}

export default function AnnouncementsAdmin() {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetAudience: "all",
    scheduledFor: "",
  });

  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/admin/announcements'],
    queryFn: async () => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch('/api/admin/announcements', {
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to fetch announcements');
      return response.json();
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const payload: any = {
        title: data.title,
        message: data.message,
        targetAudience: data.targetAudience,
      };

      if (data.scheduledFor) {
        payload.scheduledFor = new Date(data.scheduledFor).toISOString();
      }

      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create announcement');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
      setFormData({ title: "", message: "", targetAudience: "all", scheduledFor: "" });
      setShowCreateForm(false);
      setEditingId(null);
      toast({
        title: "Announcement Created",
        description: "The announcement has been created successfully",
      });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const payload: any = { ...data };
      if (data.scheduledFor) {
        payload.scheduledFor = new Date(data.scheduledFor).toISOString();
      }

      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update announcement');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
      setFormData({ title: "", message: "", targetAudience: "all", scheduledFor: "" });
      setEditingId(null);
      toast({
        title: "Announcement Updated",
        description: "The announcement has been updated successfully",
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: number) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to delete announcement');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
      toast({
        title: "Announcement Deleted",
        description: "The announcement has been removed",
      });
    },
  });

  const sendNowMutation = useMutation({
    mutationFn: async (id: number) => {
      const initData = getTelegramInitData();
      if (!initData) throw new Error('Not authenticated');

      const response = await fetch(`/api/admin/announcements/${id}/send-now`, {
        method: 'POST',
        headers: { 'X-Telegram-Init-Data': initData },
      });
      if (!response.ok) throw new Error('Failed to send announcement');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/announcements'] });
      toast({
        title: "Announcement Sent",
        description: "The announcement is being sent to users",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.message) {
      toast({
        title: "Validation Error",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updateAnnouncementMutation.mutate({ id: editingId, data: formData });
    } else {
      createAnnouncementMutation.mutate(formData);
    }
  };

  const startEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      targetAudience: announcement.targetAudience,
      scheduledFor: announcement.scheduledFor ? new Date(announcement.scheduledFor).toISOString().slice(0, 16) : "",
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", message: "", targetAudience: "all", scheduledFor: "" });
    setShowCreateForm(false);
  };

  const pending = announcements?.filter(a => !a.sentAt) || [];
  const sent = announcements?.filter(a => a.sentAt) || [];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-500" />
            Announcements Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Broadcast messages to all users or specific audiences
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          size="sm"
          variant={showCreateForm ? "outline" : "default"}
        >
          <Plus className="w-4 h-4 mr-2" />
          {showCreateForm ? "Cancel" : "New Announcement"}
        </Button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-4 bg-muted/30 rounded-md space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Announcement title..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Announcement message..."
              className="mt-1 w-full h-24 px-3 py-2 rounded-md border border-input bg-background"
            />
          </div>

          <div>
            <Label htmlFor="targetAudience">Target Audience</Label>
            <select
              id="targetAudience"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="all">All Users</option>
              <option value="premium">Premium Users</option>
              <option value="new">New Users (< 7 days)</option>
              <option value="active">Active Users</option>
            </select>
          </div>

          <div>
            <Label htmlFor="scheduledFor">Schedule For (Optional)</Label>
            <Input
              id="scheduledFor"
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to send immediately
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending}
            >
              {editingId ? "Update" : "Create"} Announcement
            </Button>
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Pending Announcements */}
        {pending.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Pending ({pending.length})
            </h4>
            <div className="space-y-2">
              {pending.map((announcement) => (
                <div key={announcement.id} className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{announcement.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {announcement.targetAudience}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {announcement.message}
                      </p>
                      {announcement.scheduledFor && (
                        <p className="text-xs text-yellow-600 mt-2">
                          Scheduled: {new Date(announcement.scheduledFor).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendNowMutation.mutate(announcement.id)}
                        disabled={sendNowMutation.isPending}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(announcement)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                        disabled={deleteAnnouncementMutation.isPending}
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

        {/* Sent Announcements */}
        {sent.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Sent ({sent.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sent.map((announcement) => (
                <div key={announcement.id} className="p-4 bg-muted/30 rounded-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{announcement.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {announcement.targetAudience}
                        </Badge>
                        <Badge className="text-xs bg-matrix-green text-black">Sent</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {announcement.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Sent: {new Date(announcement.sentAt!).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                      disabled={deleteAnnouncementMutation.isPending}
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
          <p className="text-sm text-muted-foreground">Loading announcements...</p>
        )}

        {!isLoading && announcements?.length === 0 && (
          <div className="p-8 text-center">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No announcements yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first announcement to broadcast to users
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
