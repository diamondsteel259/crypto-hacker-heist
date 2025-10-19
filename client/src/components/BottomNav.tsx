import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, ShoppingBag, Wallet, Package, Menu, Blocks, Users, Shield } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserId } from "@/lib/user";
import type { User } from "@shared/schema";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Rigs", url: "/rigs", icon: Package },
  { title: "Shop", url: "/shop", icon: ShoppingBag },
];

const moreNavItems = [
  { title: "Block Explorer", url: "/blocks", icon: Blocks },
  { title: "Referrals", url: "/referrals", icon: Users },
];

export default function BottomNav() {
  const [location] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const userId = getCurrentUserId();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user', userId],
    enabled: !!userId,
  });

  const handleNavClick = () => {
    setSheetOpen(false);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-14">
        {mainNavItems.map((item) => {
          const isActive = location === item.url;
          return (
            <Link
              key={item.url}
              href={item.url}
              data-testid={`nav-${item.title.toLowerCase()}`}
            >
              <button
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 min-h-[44px] transition-colors ${
                  isActive ? "text-matrix-green" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.title}</span>
              </button>
            </Link>
          );
        })}
        
        {/* More Menu */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 min-h-[44px] transition-colors text-muted-foreground"
              data-testid="nav-more"
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[80vh]">
            <SheetHeader>
              <SheetTitle className="text-left">More Options</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              {moreNavItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <Link key={item.url} href={item.url} onClick={handleNavClick}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-12"
                      data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Button>
                  </Link>
                );
              })}
              
              {user?.isAdmin && (
                <Link href="/admin" onClick={handleNavClick}>
                  <Button
                    variant={location === "/admin" ? "default" : "ghost"}
                    className="w-full justify-start gap-3 h-12"
                    data-testid="nav-admin"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin Panel</span>
                  </Button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
