"use client";

import Layout from "../components/Layout";
import EmployeeCard from "../components/EmployeeCard";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { 
  Shield, 
  Users, 
  Package, 
  DollarSign, 
  FileText, 
  Bell, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  X,
  UserCheck,
  Settings,
  Lock,
  Unlock,
  Home,
  Map,
  Building,
  BarChart3,
  Activity,
  Warehouse
} from "lucide-react";

export default function PermissionsPage() {
  const { user, permissions, isAdminWithAllPermissions, getAllEmployees, getEmployeePermissions, updateEmployeePermissions } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempPermissions, setTempPermissions] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // جلب الموظفين عند تحميل الصفحة
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const employeesData = await getAllEmployees();
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    if (user?.role === 'admin') {
      fetchEmployees();
    }
  }, [getAllEmployees, user?.role]);

  const permissionsList = [
    // صلاحيات أساسية
    {
      key: 'can_view_dashboard',
      title: 'عرض لوحة التحكم',
      description: 'إمكانية الوصول للصفحة الرئيسية',
      icon: Home,
      admin: true,
      employee: true
    },
    {
      key: 'can_view_orders',
      title: 'عرض الطلبات',
      description: 'إمكانية عرض جميع الطلبات',
      icon: Package,
      admin: true,
      employee: true
    },
    {
      key: 'can_update_order_status',
      title: 'تحديث حالة الطلب',
      description: 'إمكانية تحديث حالة الطلبات',
      icon: Package,
      admin: true,
      employee: true
    },
    {
      key: 'can_view_live_map',
      title: 'عرض الخريطة الحية',
      description: 'إمكانية الوصول للخريطة الحية',
      icon: Map,
      admin: true,
      employee: true
    },
    
    // صلاحيات إدارة المستخدمين
    {
      key: 'can_view_users',
      title: 'عرض العملاء',
      description: 'إمكانية عرض قائمة العملاء',
      icon: Users,
      admin: true,
      employee: true
    },
    {
      key: 'can_modify_users',
      title: 'تعديل العملاء',
      description: 'إمكانية إضافة أو تعديل أو حذف العملاء',
      icon: Users,
      admin: true,
      employee: false
    },
    {
      key: 'can_view_merchants',
      title: 'عرض التجار',
      description: 'إمكانية عرض قائمة التجار',
      icon: Building,
      admin: true,
      employee: true
    },
    {
      key: 'can_modify_merchants',
      title: 'تعديل التجار',
      description: 'إمكانية إضافة أو تعديل أو حذف التجار',
      icon: Building,
      admin: true,
      employee: false
    },
    {
      key: 'can_view_employees',
      title: 'عرض الموظفين',
      description: 'إمكانية عرض قائمة الموظفين',
      icon: UserCheck,
      admin: true,
      employee: true
    },
    {
      key: 'can_modify_employees',
      title: 'تعديل الموظفين',
      description: 'إمكانية إضافة أو تعديل أو حذف الموظفين',
      icon: UserCheck,
      admin: true,
      employee: false
    },
    
    // صلاحيات إدارة المنتجات والمخزون
    {
      key: 'can_view_products',
      title: 'عرض المنتجات',
      description: 'إمكانية عرض قائمة المنتجات',
      icon: Package,
      admin: true,
      employee: true
    },
    {
      key: 'can_add_products',
      title: 'إضافة المنتجات',
      description: 'إمكانية إضافة أو تعديل أو حذف المنتجات',
      icon: Package,
      admin: true,
      employee: false
    },
    {
      key: 'can_view_inventory',
      title: 'عرض المخزون',
      description: 'إمكانية عرض إدارة المخزون',
      icon: Warehouse,
      admin: true,
      employee: true
    },
    {
      key: 'can_modify_inventory',
      title: 'تعديل المخزون',
      description: 'إمكانية إدارة المخزون والكميات',
      icon: Warehouse,
      admin: true,
      employee: false
    },
    
    // صلاحيات التقارير والمراقبة
    {
      key: 'can_view_reports',
      title: 'عرض التقارير',
      description: 'إمكانية عرض التقارير',
      icon: BarChart3,
      admin: true,
      employee: true
    },
    {
      key: 'can_export_reports',
      title: 'تصدير التقارير',
      description: 'إمكانية تصدير التقارير',
      icon: BarChart3,
      admin: true,
      employee: false
    },
    {
      key: 'can_view_audit_log',
      title: 'عرض سجل العمليات',
      description: 'إمكانية عرض سجل العمليات',
      icon: Activity,
      admin: true,
      employee: true
    },
    
    // صلاحيات الإشعارات والدعم
    {
      key: 'can_view_notifications',
      title: 'عرض الإشعارات',
      description: 'إمكانية عرض الإشعارات',
      icon: Bell,
      admin: true,
      employee: true
    },
    {
      key: 'can_send_notifications',
      title: 'إرسال الإشعارات',
      description: 'إمكانية إرسال إشعارات جديدة',
      icon: Bell,
      admin: true,
      employee: false
    },
    {
      key: 'can_view_support',
      title: 'عرض الدعم',
      description: 'إمكانية الوصول لصفحة الدعم',
      icon: MessageSquare,
      admin: true,
      employee: true
    },
    {
      key: 'can_process_complaints',
      title: 'معالجة الشكاوى',
      description: 'إمكانية معالجة شكاوى العملاء',
      icon: MessageSquare,
      admin: true,
      employee: false
    }
  ];

  // منع الأدمن من تعديل صلاحيات نفسه
  const handleEditPermissions = async (employeeId: string) => {
    if (user && user.id === employeeId) {
      alert('لا يمكنك تعديل صلاحيات الأدمن نفسه!');
      return;
    }
    const employeePerms = await getEmployeePermissions(employeeId);
    if (employeePerms) {
      setSelectedEmployee(employeeId);
      setTempPermissions({ ...employeePerms });
      setIsEditing(true);
    }
  };

  const handleSavePermissions = async () => {
    if (selectedEmployee && isEditing && tempPermissions) {
      try {
        await updateEmployeePermissions(selectedEmployee, tempPermissions);
        setIsEditing(false);
        setSelectedEmployee(null);
        setTempPermissions({});
        alert('تم حفظ الصلاحيات بنجاح!');
      } catch (error) {
        console.error('خطأ في حفظ الصلاحيات:', error);
        alert('حدث خطأ في حفظ الصلاحيات. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedEmployee(null);
    setTempPermissions({});
  };

  // منع تعديل صلاحيات الأدمن
  const togglePermission = (permissionKey: string) => {
    if (tempPermissions && selectedEmployee) {
      setTempPermissions({
        ...tempPermissions,
        [permissionKey]: !tempPermissions[permissionKey]
      });
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الصلاحيات</h1>
            <p className="text-gray-600">إدارة صلاحيات المستخدمين والموظفين</p>
          </div>
        </div>
        
        {/* رسالة خاصة للأدمن */}
        {isAdminWithAllPermissions() && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-1">🎉 مرحباً بك أيها المدير!</h3>
                <p className="text-sm text-purple-700">
                  لديك جميع الصلاحيات في النظام (20 صلاحية). يمكنك الوصول لجميع الأقسام والوظائف.
                  أنت المسؤول الكامل عن إدارة النظام والموظفين.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* رسالة توضيحية */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">تم تبسيط نظام الصلاحيات</h3>
              <p className="text-sm text-green-700">
                تم إعادة تنظيم نظام الصلاحيات بناءً على الصفحات الموجودة فعلياً في النظام.
                الآن الأدمن لديه جميع الصلاحيات (20 صلاحية)، والموظفين لديهم صلاحيات عرض محدودة.
                النظام أصبح أكثر وضوحاً وأماناً.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* معلومات المستخدم الحالي */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">المستخدم الحالي</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                user?.role === 'admin' 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
                {user?.name?.charAt(0) || 'م'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{user?.name || 'المستخدم'}</h3>
                <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user?.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.role === 'admin' ? '👑 مدير' : '👤 موظف'}
                  </span>
                  {isAdminWithAllPermissions() && (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      ✅ جميع الصلاحيات
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">إجمالي الصلاحيات</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(permissions).filter(Boolean).length}/20
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">الصلاحيات النشطة</p>
              <p className="text-2xl font-bold text-green-600">
                {Object.values(permissions).filter(Boolean).length}
              </p>
            </div>
          </div>
        
        {/* ملخص الصلاحيات */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">ملخص الصلاحيات:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_view_dashboard ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>لوحة التحكم</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_view_orders ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>الطلبات</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_view_live_map ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>الخريطة الحية</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_view_users ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>العملاء</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_modify_users ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>تعديل العملاء</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_view_merchants ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>التجار</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_modify_merchants ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>تعديل التجار</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_view_employees ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>الموظفين</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_modify_employees ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>تعديل الموظفين</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_view_products ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>المنتجات</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_add_products ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>إضافة المنتجات</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_view_inventory ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>المخزون</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_modify_inventory ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>تعديل المخزون</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_view_reports ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>التقارير</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_export_reports ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>تصدير التقارير</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_view_audit_log ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>سجل العمليات</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_view_notifications ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>الإشعارات</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_send_notifications ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>إرسال الإشعارات</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_view_support ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>الدعم</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${permissions.can_process_complaints ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>معالجة الشكاوى</span>
            </div>
          </div>
        </div>
      </div>

      {/* إدارة صلاحيات الموظفين - للمدير فقط */}
      {/* الأدمن فقط يمكنه تعديل صلاحيات الموظفين، ولا يمكنه تعديل صلاحيات نفسه */}
      {user?.role === 'admin' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">إدارة صلاحيات الموظفين</h2>
          
          {loadingEmployees ? (
            <p className="text-center py-8">جاري تحميل الموظفين...</p>
          ) : !isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee) => (
                employee.id === user?.id ? null : (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onEditPermissions={handleEditPermissions}
                    getEmployeePermissions={getEmployeePermissions}
                  />
                )
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  تعديل صلاحيات: {employees.find(e => e.id === selectedEmployee)?.name}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSavePermissions}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Save size={16} />
                    حفظ التغييرات
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <X size={16} />
                    إلغاء
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissionsList.map((permission) => (
                  <div key={permission.key} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <permission.icon size={16} className="text-gray-600" />
                        <h4 className="font-medium text-gray-900">{permission.title}</h4>
                      </div>
                      {/* لا يمكن تعديل صلاحيات الأدمن */}
                      <button
                        onClick={() => selectedEmployee && togglePermission(permission.key)}
                        className={`p-2 rounded-lg transition-colors ${
                          tempPermissions?.[permission.key]
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                        disabled={!selectedEmployee}
                      >
                        {tempPermissions?.[permission.key] ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{permission.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tempPermissions?.[permission.key]
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tempPermissions?.[permission.key] ? 'مفعلة' : 'معطلة'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* عرض الصلاحيات الحالية */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">الصلاحيات المتاحة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {permissionsList.map((permission) => (
            <div key={permission.key} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  permission.admin 
                    ? 'bg-green-500' 
                    : permission.employee 
                    ? 'bg-blue-500' 
                    : 'bg-gray-500'
                }`}>
                  <permission.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  {permissions[permission.key as keyof typeof permissions] ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{permission.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{permission.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">المدير:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    permission.admin 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {permission.admin ? 'متاح' : 'غير متاح'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">الموظف:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    permission.employee 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {permission.employee ? 'متاح' : 'غير متاح'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">حالتك:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    permissions[permission.key as keyof typeof permissions]
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {permissions[permission.key as keyof typeof permissions] ? 'مفعلة' : 'معطلة'}
                  </span>
                </div>
                {/* توضيح: الأدمن لا يمكن تعديل صلاحياته */}
                {user?.role === 'admin' && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-400">ملاحظة:</span>
                    <span className="text-gray-400">لا يمكن تعديل صلاحيات الأدمن</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 