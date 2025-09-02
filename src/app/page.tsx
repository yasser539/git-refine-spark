"use client";

import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import { supabase } from "../lib/supabase";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Truck,
  Clock,
  Star,
  Activity,
  RefreshCw
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalDrivers: number;
  activeOrders: number;
  completedOrders: number;
  averageDeliveryTime: string;
  customerSatisfaction: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalDrivers: 0,
    activeOrders: 0,
    completedOrders: 0,
    averageDeliveryTime: "0 دقيقة",
    customerSatisfaction: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب إحصائيات لوحة التحكم
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب إحصائيات الطلبات
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (ordersError) throw ordersError;

      // جلب إحصائيات العملاء
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true);

      if (customersError) throw customersError;

      // جلب إحصائيات الموظفين (كباتن التوصيل)
      const { data: driversData, error: driversError } = await supabase
        .from('employees')
        .select('*')
        .eq('role', 'deliverer')
        .eq('status', 'active');

      if (driversError) throw driversError;

      // حساب الإحصائيات
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum: number, order: Record<string, unknown>) => sum + ((order.total_amount as number) || 0), 0);
      const totalCustomers = customersData.length;
      const totalDrivers = driversData.length;
      const activeOrders = ordersData.filter((order: Record<string, unknown>) => 
        order.status === 'pending' || order.status === 'out_for_delivery'
      ).length;
      const completedOrders = ordersData.filter((order: Record<string, unknown>) => 
        order.status === 'delivered'
      ).length;

      // حساب متوسط وقت التوصيل (افتراضي)
      const averageDeliveryTime = "25 دقيقة";

      // حساب رضا العملاء (افتراضي)
      const customerSatisfaction = 4.5;

      setStats({
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalDrivers,
        activeOrders,
        completedOrders,
        averageDeliveryTime,
        customerSatisfaction
      });

    } catch (error) {
      const err = error as any;
      console.error('Error fetching dashboard stats:', {
        message: err?.message,
        name: err?.name,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        status: err?.status,
        error: err,
        asString: typeof err === 'object' ? JSON.stringify(err) : String(err)
      });
      setError('فشل في جلب إحصائيات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // تحديث البيانات كل دقيقة
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const statsCards = [
    {
      title: "إجمالي الطلبات",
      value: stats.totalOrders,
      change: "+12%",
      trend: "up",
      icon: ShoppingCart,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "إجمالي الإيرادات",
      value: `${stats.totalRevenue.toFixed(2)} ريال`,
      change: "+8%",
      trend: "up",
      icon: DollarSign,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "العملاء النشطين",
      value: stats.totalCustomers,
      change: "+5%",
      trend: "up",
      icon: Users,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "كباتن التوصيل",
      value: stats.totalDrivers,
      change: "+2",
      trend: "up",
      icon: Truck,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const performanceCards = [
    {
      title: "الطلبات النشطة",
      value: stats.activeOrders,
      icon: Activity,
      color: "bg-yellow-500",
      description: "طلبات قيد المعالجة والتوصيل"
    },
    {
      title: "الطلبات المكتملة",
      value: stats.completedOrders,
      icon: Package,
      color: "bg-green-500",
      description: "طلبات تم توصيلها بنجاح"
    },
    {
      title: "متوسط وقت التوصيل",
      value: stats.averageDeliveryTime,
      icon: Clock,
      color: "bg-blue-500",
      description: "الوقت المتوسط للتوصيل"
    },
    {
      title: "رضا العملاء",
      value: `${stats.customerSatisfaction}/5`,
      icon: Star,
      color: "bg-purple-500",
      description: "متوسط تقييم العملاء"
    }
  ];

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardStats} 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
            <p className="text-gray-600">مرحباً بك، {user?.name || 'المستخدم'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchDashboardStats}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'جاري التحديث...' : 'تحديث'}
            </button>
            <div className="text-sm text-gray-500">
              آخر تحديث: {new Date().toLocaleString('ar-SA')}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <div key={stat.title} className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${stat.bgColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <div className="flex items-center">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 mr-1">من الشهر الماضي</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {performanceCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
            <p className="text-sm text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">النشاط الأخير</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">تم إضافة طلب جديد</p>
              <p className="text-xs text-gray-500">منذ 5 دقائق</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">تم تسجيل عميل جديد</p>
              <p className="text-xs text-gray-500">منذ 15 دقيقة</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">تم تحديث حالة طلب</p>
              <p className="text-xs text-gray-500">منذ 30 دقيقة</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

