"use client";

import { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import type { User, Permissions } from '../../lib/supabase';

interface EmployeeCardProps {
  employee: User;
  onEditPermissions: (employeeId: string) => void;
  getEmployeePermissions: (employeeId: string) => Promise<Permissions | null>;
}

export default function EmployeeCard({ employee, onEditPermissions, getEmployeePermissions }: EmployeeCardProps) {
  const [employeePerms, setEmployeePerms] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const perms = await getEmployeePermissions(employee.id);
        setEmployeePerms(perms);
      } catch (error) {
        console.error('Error fetching employee permissions:', error);
        setEmployeePerms(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [employee.id, getEmployeePermissions]);

  const permissionsList = [
    { key: 'can_view_dashboard', title: 'لوحة التحكم' },
    { key: 'can_view_orders', title: 'الطلبات' },
    { key: 'can_view_live_map', title: 'الخريطة الحية' },
    { key: 'can_view_users', title: 'العملاء' },
    { key: 'can_view_merchants', title: 'التجار' },
    { key: 'can_view_employees', title: 'الموظفين' },
    { key: 'can_view_products', title: 'المنتجات' },

    { key: 'can_view_reports', title: 'التقارير' },
    { key: 'can_view_audit_log', title: 'سجل العمليات' },
    { key: 'can_view_support', title: 'الدعم' },
    { key: 'can_view_permissions', title: 'الصلاحيات' },
    { key: 'can_modify_users', title: 'تعديل المستخدمين' },
    { key: 'can_assign_deliverer', title: 'تعيين موصل' },
    { key: 'can_add_products', title: 'إضافة منتجات' },
    { key: 'can_modify_prices', title: 'تعديل الأسعار' },
    { key: 'can_export_reports', title: 'تصدير تقارير' },
    { key: 'can_update_order_status', title: 'تحديث الطلبات' },

    { key: 'can_send_notifications', title: 'إرسال إشعارات' },
    { key: 'can_process_complaints', title: 'معالجة شكاوى' },
    { key: 'can_manage_merchants', title: 'إدارة التجار' },
    { key: 'can_manage_employees', title: 'إدارة الموظفين' },

  ];

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {employee.avatar || employee.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{employee.name}</h3>
            <p className="text-sm text-gray-600">{employee.email}</p>
          </div>
        </div>
        <button
          onClick={() => onEditPermissions(employee.id)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <Edit size={16} />
        </button>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          الصلاحيات النشطة: {loading ? '...' : (employeePerms ? Object.values(employeePerms).filter(Boolean).length : 0)}/22
        </p>
        <div className="flex flex-wrap gap-1">
          {loading ? (
            <span className="text-xs text-gray-500">جاري تحميل الصلاحيات...</span>
          ) : employeePerms ? (
            permissionsList.map((perm) => {
              const hasPerm = employeePerms[perm.key as keyof typeof employeePerms];
              return (
                <span
                  key={perm.key}
                  className={`px-2 py-1 text-xs rounded-full ${
                    hasPerm 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {perm.title}
                </span>
              );
            })
          ) : (
            <span className="text-xs text-red-500">خطأ في تحميل الصلاحيات</span>
          )}
        </div>
      </div>
    </div>
  );
} 