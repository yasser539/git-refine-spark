import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { deliveryCaptainsService } from '@/lib/supabase-services'
import { useToast } from '@/hooks/use-toast'
import type { DeliveryCaptain } from '@/types'
import {
  Plus,
  Search,
  Truck,
  Phone,
  MapPin,
  Star,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function DeliveryPage() {
  const [captains, setCaptains] = useState<DeliveryCaptain[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadCaptains()
  }, [])

  const loadCaptains = async () => {
    try {
      setLoading(true)
      const data = await deliveryCaptainsService.getAllDeliveryCaptains()
      setCaptains(data)
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل قائمة السائقين',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCaptains = captains.filter(captain =>
    !searchTerm ||
    captain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    captain.phone.includes(searchTerm) ||
    captain.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: captains.length,
    active: captains.filter(c => c.is_active).length,
    available: captains.filter(c => c.is_available && c.is_active).length,
    busy: captains.filter(c => c.is_active && !c.is_available).length
  }

  const vehicleTypeLabels = {
    motorcycle: 'دراجة نارية',
    car: 'سيارة',
    bicycle: 'دراجة هوائية'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة السائقين</h1>
          <p className="text-muted-foreground mt-2">
            متابعة وإدارة فريق التوصيل
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة سائق جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">إجمالي السائقين</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">نشط</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold">{stats.available}</p>
                <p className="text-sm text-muted-foreground">متاح</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.busy}</p>
                <p className="text-sm text-muted-foreground">مشغول</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم، الهاتف، أو نوع المركبة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Captains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredCaptains.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد سائقين مسجلين'}
            </p>
          </div>
        ) : (
          filteredCaptains.map((captain) => (
            <Card key={captain.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{captain.name}</h3>
                      <p className="text-sm text-muted-foreground">{captain.license_number}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${captain.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {captain.is_active ? 'نشط' : 'غير نشط'}
                    </div>
                    {captain.is_active && (
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${captain.is_available ? 'border-emerald-200 text-emerald-700' : 'border-orange-200 text-orange-700'}`}>
                        {captain.is_available ? 'متاح' : 'مشغول'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{captain.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span>{vehicleTypeLabels[captain.vehicle_type]}</span>
                    {captain.vehicle_model && (
                      <span className="text-muted-foreground">- {captain.vehicle_model}</span>
                    )}
                  </div>

                  {captain.current_location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{captain.current_location}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{captain.average_rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({captain.total_deliveries} توصيلة)</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-green-600">{captain.success_rate}%</span>
                      <span className="text-muted-foreground"> نجاح</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    تفاصيل
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    تعديل
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}