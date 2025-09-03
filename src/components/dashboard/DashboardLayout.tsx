import { useState } from "react";
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  Truck, 
  Settings,
  Bell,
  Search,
  Menu,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { icon: Home, label: "الرئيسية", href: "/", active: true },
  { icon: BarChart3, label: "التحليلات", href: "/analytics" },
  { icon: Users, label: "المستخدمين", href: "/users" },
  { icon: Truck, label: "الموصلين", href: "/drivers" },
  { icon: ShoppingCart, label: "الطلبات", href: "/orders" },
  { icon: Package, label: "المنتجات", href: "/products" },
  { icon: Settings, label: "الإعدادات", href: "/settings" },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out",
          "bg-gradient-sidebar border-l border-sidebar-border",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary"></div>
              <span className="text-xl font-bold text-sidebar-foreground">
                Candy Admin
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                variant={item.active ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground",
                  item.active 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90" 
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:mr-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-6 shadow-card">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="البحث..."
                className="pr-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -left-1 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-primary"></div>
              <span className="text-sm font-medium">المدير</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}