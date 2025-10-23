import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Eye,
  Shield,
  ExternalLink,
  Calendar,
  Hash,
  LogOut
} from "lucide-react";
import { initializeUser } from "@/lib/user";
import type { User as UserType } from "@shared/schema";

export default function Settings() {
  const [userId, setUserId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    initializeUser()
      .then(setUserId)
      .catch(err => console.error('Failed to initialize user:', err));

    // Load settings from localStorage
    const savedNotifications = localStorage.getItem('notifications');
    const savedSound = localStorage.getItem('sound');
    const savedAnimations = localStorage.getItem('animations');

    if (savedNotifications !== null) setNotificationsEnabled(savedNotifications === 'true');
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    if (savedAnimations !== null) setAnimationsEnabled(savedAnimations === 'true');
  }, []);

  const { data: user } = useQuery<UserType>({
    queryKey: ['/api/user', userId],
    enabled: !!userId,
  });

  const handleNotificationToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('notifications', enabled.toString());
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('sound', enabled.toString());
  };

  const handleAnimationsToggle = (enabled: boolean) => {
    setAnimationsEnabled(enabled);
    localStorage.setItem('animations', enabled.toString());
  };

  const handleLogout = () => {
    // Clear user data and reload
    localStorage.clear();
    window.location.href = '/';
  };

  const handleOpenTelegram = () => {
    const telegramUrl = `https://t.me/${user?.username || 'telegram'}`;
    window.open(telegramUrl, '_blank');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-3">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <p className="text-muted-foreground">Loading settings...</p>
          </Card>
        </div>
      </div>
    );
  }

  const memberSince = new Date(user.createdAt);
  const daysPlaying = Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Customize Your Experience
            </p>
          </div>
        </div>

        {/* Account Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-cyber-blue" />
            <h2 className="text-lg font-semibold">Account Information</h2>
          </div>

          <div className="space-y-4">
            {/* Profile */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.username}
                  className="w-16 h-16 rounded-full border-2 border-cyber-blue"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyber-blue to-neon-purple flex items-center justify-center text-2xl font-bold">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold">{user.username}</p>
                  {user.isAdmin && (
                    <Badge className="bg-destructive text-white">Admin</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOpenTelegram}
                    className="text-xs"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open in Telegram
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-matrix-green" />
                  <p className="text-xs text-muted-foreground uppercase">Member Since</p>
                </div>
                <p className="text-sm font-bold">
                  {memberSince.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {daysPlaying} days playing
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4 text-cyber-blue" />
                  <p className="text-xs text-muted-foreground uppercase">User ID</p>
                </div>
                <p className="text-xs font-mono break-all">
                  {user.id.slice(0, 24)}...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Telegram: {user.telegramId}
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-neon-orange" />
                  <p className="text-xs text-muted-foreground uppercase">Referral Code</p>
                </div>
                <p className="text-sm font-mono font-bold text-matrix-green">
                  {user.referralCode}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Share with friends
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-purple-500" />
                  <p className="text-xs text-muted-foreground uppercase">Tutorial</p>
                </div>
                <Badge variant={user.tutorialCompleted ? "default" : "secondary"}>
                  {user.tutorialCompleted ? "Completed" : "Not Completed"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Preferences</h2>
          </div>

          <div className="space-y-4">
            {/* Notifications */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-4 h-4" />
                  <Label htmlFor="notifications" className="font-medium cursor-pointer">
                    Push Notifications
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive alerts for mining rewards and events
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={handleNotificationToggle}
              />
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-4 h-4" />
                  <Label htmlFor="sound" className="font-medium cursor-pointer">
                    Sound Effects
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Play sounds for actions and rewards
                </p>
              </div>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={handleSoundToggle}
              />
            </div>

            {/* Animations */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4" />
                  <Label htmlFor="animations" className="font-medium cursor-pointer">
                    Animations
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enable visual effects and transitions
                </p>
              </div>
              <Switch
                id="animations"
                checked={animationsEnabled}
                onCheckedChange={handleAnimationsToggle}
              />
            </div>
          </div>
        </Card>

        {/* Links */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">About</h2>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => window.location.href = '/terms'}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Terms of Service
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => window.location.href = '/privacy'}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Privacy Policy
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => window.open('https://t.me/cryptohackerheist', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Join Community
            </Button>
          </div>
        </Card>

        {/* Logout */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-destructive">Logout</h3>
              <p className="text-xs text-muted-foreground">
                Clear your session and return to login
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </Card>

        {/* Version Info */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Crypto Hacker Heist v1.0.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Built with 💎 by the community
          </p>
        </div>
      </div>
    </div>
  );
}
