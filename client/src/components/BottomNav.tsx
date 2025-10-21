import { Link, useLocation } from "wouter";
import { LayoutDashboard, ShoppingBag, Wallet, Package, Blocks, Users, Target, Trophy, Palette, Disc3 } from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Rigs", url: "/rigs", icon: Package },
  { title: "Shop", url: "/shop", icon: ShoppingBag },
  { title: "Challenges", url: "/challenges", icon: Target },
  { title: "Achievements", url: "/achievements", icon: Trophy },
  { title: "Cosmetics", url: "/cosmetics", icon: Palette },
  { title: "Spin", url: "/spin", icon: Disc3 },
  { title: "Blocks", url: "/blocks", icon: Blocks },
  { title: "Referrals", url: "/referrals", icon: Users },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center h-16 overflow-x-auto scrollbar-hide px-2 gap-1">
        {navItems.map((item) => {
          const isActive = location === item.url;
          return (
            <Link
              key={item.url}
              href={item.url}
              data-testid={`nav-${item.title.toLowerCase()}`}
            >
              <button
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 min-h-[56px] min-w-[60px] transition-colors ${
                  isActive ? "text-matrix-green" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-[9px] font-medium leading-tight text-center whitespace-nowrap">{item.title}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
