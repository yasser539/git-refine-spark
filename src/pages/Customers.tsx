import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { customersService } from '@/lib/supabase-services'
import { useToast } from '@/hooks/use-toast'
import type { Customer } from '@/types'
import {
  Plus,
  Search,
  Users,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Edit,
  UserCheck,
  UserX
} from 'lucide-react'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await customersService.getAllCustomers()
      setCustomers(data)
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل قائمة العملاء',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    !searchTerm ||
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.is_active).length,
    inactive: customers.filter(c => !c.is_active).length,
    thisMonth: customers.filter(c => {
      const created = new Date(c.created_at)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة العملاء</h1>
          <p className="text-muted-foreground mt-2">
            متابعة وإدارة قاعدة بيانات العملاء
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة عميل جديد
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
                <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
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
              <UserX className="h-5 w-5 text-red-600" />
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
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
                <p className="text-sm text-muted-foreground">هذا الشهر</p>
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
              placeholder="البحث بالاسم، الهاتف، الإيميل، أو المدينة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد عملاء مسجلين'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-4">الاسم</th>
                    <th className="text-right p-4">الهاتف</th>
                    <th className="text-right p-4">الإيميل</th>
                    <th className="text-right p-4">المدينة</th>
                    <th className="text-right p-4">الحالة</th>
                    <th className="text-right p-4">تاريخ التسجيل</th>
                    <th className="text-right p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            {customer.notes && (
                              <p className="text-sm text-muted-foreground">{customer.notes}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {customer.email || '-'}
                      </td>
                      <td className="p-4">
                        {customer.city ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {customer.city}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          customer.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {customer.is_active ? 'نشط' : 'غير نشط'}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(customer.created_at).toLocaleDateString('ar-SA')}
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