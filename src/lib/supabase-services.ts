import { supabase } from './supabase';
import type { User, Permissions, Order, Customer, Merchant, Employee, Product, Inventory, Notification, AuditLog } from './supabase';

// =====================================================
// AUTHENTICATION SERVICES
// =====================================================

export const authService = {
  // تسجيل الدخول
  async login(email: string, password: string) {
    try {
      // التحقق من كلمة المرور (في الإنتاج، استخدم تشفير قوي)
      // هنا نفترض أن كلمة المرور هي "123456" لجميع المستخدمين
      if (password !== '123456') {
        throw new Error('كلمة المرور غير صحيحة');
      }

      // محاولة جلب المستخدم من قاعدة البيانات
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      // إذا لم يتم العثور على المستخدم في قاعدة البيانات، استخدم بيانات افتراضية
      if (error || !user) {
        console.warn('User not found in database, using fallback data');
        
        // بيانات افتراضية للمستخدمين
        const fallbackUsers = {
          'admin@example.com': {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'المدير العام',
            email: 'admin@example.com',
            role: 'admin',
            avatar: 'م'
          },
          'employee@example.com': {
            id: '550e8400-e29b-41d4-a716-446655440002',
            name: 'أحمد محمد',
            email: 'employee@example.com',
            role: 'employee',
            avatar: 'أ'
          },
          'sara@example.com': {
            id: '550e8400-e29b-41d4-a716-446655440003',
            name: 'سارة أحمد',
            email: 'sara@example.com',
            role: 'employee',
            avatar: 'س'
          },
          'mohammed@example.com': {
            id: '550e8400-e29b-41d4-a716-446655440004',
            name: 'محمد علي',
            email: 'mohammed@example.com',
            role: 'employee',
            avatar: 'م'
          }
        };

        const fallbackUser = fallbackUsers[email as keyof typeof fallbackUsers];
        if (!fallbackUser) {
          throw new Error('بيانات غير صحيحة');
        }

        return {
          user: fallbackUser,
          permissions: {}
        };
      }
      
      // جلب الصلاحيات
      const { data: permissions, error: permError } = await supabase
        .from('permissions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (permError) {
        console.error('Error fetching permissions:', permError);
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        },
        permissions: permissions || {}
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // تسجيل الخروج
  async logout() {
    // في التطبيق الحقيقي، ستستخدم Supabase Auth
    return true;
  },

  // التحقق من المستخدم الحالي
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
};

// =====================================================
// PERMISSIONS SERVICES
// =====================================================

export const permissionsService = {
  // جلب صلاحيات المستخدم
  async getUserPermissions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user permissions error:', error);
      return null;
    }
  },

  // جلب بيانات مستخدم واحد عبر id
  async getUserById(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user by id error:', error);
      return null;
    }
  },

  // تحديث صلاحيات المستخدم
  async updateUserPermissions(userId: string, permissions: Partial<Permissions>) {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .upsert({
          user_id: userId,
          ...permissions
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update user permissions error:', error);
      throw error;
    }
  },

  // جلب جميع الموظفين
  async getAllEmployees() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'employee')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get all employees error:', error);
      return [];
    }
  }
};

// =====================================================
// ORDERS SERVICES
// =====================================================

export const ordersService = {
  // جلب جميع الطلبات
  async getAllOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers(name, email, phone),
          merchants(name, email, phone),
          employees(name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get all orders error:', error);
      return [];
    }
  },

  // جلب طلب واحد
  async getOrder(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers(name, email, phone),
          merchants(name, email, phone),
          employees(name, email, phone)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get order error:', error);
      return null;
    }
  },

  // إنشاء طلب جديد
  async createOrder(orderData: Partial<Order>) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  // تحديث حالة الطلب
  async updateOrderStatus(orderId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }
};

// =====================================================
// CUSTOMERS SERVICES
// =====================================================

export const customersService = {
  // جلب جميع العملاء
  async getAllCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get all customers error:', error);
      return [];
    }
  },

  // إنشاء عميل جديد
  async createCustomer(customerData: Partial<Customer>) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create customer error:', error);
      throw error;
    }
  },

  // تحديث بيانات العميل
  async updateCustomer(customerId: string, customerData: Partial<Customer>) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({ ...customerData, updated_at: new Date().toISOString() })
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update customer error:', error);
      throw error;
    }
  }
};

// =====================================================
// MERCHANTS SERVICES
// =====================================================

export const merchantsService = {
  // جلب جميع التجار
  async getAllMerchants() {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get all merchants error:', error);
      return [];
    }
  },

  // إنشاء تاجر جديد
  async createMerchant(merchantData: Partial<Merchant>) {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .insert(merchantData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create merchant error:', error);
      throw error;
    }
  },

  // تحديث بيانات التاجر
  async updateMerchant(merchantId: string, merchantData: Partial<Merchant>) {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .update({ ...merchantData, updated_at: new Date().toISOString() })
        .eq('id', merchantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update merchant error:', error);
      throw error;
    }
  }
};

// =====================================================
// EMPLOYEES SERVICES
// =====================================================

export const employeesService = {
  // جلب جميع الموظفين
  async getAllEmployees() {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get all employees error:', error);
      return [];
    }
  },

  // إنشاء موظف جديد
  async createEmployee(employeeData: Partial<Employee>) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create employee error:', error);
      throw error;
    }
  },

  // تحديث بيانات الموظف
  async updateEmployee(employeeId: string, employeeData: Partial<Employee>) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({ ...employeeData, updated_at: new Date().toISOString() })
        .eq('id', employeeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update employee error:', error);
      throw error;
    }
  }
};

// =====================================================
// PRODUCTS SERVICES
// =====================================================

export const productsService = {
  // جلب جميع المنتجات
  async getAllProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          merchants(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get all products error:', error);
      return [];
    }
  },

  // إنشاء منتج جديد
  async createProduct(productData: Partial<Product>) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  },

  // تحديث بيانات المنتج
  async updateProduct(productId: string, productData: Partial<Product>) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ ...productData, updated_at: new Date().toISOString() })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }
};

// =====================================================
// INVENTORY SERVICES
// =====================================================

export const inventoryService = {
  // جلب جميع المخزون
  async getAllInventory() {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products(name, price, category)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get all inventory error:', error);
      return [];
    }
  },

  // تحديث كمية المخزون
  async updateInventoryQuantity(inventoryId: string, quantity: number) {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update({ 
          quantity, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', inventoryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update inventory quantity error:', error);
      throw error;
    }
  }
};

// =====================================================
// NOTIFICATIONS SERVICES
// =====================================================

export const notificationsService = {
  // جلب الإشعارات للمستخدم
  async getUserNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`target_user_id.eq.${userId},target_role.eq.all`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user notifications error:', error);
      return [];
    }
  },

  // إنشاء إشعار جديد
  async createNotification(notificationData: Partial<Notification>) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  },

  // تحديث حالة الإشعار
  async markNotificationAsRead(notificationId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }
};

// =====================================================
// AUDIT LOG SERVICES
// =====================================================

export const auditLogService = {
  // إنشاء سجل تدقيق
  async createAuditLog(auditData: Partial<AuditLog>) {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .insert(auditData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create audit log error:', error);
      throw error;
    }
  },

  // جلب سجلات التدقيق
  async getAuditLogs(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select(`
          *,
          users(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get audit logs error:', error);
      return [];
    }
  }
}; 