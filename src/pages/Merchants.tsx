import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { merchantsService } from '@/lib/supabase-services'
import { useToast } from '@/hooks/use-toast'
import type { Merchant } from '@/types'
import {
  Plus,
  Search,
  Store,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Percent,
  Building
} from 'lucide-react'

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadMerchants()
  }, [])

  const loadMerchants = async () => {
    try {
      setLoading(true)
      const data = await merchantsService.getAllMerchants()
      setMerchants(data)
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل قائمة التجار',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredMerchants = merchants.filter(merchant =>
    !searchTerm ||
    merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.phone.includes(searchTerm) ||
    merchant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: merchants.length,
    active: merchants.filter(m => m.is_active).length,
    inactive: merchants.filter(m => !m.is_active).length,
    avgCommission: merchants.length > 0 
      ? (merchants.reduce((sum, m) => sum + m.commission_rate, 0) / merchants.length).toFixed(1)
      : '0'
  }

  const categoryGroups = merchants.reduce((acc, merchant) => {
    const category = merchant.category || 'غير محدد'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة التجار</h1>
          <p className="text-muted-foreground mt-2">
            متابعة وإدارة شركاء التجار
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة تاجر جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">إجمالي التجار</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-green-600" />
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
              <Store className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-sm text-muted-foreground">غير نشط</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.avgCommission}%</p>
                <p className="text-sm text-muted-foreground">متوسط العمولة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>توزيع الفئات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(categoryGroups).map(([category, count]) => (
              <div key={category} className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">{category}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم، الهاتف، الإيميل، الفئة أو المدينة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Merchants Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة التجار ({filteredMerchants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredMerchants.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد تجار مسجلين'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-4">اسم التاجر</th>
                    <th className="text-right p-4">التواصل</th>
                    <th className="text-right p-4">الفئة</th>
                    <th className="text-right p-4">المدينة</th>
                    <th className="text-right p-4">العمولة</th>
                    <th className="text-right p-4">الحالة</th>
                    <th className="text-right p-4">تاريخ التسجيل</th>
                    <th className="text-right p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMerchants.map((merchant) => (
                    <tr key={merchant.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Store className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{merchant.name}</p>
                            {merchant.notes && (
                              <p className="text-sm text-muted-foreground">{merchant.notes}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {merchant.phone}
                          </div>
                          {merchant.email && (
                            <p className="text-sm text-muted-foreground">{merchant.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {merchant.category || 'غير محدد'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {merchant.city}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{merchant.commission_rate}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          merchant.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {merchant.is_active ? 'نشط' : 'غير نشط'}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(merchant.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
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