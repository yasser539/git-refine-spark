import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Package,
  Eye,
  Edit,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - في التطبيق الحقيقي سيتم جلبها من الخدمة
  const products = [
    {
      id: '1',
      name: 'منتج تجريبي 1',
      sku: 'PRD001',
      category: 'إلكترونيات',
      price: 299.99,
      stock: 50,
      merchant: 'تاجر الإلكترونيات',
      status: 'active'
    },
    {
      id: '2',
      name: 'منتج تجريبي 2',
      sku: 'PRD002',
      category: 'ملابس',
      price: 89.99,
      stock: 25,
      merchant: 'متجر الأزياء',
      status: 'active'
    }
  ]

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    lowStock: products.filter(p => p.stock < 20).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
          <p className="text-muted-foreground mt-2">
            متابعة وإدارة كتالوج المنتجات والمخزون
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة منتج جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">منتج نشط</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
                <p className="text-sm text-muted-foreground">مخزون منخفض</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalValue.toLocaleString()} ر.س</p>
                <p className="text-sm text-muted-foreground">قيمة المخزون</p>
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
              placeholder="البحث بالاسم، SKU، الفئة أو التاجر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">قريباً</h3>
            <p className="text-muted-foreground mb-4">
              سيتم إضافة إدارة المنتجات والمخزون في التحديث القادم
            </p>
            <div className="text-sm text-muted-foreground">
              <p>المميزات المخططة:</p>
              <ul className="mt-2 space-y-1">
                <li>• إدارة كتالوج المنتجات</li>
                <li>• تتبع المخزون والكميات</li>
                <li>• إنذارات المخزون المنخفض</li>
                <li>• ربط المنتجات بالتجار</li>
                <li>• تقارير المبيعات</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}