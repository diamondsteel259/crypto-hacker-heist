import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, ShoppingBag, Users, Terminal, Gem, Wallet, Blocks, Package, Shield } from "lucide-react";
import { getCurrentUserId } from "@/lib/user";
import type { User } from "@shared/schema";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Wallet",
    url: "/wallet",
    icon: Wallet,
  },
  {
    title: "Rigs",
    url: "/rigs",
    icon: Package,
  },
  {
    title: "Shop",
    url: "/shop",
    icon: ShoppingBag,
  },
  {
    title: "Block Explorer",
    url: "/blocks",
    icon: Blocks,
  },
  {
    title: "Referrals",
    url: "/referrals",
    icon: Users,
  },
];

export default function AppSidebar() {
  const [location] = useLocation();
  const userId = getCurrentUserId();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user', userId],
    enabled: !!userId,
  });

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-matrix-green/20 flex items-center justify-center">
            <Terminal className="w-5 h-5 text-matrix-green" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Crypto Hacker</h2>
            <p className="text-xs text-muted-foreground">Heist</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase()}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {user?.isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location === "/admin"}>
                    <Link href="/admin" data-testid="link-admin">
                      <Shield className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your Balance</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gem className="w-4 h-4 text-matrix-green" />
                  <span className="text-sm text-muted-foreground">Cipher Shards</span>
                </div>
              </div>
              <p className="text-xl font-bold font-mono text-matrix-green">45,280</p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="p-3 rounded-md bg-muted/30 border border-border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Phase</span>
            <Badge variant="outline" className="text-xs">
              1 of 3
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Pre-Airdrop Mining
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
