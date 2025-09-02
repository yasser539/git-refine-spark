import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Truck,
  DollarSign
} from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم الرئيسية</h1>
          <p className="text-muted-foreground">مرحباً بك في نظام إدارة تطبيق التوصيل</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="إجمالي المستخدمين"
            value="1,234"
            change="+12% من الشهر الماضي"
            changeType="positive"
            icon={Users}
          />
          <StatsCard
            title="الطلبات اليوم"
            value="89"
            change="+5% من أمس"
            changeType="positive"
            icon={ShoppingCart}
          />
          <StatsCard
            title="الموصلين النشطين"
            value="23"
            change="2 موصل جديد"
            changeType="neutral"
            icon={Truck}
          />
          <StatsCard
            title="المبيعات اليوم"
            value="15,420 ريال"
            change="+8% من أمس"
            changeType="positive"
            icon={DollarSign}
          />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentOrders />
          
          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="rounded-lg bg-gradient-primary p-6 text-primary-foreground">
                <h3 className="text-lg font-semibold mb-2">إضافة موصل جديد</h3>
                <p className="text-sm opacity-90 mb-4">
                  أضف موصل جديد لتوسيع شبكة التوصيل
                </p>
                <button className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                  إضافة موصل
                </button>
              </div>
              
              <div className="rounded-lg bg-card border p-6">
                <h3 className="text-lg font-semibold mb-2">إدارة المنتجات</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  عرض وإدارة جميع المنتجات المتاحة
                </p>
                <button className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                  إدارة المنتجات
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
