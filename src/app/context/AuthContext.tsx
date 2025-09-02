"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, permissionsService } from '../../lib/supabase-services';
import type { User, Permissions } from '../../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permissions;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (permission: keyof Permissions) => boolean;
  isAdminWithAllPermissions: () => boolean;
  // إدارة الصلاحيات للمدير
  updateEmployeePermissions: (employeeId: string, permissions: Partial<Permissions>) => void;
  getEmployeePermissions: (employeeId: string) => Promise<Permissions | null>;
  getAllEmployees: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};

// دالة لحساب الصلاحيات بناءً على الدور والصلاحيات المخصصة
const calculatePermissions = (role: 'admin' | 'employee', customPermissions?: Partial<Permissions>): Permissions => {
  const basePermissions = role === 'admin' ? {
    // صلاحيات أساسية - الأدمن لديه جميع الصلاحيات
    can_view_dashboard: true,
    can_view_orders: true,
    can_update_order_status: true,
    can_view_live_map: true,
    
  // صلاحيات المخزون
  can_view_inventory: true,
  can_modify_inventory: true,
    
    // صلاحيات إدارة المستخدمين
    can_view_users: true,
    can_modify_users: true,
    can_view_merchants: true,
    can_modify_merchants: true,
    can_view_employees: true,
    can_modify_employees: true,
    
    // صلاحيات إدارة المنتجات
    can_view_products: true,
    can_add_products: true,
    
    // صلاحيات التقارير والمراقبة
    can_view_reports: true,
    can_export_reports: true,
    can_view_audit_log: true,
    
    // صلاحيات الإشعارات والدعم
    can_view_notifications: true,
    can_send_notifications: true,
    can_view_support: true,
    can_process_complaints: true,
  } : {
    // صلاحيات الموظف - صلاحيات محدودة للعرض فقط
    can_view_dashboard: true,
    can_view_orders: true,
    can_update_order_status: true,
    can_view_live_map: true,
    
  // صلاحيات المخزون
  can_view_inventory: true,
  can_modify_inventory: false,
    
    // صلاحيات إدارة المستخدمين
    can_view_users: true,
    can_modify_users: false,
    can_view_merchants: true,
    can_modify_merchants: false,
    can_view_employees: true,
    can_modify_employees: false,
    
    // صلاحيات إدارة المنتجات
    can_view_products: true,
    can_add_products: false,
    
    // صلاحيات التقارير والمراقبة
    can_view_reports: true,
    can_export_reports: false,
    can_view_audit_log: true,
    
    // صلاحيات الإشعارات والدعم
    can_view_notifications: true,
    can_send_notifications: false,
    can_view_support: true,
    can_process_complaints: false,
  };

  // إذا كان هناك صلاحيات مخصصة، ندمجها مع الصلاحيات الأساسية
  if (customPermissions) {
    return { ...basePermissions, ...customPermissions };
  }

  return basePermissions;
};

// دالة لإعطاء الأدمن جميع الصلاحيات
const giveAdminAllPermissions = (): Permissions => {
  return {
    // صلاحيات أساسية
    can_view_dashboard: true,
    can_view_orders: true,
    can_update_order_status: true,
    can_view_live_map: true,
    
  // صلاحيات المخزون
  can_view_inventory: true,
  can_modify_inventory: true,
    
    // صلاحيات إدارة المستخدمين
    can_view_users: true,
    can_modify_users: true,
    can_view_merchants: true,
    can_modify_merchants: true,
    can_view_employees: true,
    can_modify_employees: true,
    
    // صلاحيات إدارة المنتجات
    can_view_products: true,
    can_add_products: true,
    
    // صلاحيات التقارير والمراقبة
    can_view_reports: true,
    can_export_reports: true,
    can_view_audit_log: true,
    
    // صلاحيات الإشعارات والدعم
    can_view_notifications: true,
    can_send_notifications: true,
    can_view_support: true,
    can_process_complaints: true,
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permissions>({
    // صلاحيات أساسية
    can_view_dashboard: false,
    can_view_orders: false,
    can_update_order_status: false,
    can_view_live_map: false,
    
  // صلاحيات المخزون
  can_view_inventory: false,
  can_modify_inventory: false,
    
    // صلاحيات إدارة المستخدمين
    can_view_users: false,
    can_modify_users: false,
    can_view_merchants: false,
    can_modify_merchants: false,
    can_view_employees: false,
    can_modify_employees: false,
    
    // صلاحيات إدارة المنتجات
    can_view_products: false,
    can_add_products: false,
    
    // صلاحيات التقارير والمراقبة
    can_view_reports: false,
    can_export_reports: false,
    can_view_audit_log: false,
    
    // صلاحيات الإشعارات والدعم
    can_view_notifications: false,
    can_send_notifications: false,
    can_view_support: false,
    can_process_complaints: false,
  });

  // التحقق من وجود مستخدم محفوظ عند تحميل التطبيق
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const savedPermissions = localStorage.getItem('userPermissions');
        
        setUser(userData);
        
        // إذا كان المستخدم أدمن، أعطه جميع الصلاحيات
        if (userData.role === 'admin') {
          const adminPermissions = giveAdminAllPermissions();
          setPermissions(adminPermissions);
          localStorage.setItem('userPermissions', JSON.stringify(adminPermissions));
        } else if (savedPermissions) {
          const parsedPermissions = JSON.parse(savedPermissions);
          setPermissions(parsedPermissions);
        } else {
          setPermissions(calculatePermissions(userData.role));
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('userPermissions');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // استخدام خدمة Supabase للمصادقة
      const result = await authService.login(email, password);
      
      if (result) {
        setUser({
          ...result.user,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        // إذا كان المستخدم أدمن، أعطه جميع الصلاحيات
        const userPermissions = result.user.role === 'admin' 
          ? giveAdminAllPermissions() 
          : result.permissions;
        
        setPermissions(userPermissions);
        
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('userPermissions', JSON.stringify(userPermissions));
        
        console.log('تم تسجيل الدخول بنجاح:', result.user.name);
        console.log('صلاحيات المستخدم:', userPermissions);
        return true;
      } else {
        console.log('فشل في تسجيل الدخول: بيانات غير صحيحة');
        return false;
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setPermissions({
      // صلاحيات أساسية
      can_view_dashboard: false,
      can_view_orders: false,
      can_update_order_status: false,
      can_view_live_map: false,
      
  // صلاحيات المخزون
  can_view_inventory: false,
  can_modify_inventory: false,
      
      // صلاحيات إدارة المستخدمين
      can_view_users: false,
      can_modify_users: false,
      can_view_merchants: false,
      can_modify_merchants: false,
      can_view_employees: false,
      can_modify_employees: false,
      
      // صلاحيات إدارة المنتجات
      can_view_products: false,
      can_add_products: false,
      
      // صلاحيات التقارير والمراقبة
      can_view_reports: false,
      can_export_reports: false,
      can_view_audit_log: false,
      
      // صلاحيات الإشعارات والدعم
      can_view_notifications: false,
      can_send_notifications: false,
      can_view_support: false,
      can_process_complaints: false,
    });
    
    // حذف البيانات من localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('userPermissions');
    
    console.log('تم تسجيل الخروج بنجاح');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // إذا كان المستخدم أدمن، أعطه جميع الصلاحيات
      if (updatedUser.role === 'admin') {
        const adminPermissions = giveAdminAllPermissions();
        setPermissions(adminPermissions);
        localStorage.setItem('userPermissions', JSON.stringify(adminPermissions));
      } else {
        setPermissions(calculatePermissions(updatedUser.role));
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const hasPermission = (permission: keyof Permissions): boolean => {
    return permissions[permission] || false;
  };

  // دالة للتحقق من أن المستخدم أدمن ولديه جميع الصلاحيات
  const isAdminWithAllPermissions = (): boolean => {
    return user?.role === 'admin' && Object.values(permissions).every(perm => perm === true);
  };

  // دوال إدارة الصلاحيات للمدير
  const updateEmployeePermissions = async (employeeId: string, newPermissions: Partial<Permissions>) => {
    try {
      console.log('updateEmployeePermissions called:', { employeeId, newPermissions });
      // جلب بيانات الموظف المستهدف
      const targetUser = await permissionsService.getUserById(employeeId);
      let permissionsToSet = newPermissions;
      // إذا كان الموظف المستهدف أدمن، أعطه جميع الصلاحيات دائماً
      if (targetUser && targetUser.role === 'admin') {
        permissionsToSet = giveAdminAllPermissions();
      }
      // استخدام خدمة Supabase لتحديث الصلاحيات
      await permissionsService.updateUserPermissions(employeeId, permissionsToSet);
      // إذا كان المستخدم الحالي هو المستهدف، حدث صلاحياته
      if (user && user.id === employeeId) {
        const updatedPermissions = targetUser && targetUser.role === 'admin'
          ? giveAdminAllPermissions()
          : { ...permissions, ...newPermissions };
        setPermissions(updatedPermissions);
        localStorage.setItem('userPermissions', JSON.stringify(updatedPermissions));
        console.log('تم تحديث صلاحيات المستخدم الحالي:', updatedPermissions);
      }
      console.log(`تم تحديث صلاحيات الموظف ${employeeId}:`, permissionsToSet);
    } catch (error) {
      console.error('Error updating employee permissions:', error);
      throw error;
    }
  };

  const getEmployeePermissions = async (employeeId: string): Promise<Permissions | null> => {
    try {
      return await permissionsService.getUserPermissions(employeeId);
    } catch (error) {
      console.error('Error getting employee permissions:', error);
      return null;
    }
  };

  const getAllEmployees = async (): Promise<User[]> => {
    try {
      return await permissionsService.getAllEmployees();
    } catch (error) {
      console.error('Error getting all employees:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      permissions,
      login,
      logout,
      updateUser,
      hasPermission,
      isAdminWithAllPermissions,
      updateEmployeePermissions,
      getEmployeePermissions,
      getAllEmployees,
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 