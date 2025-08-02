"use client";

import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { databaseService } from "../../lib/database-services";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  User,
  Download,
  Upload,
  RefreshCw,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Shield
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  status: "نشط" | "معطل";
  createdAt: string;
  lastLogin: string;
  avatar?: string;
  ordersCount?: number;
  rating?: number;
  location: string;
  totalSpent: number;
}

export default function CustomersManagement() {
  const { permissions } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // دالة جلب العملاء من قاعدة البيانات
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching customers...');
      
      // Test database connection first
      const isConnected = await databaseService.testConnection();
      if (!isConnected) {
        throw new Error('فشل في الاتصال بقاعدة البيانات');
      }
      
      const customersData = await databaseService.getCustomers();
      console.log('Raw customers data:', customersData);
      
      // تحويل البيانات إلى التنسيق المطلوب
      const formattedCustomers: Customer[] = customersData.map((customer: any) => ({
        id: customer.id,
        name: customer.name || "غير محدد",
        phone: customer.phone || "غير محدد",
        status: customer.is_active ? "نشط" : "معطل",
        createdAt: new Date(customer.created_at).toLocaleDateString('ar-SA'),
        lastLogin: customer.last_login ? new Date(customer.last_login).toLocaleDateString('ar-SA') : "لم يسجل دخول",
        ordersCount: customer.orders_count || 0,
        rating: customer.rating || 0,
        location: customer.address || customer.location || "غير محدد",
        totalSpent: customer.total_spent || 0
      }));
      
      console.log('Formatted customers:', formattedCustomers);
      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('فشل في جلب البيانات من قاعدة البيانات');
      // Set empty array to prevent app crash
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // دالة إظهار الإشعارات
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification({ type: 'info', message: '', show: false });
    }, 4000); // زيادة المدة إلى 4 ثوانٍ
  };

  // دالة التحديث الصامت
  const silentUpdate = async () => {
    try {
      const customersData = await databaseService.getCustomers();
      const formattedCustomers: Customer[] = customersData.map((customer: any) => ({
        id: customer.id,
        name: customer.name || "غير محدد",
        phone: customer.phone || "غير محدد",
        status: customer.is_active ? "نشط" : "معطل",
        createdAt: new Date(customer.created_at).toLocaleDateString('ar-SA'),
        lastLogin: customer.last_login ? new Date(customer.last_login).toLocaleDateString('ar-SA') : "لم يسجل دخول",
        ordersCount: customer.orders_count || 0,
        rating: customer.rating || 0,
        location: customer.address || customer.location || "غير محدد",
        totalSpent: customer.total_spent || 0
      }));
      
      setCustomers(prevCustomers => {
        if (JSON.stringify(prevCustomers) !== JSON.stringify(formattedCustomers)) {
          return formattedCustomers;
        }
        return prevCustomers;
      });
    } catch (error) {
      console.log('Silent update failed:', error);
    }
  };

  // جلب العملاء من قاعدة البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchCustomers();
  }, []);

  // تحديث ذكي عند النشاط في الصفحة
  useEffect(() => {
    let lastActivity = Date.now();
    let updateTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      lastActivity = Date.now();
      
      // إلغاء التحديث السابق
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      
      // تحديث بعد 5 ثوانٍ من آخر نشاط
      updateTimeout = setTimeout(() => {
        const timeSinceActivity = Date.now() - lastActivity;
        if (timeSinceActivity >= 5000) { // 5 ثوانٍ
          silentUpdate();
        }
      }, 5000);
    };

    // مراقبة النشاط
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, []);

  // تحديث تلقائي للبيانات كل 60 ثانية في الخلفية
  useEffect(() => {
    const interval = setInterval(() => {
      silentUpdate();
    }, 60000); // 60 ثانية

    return () => clearInterval(interval);
  }, []);

  // تحديث عند استعادة الاتصال
  useEffect(() => {
    const handleOnline = () => {
      // تحديث صامت عند استعادة الاتصال
      setTimeout(() => {
        silentUpdate();
      }, 2000); // تأخير 2 ثانية
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // تحديث عند العودة للصفحة
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // تحديث صامت عند العودة للصفحة
        setTimeout(() => {
          silentUpdate();
        }, 1000); // تأخير ثانية واحدة
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("الكل");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    location: ""
  });

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    show: boolean;
  }>({ type: 'info', message: '', show: false });
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         customer.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "الكل" || customer.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddCustomer = async () => {
    try {
      if (!newCustomer.name || !newCustomer.phone || !newCustomer.location) {
        showNotification('error', 'يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      setIsProcessing(true);

      // إضافة العميل إلى قاعدة البيانات
      const addedCustomer = await databaseService.addCustomer({
        name: newCustomer.name,
        phone: newCustomer.phone,
        address: newCustomer.location
      });

      if (addedCustomer) {
        // إضافة العميل مباشرة للقائمة بدلاً من إعادة التحميل
        const newCustomerFormatted: Customer = {
          id: addedCustomer.id,
          name: addedCustomer.name,
          phone: addedCustomer.phone,
          status: addedCustomer.is_active ? "نشط" : "معطل",
          createdAt: new Date(addedCustomer.created_at).toLocaleDateString('ar-SA'),
          lastLogin: "لم يسجل دخول",
          ordersCount: 0,
          rating: 0,
          location: addedCustomer.address,
          totalSpent: 0
        };
        
        setCustomers([newCustomerFormatted, ...customers]);
        setShowAddModal(false);
        setNewCustomer({ name: "", phone: "", location: "" });
        
        // إظهار رسالة نجاح
        showNotification('success', 'تم إضافة العميل بنجاح');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      if (error instanceof Error) {
        showNotification('error', `فشل في إضافة العميل: ${error.message}`);
      } else {
        showNotification('error', 'فشل في إضافة العميل. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCustomerStatus = async (customerId: string) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      const newStatus = customer.status === "نشط" ? false : true;
      
      // تحديث الحالة في الواجهة فوراً
      setCustomers(customers.map(customer => 
        customer.id === customerId 
          ? { ...customer, status: newStatus ? "نشط" : "معطل" }
          : customer
      ));

      // تحديث الحالة في قاعدة البيانات في الخلفية
      await databaseService.updateCustomer(customerId, {
        is_active: newStatus
      });

      showNotification('success', `تم ${newStatus ? 'تفعيل' : 'تعطيل'} العميل بنجاح`);
    } catch (error) {
      console.error('Error toggling customer status:', error);
      showNotification('error', 'فشل في تحديث حالة العميل. يرجى المحاولة مرة أخرى.');
      
      // إعادة الحالة الأصلية في حالة الخطأ
      setCustomers(customers.map(customer => 
        customer.id === customerId 
          ? { ...customer, status: customer.status === "نشط" ? "معطل" : "نشط" }
          : customer
      ));
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      // حذف العميل من الواجهة فوراً
      setCustomers(customers.filter(customer => customer.id !== customerId));

      // حذف العميل من قاعدة البيانات في الخلفية
      await databaseService.deleteCustomer(customerId);

      showNotification('success', 'تم حذف العميل بنجاح');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showNotification('error', 'فشل في حذف العميل. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

  const handleUpdateCustomer = async () => {
    try {
      if (!editingCustomer) return;

      if (!editingCustomer.name || !editingCustomer.phone || !editingCustomer.location) {
        showNotification('error', 'يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      setIsProcessing(true);

      // تحديث العميل في قاعدة البيانات
      const updatedCustomer = await databaseService.updateCustomer(editingCustomer.id, {
        name: editingCustomer.name,
        phone: editingCustomer.phone,
        address: editingCustomer.location
      });

      if (updatedCustomer) {
        // تحديث العميل في الواجهة
        setCustomers(customers.map(customer => 
          customer.id === editingCustomer.id ? {
            ...customer,
            name: editingCustomer.name,
            phone: editingCustomer.phone,
            location: editingCustomer.location
          } : customer
        ));

        setShowEditModal(false);
        setEditingCustomer(null);
        showNotification('success', 'تم تحديث بيانات العميل بنجاح');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      showNotification('error', 'فشل في تحديث بيانات العميل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  const stats = [
    { 
      title: "إجمالي العملاء", 
      value: customers.length, 
      change: "+15%", 
      icon: Users, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      title: "العملاء النشطين", 
      value: customers.filter(c => c.status === "نشط").length, 
      change: "+8%", 
      icon: User, 
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    { 
      title: "إجمالي الطلبات", 
      value: customers.reduce((acc, c) => acc + (c.ordersCount || 0), 0), 
      change: "+12%", 
      icon: TrendingUp, 
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      title: "متوسط التقييم", 
      value: (customers.reduce((acc, c) => acc + (c.rating || 0), 0) / customers.length).toFixed(1) + "/5", 
      change: "+0.2", 
      icon: TrendingUp, 
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50"
    },
  ];

  return (
    <Layout>
            {/* Custom Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
          <div className={`relative p-4 rounded-lg shadow-lg border-r-4 transform transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : notification.type === 'error' 
              ? 'bg-red-50 border-red-400 text-red-800' 
              : 'bg-blue-50 border-blue-400 text-blue-800'
          }`}>
            {/* Icon */}
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                notification.type === 'success' 
                  ? 'bg-green-200 text-green-700' 
                  : notification.type === 'error' 
                  ? 'bg-red-200 text-red-700' 
                  : 'bg-blue-200 text-blue-700'
              }`}>
                {notification.type === 'success' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : notification.type === 'error' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {/* Content */}
              <div className="mr-3 flex-1">
                <p className="text-sm font-semibold">
                  {notification.type === 'success' ? 'تم بنجاح' : notification.type === 'error' ? 'حدث خطأ' : 'تنبيه'}
                </p>
                <p className="text-sm mt-1 text-gray-600">{notification.message}</p>
              </div>
              
              {/* Close Button */}
              <button 
                onClick={() => setNotification({ type: 'info', message: '', show: false })}
                className="flex-shrink-0 mr-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة العملاء</h1>
            <p className="text-gray-600">إدارة جميع العملاء في النظام</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchCustomers}
              className="btn-secondary"
              title="إعادة تحميل البيانات"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة تحميل
            </button>
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              تصدير
            </button>
            <button className="btn-secondary">
              <Upload className="h-4 w-4" />
              استيراد
            </button>
            {permissions.can_modify_users ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <UserPlus className="h-4 w-4" />
                إضافة عميل جديد
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-500">
                <Shield className="h-4 w-4" />
                <span className="text-sm">لا تملك صلاحية إضافة عملاء</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className={`stats-card ${stat.bgColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  <span className="text-sm text-gray-500 mr-1">من الشهر الماضي</span>
                </div>
              </div>
              <div className={`stats-card-gradient ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">البحث</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث بالاسم أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">الحالة</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
            >
              <option value="الكل">الكل</option>
              <option value="نشط">نشط</option>
              <option value="معطل">معطل</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">عرض</label>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-sm font-medium ${viewMode === "list" ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                قائمة
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm font-medium ${viewMode === "grid" ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                شبكة
              </button>
            </div>
          </div>
          
          <div className="flex items-end">
            <button className="btn-secondary w-full">
              <Filter className="h-4 w-4" />
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchCustomers} 
              className="btn-primary"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* Customers Display */}
      {!loading && !error && viewMode === "list" ? (
        <div className="table-container">
          <div className="table-header">
            <h3 className="text-lg font-bold text-gray-900">قائمة العملاء ({filteredCustomers.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">
                    العميل
                  </th>
                  <th className="table-head-cell">
                    الحالة
                  </th>
                  <th className="table-head-cell">
                    الإحصائيات
                  </th>
                  <th className="table-head-cell">
                    آخر تسجيل دخول
                  </th>
                  <th className="table-head-cell">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="avatar avatar-gradient-blue">
                            {customer.name.charAt(0)}
                          </div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-bold text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                          <div className="text-sm text-gray-500">{customer.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={customer.status === "نشط" ? "badge-success" : "badge-danger"}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">
                        {customer.ordersCount || 0} طلب
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.totalSpent} ريال
                      </div>
                      {customer.rating && (
                        <div className="text-sm text-gray-500">
                          ⭐ {customer.rating}/5
                        </div>
                      )}
                    </td>
                    <td className="table-cell text-sm text-gray-500">
                      {customer.lastLogin}
                    </td>
                    <td className="table-cell text-sm font-medium">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => toggleCustomerStatus(customer.id)}
                          className="action-btn action-btn-view"
                        >
                          {customer.status === "نشط" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        {permissions.can_modify_users && (
                          <button 
                            onClick={() => handleEditCustomer(customer)}
                            className="action-btn action-btn-edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {permissions.can_modify_users && (
                          <button
                            onClick={() => deleteCustomer(customer.id)}
                            className="action-btn action-btn-delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : !loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <div className="avatar avatar-gradient-blue">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button className="action-btn">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{customer.name}</h3>
                  <p className="text-sm text-gray-500">{customer.phone}</p>
                  <p className="text-sm text-gray-500">{customer.location}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={customer.status === "نشط" ? "badge-success" : "badge-danger"}>
                      {customer.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">الطلبات: {customer.ordersCount || 0}</span>
                    <span className="text-gray-600">{customer.totalSpent} ريال</span>
                  </div>
                  
                  {customer.rating && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">التقييم: ⭐ {customer.rating}/5</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {permissions.can_modify_users ? (
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                        تعديل
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">لا تملك صلاحية التعديل</span>
                    )}
                    <button
                      onClick={() => toggleCustomerStatus(customer.id)}
                      className={`text-sm font-medium ${customer.status === "نشط" ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}`}
                    >
                      {customer.status === "نشط" ? "تعطيل" : "تفعيل"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredCustomers.length === 0 && (
        <div className="empty-state">
          <Users className="empty-state-icon" />
          <h3 className="empty-state-title">لا توجد عملاء</h3>
          <p className="empty-state-description">لم يتم العثور على عملاء تطابق معايير البحث</p>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">إضافة عميل جديد</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">الاسم</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    className="form-input"
                    placeholder="أدخل الاسم"
                  />
                </div>
                
                <div>
                  <label className="form-label">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="form-input"
                    placeholder="+966501234567"
                  />
                </div>
                
                <div>
                  <label className="form-label">الموقع</label>
                  <input
                    type="text"
                    value={newCustomer.location}
                    onChange={(e) => setNewCustomer({...newCustomer, location: e.target.value})}
                    className="form-input"
                    placeholder="الرياض، جدة، الدمام"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddCustomer}
                  disabled={isProcessing}
                  className={`btn-primary ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الإضافة...
                    </div>
                  ) : (
                    'إضافة العميل'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">تعديل بيانات العميل</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">الاسم</label>
                  <input
                    type="text"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                    className="form-input"
                    placeholder="أدخل الاسم"
                  />
                </div>
                
                <div>
                  <label className="form-label">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                    className="form-input"
                    placeholder="+966501234567"
                  />
                </div>
                
                <div>
                  <label className="form-label">الموقع</label>
                  <input
                    type="text"
                    value={editingCustomer.location}
                    onChange={(e) => setEditingCustomer({...editingCustomer, location: e.target.value})}
                    className="form-input"
                    placeholder="الرياض، جدة، الدمام"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
                  }}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleUpdateCustomer}
                  disabled={isProcessing}
                  className={`btn-primary ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الحفظ...
                    </div>
                  ) : (
                    'حفظ التغييرات'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 