import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Package,
  MoreHorizontal,
  Crown,
  Gift,
  Target,
  Trophy,
  Palette,
  Disc3,
  Blocks,
  Users,
  BarChart3,
  Box,
  Shield,
  X
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

// Primary navigation items (always visible)
const primaryNavItems = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Rigs", url: "/rigs", icon: Package },
  { title: "Shop", url: "/shop", icon: ShoppingBag },
  { title: "Wallet", url: "/wallet", icon: Wallet },
];

// Secondary navigation items (in "More" menu)
const secondaryNavItems = [
  { title: "Premium Packs", url: "/packs", icon: Gift, badge: "NEW" },
  { title: "Subscription", url: "/subscription", icon: Crown, badge: "NEW" },
  { title: "Challenges", url: "/challenges", icon: Target },
  { title: "Achievements", url: "/achievements", icon: Trophy },
  { title: "Spin Wheel", url: "/spin", icon: Disc3 },
  { title: "Loot Boxes", url: "/lootboxes", icon: Box },
  { title: "Cosmetics", url: "/cosmetics", icon: Palette },
  { title: "Block Explorer", url: "/blocks", icon: Blocks },
  { title: "Referrals", url: "/referrals", icon: Users },
  { title: "Statistics", url: "/statistics", icon: BarChart3 },
  { title: "Admin Panel", url: "/admin", icon: Shield },
];

export default function BottomNav() {
  const [location] = useLocation();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Check if current location is in secondary nav
  const isSecondaryActive = secondaryNavItems.some(item => location === item.url);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
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
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] transition-all ${
                  isActive
                    ? "text-matrix-green scale-105"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-medium">{item.title}</span>
              </button>
            </Link>
          );
        })}

        {/* More Menu */}
        <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
          <SheetTrigger asChild>
            <button
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] transition-all relative ${
                isSecondaryActive
                  ? "text-matrix-green scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="nav-more"
            >
              <MoreHorizontal className={`w-5 h-5 ${isSecondaryActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-medium">More</span>
              {isSecondaryActive && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-matrix-green rounded-full"></span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0">
            <SheetHeader className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <SheetTitle>All Features</SheetTitle>
                <button
                  onClick={() => setMoreMenuOpen(false)}
                  className="p-2 hover:bg-muted rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </SheetHeader>
            <ScrollArea className="h-[calc(80vh-73px)]">
              <div className="grid grid-cols-2 gap-3 p-4">
                {secondaryNavItems.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <Link
                      key={item.url}
                      href={item.url}
                      onClick={() => setMoreMenuOpen(false)}
                    >
                      <button
                        className={`w-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all relative ${
                          isActive
                            ? "bg-matrix-green/10 border-matrix-green text-matrix-green"
                            : "bg-card border-border hover:bg-muted"
                        }`}
                      >
                        {item.badge && (
                          <span className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 bg-orange-500 text-white rounded-md">
                            {item.badge}
                          </span>
                        )}
                        <item.icon className="w-6 h-6" />
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
