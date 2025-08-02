"use client";

import { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Truck,
  Eye,
  FileText,
  PieChart,
  Activity,
  Shield
} from "lucide-react";

export default function Reports() {
  const { permissions } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const stats = [
    { 
      title: "إجمالي المبيعات", 
      value: "45,230 ريال", 
      change: "+12.5%", 
      icon: DollarSign, 
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    { 
      title: "عدد الطلبات", 
      value: "1,234", 
      change: "+8.3%", 
      icon: ShoppingCart, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      title: "العملاء الجدد", 
      value: "89", 
      change: "+15.2%", 
      icon: Users, 
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      title: "متوسط التقييم", 
      value: "4.8/5", 
      change: "+0.2", 
      icon: Activity, 
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50"
    },
  ];

  const reports = [
    {
      id: "1",
      title: "تقرير المبيعات الشهري",
      description: "تحليل شامل للمبيعات والطلبات",
      type: "مبيعات",
      date: "يناير 2024",
      status: "مكتمل",
      icon: BarChart3
    },
    {
      id: "2",
      title: "تقرير أداء الموصّلين",
      description: "إحصائيات التوصيل والوقت",
      type: "توصيل",
      date: "يناير 2024",
      status: "مكتمل",
      icon: Truck
    },
    {
      id: "3",
      title: "تقرير رضا العملاء",
      description: "تحليل التقييمات والشكاوى",
      type: "عملاء",
      date: "يناير 2024",
      status: "قيد الإعداد",
      icon: Users
    },
    {
      id: "4",
      title: "تقرير المخزون",
      description: "حالة المخزون والطلبات",
      type: "مخزون",
      date: "يناير 2024",
      status: "مكتمل",
      icon: Package
    }
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">التقارير والإحصائيات</h1>
            <p className="text-gray-600">تحليل شامل لأداء النظام</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">الأسبوع الحالي</option>
              <option value="month">الشهر الحالي</option>
              <option value="quarter">الربع الحالي</option>
              <option value="year">السنة الحالية</option>
            </select>
            {permissions.canExportReports ? (
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                <Download className="h-4 w-4" />
                تصدير التقرير
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-500">
                <Shield className="h-4 w-4" />
                <span className="text-sm">لا تملك صلاحية تصدير التقارير</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${stat.bgColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  <span className="text-sm text-gray-500 mr-1">من الفترة السابقة</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">المبيعات الشهرية</h3>
            <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
              عرض التفاصيل
            </button>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">رسم بياني للمبيعات</p>
            </div>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">الطلبات اليومية</h3>
            <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
              عرض التفاصيل
            </button>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">رسم بياني للطلبات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">التقارير المتاحة</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${report.type === 'مبيعات' ? 'bg-green-500' : report.type === 'توصيل' ? 'bg-blue-500' : report.type === 'عملاء' ? 'bg-purple-500' : 'bg-indigo-500'}`}>
                    <report.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === 'مكتمل' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
                
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{report.date}</span>
                  <div className="flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                      <Eye size={16} />
                    </button>
                    {permissions.canExportReports && (
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
            <BarChart3 className="h-5 w-5" />
            تقرير مبيعات
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
            <Truck className="h-5 w-5" />
            تقرير توصيل
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
            <Users className="h-5 w-5" />
            تقرير عملاء
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
            <Package className="h-5 w-5" />
            تقرير مخزون
          </button>
        </div>
      </div>
    </Layout>
  );
} 