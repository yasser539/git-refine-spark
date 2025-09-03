import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  FileText,
  PieChart,
  Users,
  Truck
} from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">التقارير والتحليلات</h1>
        <p className="text-muted-foreground mt-2">
          تحليل الأداء ومؤشرات الأعمال الرئيسية
        </p>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">تقارير المبيعات</h3>
                <p className="text-sm text-muted-foreground">الإيرادات والطلبات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">تقارير التوصيل</h3>
                <p className="text-sm text-muted-foreground">أداء السائقين</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">تقارير العملاء</h3>
                <p className="text-sm text-muted-foreground">سلوك العملاء</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <PieChart className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">التحليل المالي</h3>
                <p className="text-sm text-muted-foreground">الربحية والتكاليف</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold">تقارير الأداء</h3>
                <p className="text-sm text-muted-foreground">KPIs ومقاييس الجودة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold">التقارير المجدولة</h3>
                <p className="text-sm text-muted-foreground">تقارير دورية</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Section */}
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">التقارير والتحليلات</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              نعمل على تطوير نظام شامل للتقارير والتحليلات سيتضمن مؤشرات الأداء المختلفة 
              والرسوم البيانية التفاعلية لمساعدتك في اتخاذ قرارات مدروسة
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-right">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">التقارير المالية</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• تقرير الإيرادات اليومي والشهري</li>
                  <li>• تحليل الربحية حسب المنطقة</li>
                  <li>• تقرير العمولات والمدفوعات</li>
                  <li>• مقارنة الأداء الشهري</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">تقارير العمليات</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• إحصائيات التوصيل ومعدل النجاح</li>
                  <li>• أداء السائقين والتقييمات</li>
                  <li>• تحليل أوقات التوصيل</li>
                  <li>• تقرير الطلبات الملغية</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">تحليل العملاء</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• سلوك العملاء وتفضيلاتهم</li>
                  <li>• معدل العودة والولاء</li>
                  <li>• تحليل الطلبات حسب المنطقة</li>
                  <li>• تقرير رضا العملاء</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">مؤشرات الأداء</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• KPIs للنمو والكفاءة</li>
                  <li>• مقاييس جودة الخدمة</li>
                  <li>• تحليل التكاليف التشغيلية</li>
                  <li>• معدلات التحويل والنجاح</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Download className="h-4 w-4" />
                تصدير PDF و Excel
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                رسوم بيانية تفاعلية
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                تقارير مجدولة تلقائياً
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}