import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Bell,
  Users,
  Store,
  Package,
  BarChart3,
  Menu,
  LogOut
} from 'lucide-react'

const navigation = [
  { name: 'الرئيسية', href: '/', icon: LayoutDashboard },
  { name: 'الطلبات', href: '/orders', icon: ShoppingCart },
  { name: 'التوصيل', href: '/delivery', icon: Truck },
  { name: 'الإشعارات والإعلانات', href: '/notifications', icon: Bell },
  { name: 'العملاء', href: '/customers', icon: Users },
  { name: 'التجار', href: '/merchants', icon: Store },
  { name: 'المنتجات', href: '/products', icon: Package },
  { name: 'التقارير', href: '/reports', icon: BarChart3 },
]

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="p-0 w-64">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">لوحة التحكم</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-start gap-2 h-12"
                    onClick={() => {
                      navigate(item.href)
                      setSidebarOpen(false)
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Button>
                )
              })}
            </nav>
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 h-12"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-l">
        <div className="flex flex-col h-full bg-card">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-sm text-muted-foreground mt-1">
              نظام إدارة التوصيل
            </p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant={isActive ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Button>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">مسؤول النظام</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-card border-b p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">لوحة التحكم</h1>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}