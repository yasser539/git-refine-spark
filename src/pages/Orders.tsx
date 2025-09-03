import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ordersService, deliveryCaptainsService } from '@/lib/supabase-services'
import { useToast } from '@/hooks/use-toast'
import type { Order, OrderFilters, DeliveryCaptain, OrderStatus } from '@/types'
import {
  Search,
  Filter,
  Eye,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react'

const statusConfig = {
  under_review: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  approved_searching_driver: { label: 'معتمد - البحث عن سائق', color: 'bg-blue-100 text-blue-800', icon: Search },
  pending: { label: 'قيد الانتظار', color: 'bg-orange-100 text-orange-800', icon: Clock },
  on_the_way: { label: 'في الطريق', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800', icon: XCircle }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [captains, setCaptains] = useState<DeliveryCaptain[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<OrderFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadOrders()
    loadCaptains()
  }, [filters])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await ordersService.getAllOrders(filters)
      setOrders(data)
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل الطلبات',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCaptains = async () => {
    try {
      const data = await deliveryCaptainsService.getAllDeliveryCaptains()
      setCaptains(data)
    } catch (error) {
      console.error('Error loading captains:', error)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersService.updateOrderStatus(orderId, newStatus)
      await loadOrders()
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث حالة الطلب'
      })
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحديث حالة الطلب',
        variant: 'destructive'
      })
    }
  }

  const handleAssignCaptain = async (orderId: string, captainId: string) => {
    try {
      await ordersService.assignDeliveryCaptain(orderId, captainId)
      await loadOrders()
      toast({
        title: 'تم بنجاح',
        description: 'تم تعيين السائق للطلب'
      })
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تعيين السائق',
        variant: 'destructive'
      })
    }
  }

  const filteredOrders = orders.filter(order => 
    !searchTerm || 
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const ordersByStatus = {
    under_review: filteredOrders.filter(o => o.status === 'under_review').length,
    approved_searching_driver: filteredOrders.filter(o => o.status === 'approved_searching_driver').length,
    pending: filteredOrders.filter(o => o.status === 'pending').length,
    on_the_way: filteredOrders.filter(o => o.status === 'on_the_way').length,
    delivered: filteredOrders.filter(o => o.status === 'delivered').length,
    cancelled: filteredOrders.filter(o => o.status === 'cancelled').length
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
        <p className="text-muted-foreground mt-2">
          متابعة وإدارة جميع طلبات التوصيل
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Object.entries(ordersByStatus).map(([status, count]) => {
          const config = statusConfig[status as OrderStatus]
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <config.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث برقم الطلب أو اسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              status: value === 'all' ? undefined : [value as OrderStatus] 
            }))}>
              <SelectTrigger>
                <SelectValue placeholder="حالة الطلب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => setFilters(prev => ({ 
              ...prev, 
              payment_method: value === 'all' ? undefined : [value as any] 
            }))}>
              <SelectTrigger>
                <SelectValue placeholder="طريقة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الطرق</SelectItem>
                <SelectItem value="cash">نقداً</SelectItem>
                <SelectItem value="card">بطاقة</SelectItem>
                <SelectItem value="online">أونلاين</SelectItem>
                <SelectItem value="wallet">محفظة</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({})
                setSearchTerm('')
              }}
            >
              مسح الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد طلبات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-4">رقم الطلب</th>
                    <th className="text-right p-4">العميل</th>
                    <th className="text-right p-4">المبلغ</th>
                    <th className="text-right p-4">الحالة</th>
                    <th className="text-right p-4">السائق</th>
                    <th className="text-right p-4">طريقة الدفع</th>
                    <th className="text-right p-4">التاريخ</th>
                    <th className="text-right p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{order.order_number}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{order.customer?.name}</p>
                          <p className="text-sm text-muted-foreground">{order.customer?.phone}</p>
                        </div>
                      </td>
                      <td className="p-4 font-semibold">{order.total_amount} ر.س</td>
                      <td className="p-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.status]?.color}`}>
                          {statusConfig[order.status]?.label}
                        </div>
                      </td>
                      <td className="p-4">
                        {order.delivery_captain ? (
                          <div>
                            <p className="font-medium">{order.delivery_captain.name}</p>
                            <p className="text-sm text-muted-foreground">{order.delivery_captain.phone}</p>
                          </div>
                        ) : order.status === 'approved_searching_driver' ? (
                          <Select onValueChange={(captainId) => handleAssignCaptain(order.id, captainId)}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="اختر سائق" />
                            </SelectTrigger>
                            <SelectContent>
                              {captains.filter(c => c.is_available).map((captain) => (
                                <SelectItem key={captain.id} value={captain.id}>
                                  {captain.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center px-2 py-1 border rounded-full text-xs font-medium">
                          {order.payment_method === 'cash' && 'نقداً'}
                          {order.payment_method === 'card' && 'بطاقة'}
                          {order.payment_method === 'online' && 'أونلاين'}
                          {order.payment_method === 'wallet' && 'محفظة'}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.approval_status === 'approved' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <Select onValueChange={(status) => handleStatusUpdate(order.id, status as OrderStatus)}>
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="تحديث" />
                              </SelectTrigger>
                              <SelectContent>
                                {order.status === 'pending' && (
                                  <SelectItem value="on_the_way">في الطريق</SelectItem>
                                )}
                                {order.status === 'on_the_way' && (
                                  <SelectItem value="delivered">تم التوصيل</SelectItem>
                                )}
                                <SelectItem value="cancelled">إلغاء</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}