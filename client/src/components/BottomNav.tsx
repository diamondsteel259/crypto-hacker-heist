import { Link, useLocation } from "wouter";
import { LayoutDashboard, ShoppingBag, Wallet, Package } from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Rigs", url: "/rigs", icon: Package },
  { title: "Shop", url: "/shop", icon: ShoppingBag },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
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
      </div>
    </nav>
  );
}
