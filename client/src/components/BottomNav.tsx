import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Package,
  MoreHorizontal,
  Crown,
  Gift,
  Trophy,
  Users,
  Shield,
  X,
  Settings
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCurrentUserId } from "@/lib/user";
import { isFeatureNew, markFeatureAsSeen } from "@/lib/featureBadges";
import type { User } from "@shared/schema";

// Primary navigation items (always visible)
const primaryNavItems = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Rigs", url: "/rigs", icon: Package },
  { title: "Shop", url: "/shop", icon: ShoppingBag },
  { title: "Wallet", url: "/wallet", icon: Wallet },
];

// Secondary navigation items (in "More" menu)
// Items are filtered based on user role and state
const getSecondaryNavItems = (user: User | null | undefined) => {
  const items = [];
  
  // Premium Packs - only show if user doesn't have premium
  if (!user?.hasPremium) {
    items.push({ 
      title: "Premium Packs", 
      url: "/packs", 
      icon: Gift, 
      badge: isFeatureNew("premiumPacks") ? "NEW" : undefined,
      featureName: "premiumPacks"
    });
  }
  
  // Subscription - only show if user doesn't have active subscription
  if (!user?.hasActiveSubscription) {
    items.push({ 
      title: "Subscription", 
      url: "/subscription", 
      icon: Crown, 
      badge: isFeatureNew("subscription") ? "NEW" : undefined,
      featureName: "subscription"
    });
  }
  
  // Always show these essential items
  items.push(
    { title: "Referrals", url: "/referrals", icon: Users },
    { title: "Achievements", url: "/achievements", icon: Trophy },
    { title: "Settings", url: "/settings", icon: Settings }
  );
  
  // Admin Panel - only show if user is admin or moderator
  if (user?.role === 'admin' || user?.role === 'moderator') {
    items.push({ title: "Admin Panel", url: "/admin", icon: Shield });
  }
  
  return items;
};

export default function BottomNav() {
  const [location] = useLocation();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const userId = getCurrentUserId();

  // Fetch user data to determine which menu items to show
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  const secondaryNavItems = getSecondaryNavItems(user);

  // Check if current location is in secondary nav
  const isSecondaryActive = secondaryNavItems.some(item => location === item.url);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-matrix-green/30 safe-area-bottom shadow-[0_-4px_20px_rgba(0,255,65,0.15)]">
      {/* Scanline effect overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,rgba(0,255,65,0.03)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
      
      <div className="flex items-center justify-around h-16 px-2 relative z-10">
        {/* Primary Nav Items */}
        {primaryNavItems.map((item) => {
          const isActive = location === item.url;
          return (
            <Link
              key={item.url}
              href={item.url}
              data-testid={`nav-${item.title.toLowerCase()}`}
            >
              <button
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] transition-all relative group ${
                  isActive
                    ? "text-matrix-green scale-105"
                    : "text-muted-foreground hover:text-matrix-green/70"
                }`}
              >
                {/* Glow effect for active items */}
                {isActive && (
                  <div className="absolute inset-0 bg-matrix-green/10 rounded-lg blur-sm animate-pulse"></div>
                )}
                
                <item.icon className={`w-5 h-5 relative z-10 transition-all ${
                  isActive 
                    ? "stroke-[2.5] drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]" 
                    : "group-hover:scale-110"
                }`} />
                
                <span className={`text-[10px] font-medium relative z-10 ${
                  isActive ? "font-bold" : ""
                }`}>
                  {item.title}
                </span>
                
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-matrix-green to-transparent"></div>
                )}
              </button>
            </Link>
          );
        })}

        {/* More Menu */}
        <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
          <SheetTrigger asChild>
            <button
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] transition-all relative group ${
                isSecondaryActive
                  ? "text-matrix-green scale-105"
                  : "text-muted-foreground hover:text-matrix-green/70"
              }`}
              data-testid="nav-more"
            >
              {/* Glow effect for active state */}
              {isSecondaryActive && (
                <div className="absolute inset-0 bg-matrix-green/10 rounded-lg blur-sm animate-pulse"></div>
              )}
              
              <MoreHorizontal className={`w-5 h-5 relative z-10 transition-all ${
                isSecondaryActive 
                  ? "stroke-[2.5] drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]" 
                  : "group-hover:scale-110"
              }`} />
              
              <span className={`text-[10px] font-medium relative z-10 ${
                isSecondaryActive ? "font-bold" : ""
              }`}>
                More
              </span>
              
              {/* Active indicator dot */}
              {isSecondaryActive && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-matrix-green rounded-full animate-ping"></span>
              )}
              
              {/* Active indicator line */}
              {isSecondaryActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-matrix-green to-transparent"></div>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0 bg-black/95 backdrop-blur-lg border-t border-matrix-green/30">
            {/* Scanline effect on sheet */}
            <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,rgba(0,255,65,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
            
            <SheetHeader className="p-4 border-b border-matrix-green/20 relative z-10">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-matrix-green">All Features</SheetTitle>
                <button
                  onClick={() => setMoreMenuOpen(false)}
                  className="p-2 hover:bg-matrix-green/10 rounded-md transition-all border border-transparent hover:border-matrix-green/30"
                >
                  <X className="w-5 h-5 text-matrix-green" />
                </button>
              </div>
            </SheetHeader>
            <ScrollArea className="h-[calc(80vh-73px)]">
              <div className="grid grid-cols-2 gap-3 p-4 relative z-10">
                {secondaryNavItems.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <Link
                      key={item.url}
                      href={item.url}
                      onClick={() => {
                        // Mark feature as seen when clicked
                        if (item.featureName) {
                          markFeatureAsSeen(item.featureName);
                        }
                        setMoreMenuOpen(false);
                      }}
                    >
                      <button
                        className={`w-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all relative group ${
                          isActive
                            ? "bg-matrix-green/10 border-matrix-green text-matrix-green shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                            : "bg-card/50 border-border hover:bg-matrix-green/5 hover:border-matrix-green/30"
                        }`}
                      >
                        {item.badge && (
                          <span className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 bg-neon-orange text-black rounded-md shadow-[0_0_10px_rgba(255,165,0,0.5)] animate-pulse">
                            {item.badge}
                          </span>
                        )}
                        <item.icon className={`w-6 h-6 transition-all ${
                          isActive ? "drop-shadow-[0_0_6px_rgba(0,255,65,0.8)]" : "group-hover:scale-110"
                        }`} />
                        <span className="text-xs font-medium text-center">{item.title}</span>
                      </button>
                    </Link>
                  );
                })}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
