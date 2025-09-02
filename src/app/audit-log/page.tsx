"use client";

import { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { 
  Activity, 
  User, 
  Package, 
  ShoppingCart, 
  Trash2, 
  Edit, 
  Plus,
  Search,
  Filter,
  Download,
  UserCheck,
  AlertTriangle,
  Eye,
  TrendingUp,
  Shield,
  Database
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  description: string;
  user: string;
  userRole: string;
  timestamp: string;
  type: "create" | "update" | "delete" | "login" | "error";
          category: "user" | "product" | "order" | "system" | "inventory";
  ipAddress: string;
  userAgent: string;
}

export default function AuditLog() {
  const { permissions } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: "1",
      action: "إضافة مستخدم جديد",
      description: "تم إضافة المستخدم: أحمد محمد",
      user: "المدير العام",
      userRole: "أدمن",
      timestamp: "2024-01-20 16:30:45",
      type: "create",
      category: "user",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome/120.0.0.0"
    },
    {
      id: "2",
      action: "تحديث منتج",
      description: "تم تحديث سعر منتج: مياه طبيعية",
      user: "أحمد محمد",
      userRole: "موظف",
      timestamp: "2024-01-20 16:25:12",
      type: "update",
      category: "product",
      ipAddress: "192.168.1.101",
      userAgent: "Firefox/121.0.0.0"
    },
    {
      id: "3",
      action: "حذف طلب",
      description: "تم حذف الطلب: #12345",
      user: "فاطمة حسن",
      userRole: "موظف",
      timestamp: "2024-01-20 16:20:33",
      type: "delete",
      category: "order",
      ipAddress: "192.168.1.102",
      userAgent: "Safari/17.2.0.0"
    },
    {
      id: "4",
      action: "تسجيل دخول",
      description: "تسجيل دخول ناجح",
      user: "علي أحمد",
      userRole: "موصل",
      timestamp: "2024-01-20 16:15:22",
      type: "login",
      category: "system",
      ipAddress: "192.168.1.103",
      userAgent: "Mobile Safari/17.2.0.0"
    },
    {
      id: "5",
      action: "تحديث مخزون",
      description: "تم تحديث كمية منتج: مياه طبيعية",
      user: "أحمد محمد",
      userRole: "موظف",
      timestamp: "2024-01-20 16:10:15",
      type: "update",
      category: "inventory",
      ipAddress: "192.168.1.104",
      userAgent: "Chrome/120.0.0.0"
    },
    {
      id: "6",
      action: "خطأ في النظام",
      description: "فشل في تحميل البيانات",
      user: "النظام",
      userRole: "نظام",
      timestamp: "2024-01-20 16:10:15",
      type: "error",
      category: "system",
      ipAddress: "192.168.1.104",
      userAgent: "System/1.0.0.0"
    },
    {
      id: "6",
      action: "تحديث مخزون",
      description: "تم تحديث كمية المخزون: مياه معدنية",
      user: "أحمد محمد",
      userRole: "موظف",
      timestamp: "2024-01-20 16:05:45",
      type: "update",
      
      ipAddress: "192.168.1.105",
      userAgent: "Chrome/120.0.0.0"
    },
    {
      id: "7",
      action: "إضافة طلب جديد",
      description: "تم إضافة طلب جديد: #12346",
      user: "فاطمة حسن",
      userRole: "موظف",
      timestamp: "2024-01-20 16:00:12",
      type: "create",
      category: "order",
      ipAddress: "192.168.1.106",
      userAgent: "Firefox/121.0.0.0"
    },
    {
      id: "8",
      action: "تسجيل خروج",
      description: "تسجيل خروج المستخدم",
      user: "علي أحمد",
      userRole: "موصل",
      timestamp: "2024-01-20 15:55:33",
      type: "login",
      category: "system",
      ipAddress: "192.168.1.107",
      userAgent: "Mobile Safari/17.2.0.0"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("الكل");
  const [filterCategory, setFilterCategory] = useState<string>("الكل");
  const [filterUser, setFilterUser] = useState<string>("الكل");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "الكل" || log.type === filterType;
    const matchesCategory = filterCategory === "الكل" || log.category === filterCategory;
    const matchesUser = filterUser === "الكل" || log.user === filterUser;
    
    return matchesSearch && matchesType && matchesCategory && matchesUser;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "create": return "bg-green-100 text-green-800";
      case "update": return "bg-blue-100 text-blue-800";
      case "delete": return "bg-red-100 text-red-800";
      case "login": return "bg-purple-100 text-purple-800";
      case "error": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "user": return "bg-blue-100 text-blue-800";
      case "product": return "bg-green-100 text-green-800";
      case "order": return "bg-purple-100 text-purple-800";

      case "system": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "create": return Plus;
      case "update": return Edit;
      case "delete": return Trash2;
      case "login": return UserCheck;
      case "error": return AlertTriangle;
      default: return Activity;
    }
  };

  const stats = [
    { 
      title: "إجمالي العمليات", 
      value: logs.length, 
      change: "+12", 
      icon: Activity, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      title: "عمليات الإضافة", 
      value: logs.filter(l => l.type === "create").length, 
      change: "+5", 
      icon: Plus, 
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    { 
      title: "عمليات التحديث", 
      value: logs.filter(l => l.type === "update").length, 
      change: "+8", 
      icon: Edit, 
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      title: "الأخطاء", 
      value: logs.filter(l => l.type === "error").length, 
      change: "-2", 
      icon: AlertTriangle, 
      color: "bg-gradient-to-br from-red-500 to-red-600",
      bgColor: "bg-red-50"
    },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">سجل العمليات</h1>
            <p className="text-gray-600">مراقبة جميع العمليات والأنشطة في النظام</p>
          </div>
          <div className="flex items-center gap-3">
            {permissions.can_export_reports ? (
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                <Download className="h-4 w-4" />
                تصدير السجل
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-500">
                <Shield className="h-4 w-4" />
                <span className="text-sm">لا تملك صلاحية تصدير التقارير</span>
              </div>
            )}
            {permissions.can_export_reports && (
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                إعدادات الأمان
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
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
                  <span className="text-sm text-gray-500 mr-1">من الساعة الماضية</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في السجل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع العملية</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="الكل">الكل</option>
              <option value="create">إضافة</option>
              <option value="update">تحديث</option>
              <option value="delete">حذف</option>
              <option value="login">تسجيل دخول</option>
              <option value="error">خطأ</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="الكل">الكل</option>
              <option value="user">المستخدمين</option>
              <option value="product">المنتجات</option>
              <option value="order">الطلبات</option>
              <option value="inventory">المخزون</option>
              <option value="system">النظام</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المستخدم</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="الكل">الكل</option>
              <option value="المدير العام">المدير العام</option>
              <option value="أحمد محمد">أحمد محمد</option>
              <option value="فاطمة حسن">فاطمة حسن</option>
              <option value="علي أحمد">علي أحمد</option>
              <option value="النظام">النظام</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2">
              <Filter className="h-4 w-4" />
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">سجل العمليات ({filteredLogs.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العملية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المستخدم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفئة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const TypeIcon = getTypeIcon(log.type);
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium ml-3">
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.action}</div>
                          <div className="text-sm text-gray-500">{log.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.user}</div>
                        <div className="text-sm text-gray-500">{log.userRole}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(log.type)}`}>
                        {log.type === "create" ? "إضافة" : 
                         log.type === "update" ? "تحديث" : 
                         log.type === "delete" ? "حذف" : 
                         log.type === "login" ? "تسجيل دخول" : "خطأ"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(log.category)}`}>
                        {log.category === "user" ? "المستخدمين" : 
                         log.category === "product" ? "المنتجات" : 
                         log.category === "order" ? "الطلبات" : 
                         log.category === "inventory" ? "المخزون" :
                         "النظام"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Database size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عمليات</h3>
          <p className="text-gray-600">لم يتم العثور على عمليات تطابق معايير البحث</p>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-xl rounded-xl bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">تفاصيل العملية #{selectedLog.id}</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">معلومات العملية</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>العملية:</strong> {selectedLog.action}</p>
                    <p><strong>الوصف:</strong> {selectedLog.description}</p>
                    <p><strong>النوع:</strong> 
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mr-2 ${getTypeColor(selectedLog.type)}`}>
                        {selectedLog.type === "create" ? "إضافة" : 
                         selectedLog.type === "update" ? "تحديث" : 
                         selectedLog.type === "delete" ? "حذف" : 
                         selectedLog.type === "login" ? "تسجيل دخول" : "خطأ"}
                      </span>
                    </p>
                    <p><strong>الفئة:</strong> 
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mr-2 ${getCategoryColor(selectedLog.category)}`}>
                        {selectedLog.category === "user" ? "المستخدمين" : 
                         selectedLog.category === "product" ? "المنتجات" : 
                         selectedLog.category === "order" ? "الطلبات" : 
                         selectedLog.category === "inventory" ? "المخزون" :
                         "النظام"}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">معلومات المستخدم</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>المستخدم:</strong> {selectedLog.user}</p>
                    <p><strong>الدور:</strong> {selectedLog.userRole}</p>
                    <p><strong>عنوان IP:</strong> {selectedLog.ipAddress}</p>
                    <p><strong>المتصفح:</strong> {selectedLog.userAgent}</p>
                    <p><strong>التاريخ:</strong> {selectedLog.timestamp}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إغلاق
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-colors">
                  تصدير التفاصيل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 