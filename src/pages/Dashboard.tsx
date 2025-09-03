import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ordersService } from '@/lib/supabase-services'
import type { DashboardStats } from '@/types'
import {
  ShoppingCart,
  Clock,
  Truck,
  CheckCircle,
  DollarSign,
  Users,
  UserCheck,
  Timer,
  Store
} from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    activeDeliveries: 0,
    completedToday: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    totalCustomers: 0,
    averageDeliveryTime: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const data = await ordersService.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'إجمالي الطلبات',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'الطلبات المعلقة',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'التوصيلات النشطة',
      value: stats.activeDeliveries,
      icon: Truck,
      color: 'text-purple-600'
    },
    {
      title: 'مكتمل اليوم',
      value: stats.completedToday,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${stats.totalRevenue.toLocaleString()} ر.س`,
      icon: DollarSign,
      color: 'text-emerald-600'
    },
    {
      title: 'السائقون النشطون',
      value: stats.activeDrivers,
      icon: UserCheck,
      color: 'text-indigo-600'
    },
    {
      title: 'إجمالي العملاء',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-rose-600'
    },
    {
      title: 'متوسط وقت التوصيل',
      value: `${stats.averageDeliveryTime} دقيقة`,
      icon: Timer,
      color: 'text-amber-600'
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">الرئيسية</h1>
          <p className="text-muted-foreground mt-2">
            نظرة عامة على نشاط التوصيل اليوم
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">الرئيسية</h1>
        <p className="text-muted-foreground mt-2">
          نظرة عامة على نشاط التوصيل اليوم
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                <ShoppingCart className="h-6 w-6 text-primary mb-2" />
                <p className="text-sm font-medium">طلب جديد</p>
              </button>
              <button className="p-4 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">
                <UserCheck className="h-6 w-6 text-blue-600 mb-2" />
                <p className="text-sm font-medium">إضافة سائق</p>
              </button>
              <button className="p-4 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors">
                <Users className="h-6 w-6 text-green-600 mb-2" />
                <p className="text-sm font-medium">عميل جديد</p>
              </button>
              <button className="p-4 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors">
                <Store className="h-6 w-6 text-purple-600 mb-2" />
                <p className="text-sm font-medium">تاجر جديد</p>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">تم توصيل الطلب #1234</p>
                  <p className="text-xs text-muted-foreground">منذ 5 دقائق</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Truck className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">طلب جديد في الطريق #1235</p>
                  <p className="text-xs text-muted-foreground">منذ 12 دقيقة</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">طلب معلق يحتاج مراجعة #1233</p>
                  <p className="text-xs text-muted-foreground">منذ 25 دقيقة</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}