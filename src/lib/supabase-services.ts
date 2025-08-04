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

  // جلب جميع التنبيهات
  async getAllNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get all notifications error:', error);
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
  },

  // حذف تنبيه
  async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete notification error:', error);
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

// =====================================================
// ADS SERVICES - خدمات الإعلانات
// =====================================================

export const adsService = {
  // جلب جميع الإعلانات
  async getAllAds() {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get all ads error:', error);
      return [];
    }
  },

  // إنشاء إعلان جديد
  async createAd(adData: Partial<Ad>) {
    try {
      // إضافة القيم الافتراضية إذا لم يتم توفيرها
      const adWithDefaults = {
        storage_bucket: 'img',
        ...adData
      };

      // إذا كان image_url يحتوي على رابط كامل، استخدمه كما هو
      // وإلا، افترض أنه مسار محلي واحصل على الرابط العام
      if (adData.image_url && !adData.image_url.startsWith('http')) {
        // تحويل المسار المحلي إلى رابط عام
        adWithDefaults.image_url = this.getPublicUrl(adData.image_url);
      }

      const { data, error } = await supabase
        .from('ads')
        .insert(adWithDefaults)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create ad error:', error);
      throw error;
    }
  },

  // تحديث إعلان
  async updateAd(adId: string, adData: Partial<Ad>) {
    try {
      const { data, error } = await supabase
        .from('ads')
        .update(adData)
        .eq('id', adId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update ad error:', error);
      throw error;
    }
  },

  // حذف إعلان
  async deleteAd(adId: string) {
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete ad error:', error);
      throw error;
    }
  },

  // رفع صورة إعلان إلى Storage
  async uploadAdImage(file: File, fileName: string) {
    try {
      // تنظيف اسم الملف للتأكد من أنه آمن
      const cleanFileName = fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\s+/g, '_')
        .toLowerCase();
      
      const storagePath = `ads/${cleanFileName}`;
      
      console.log('📤 رفع الملف إلى Storage:', storagePath);
      
      const { data, error } = await supabase.storage
        .from('img')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ خطأ في رفع الملف:', error);
        throw error;
      }

      // الحصول على الرابط العام المباشر
      const publicUrl = this.getPublicUrl(storagePath);
      
      console.log('✅ تم رفع الملف بنجاح:', storagePath);
      console.log('🔗 الرابط العام:', publicUrl);
      
      return {
        path: storagePath,
        publicUrl: publicUrl,
        success: true
      };
    } catch (error) {
      console.error('Error uploading ad image:', error);
      return null;
    }
  },

  // الحصول على رابط الصورة العامة
  getPublicUrl(storagePath: string) {
    const { data } = supabase.storage
      .from('img')
      .getPublicUrl(storagePath);
    
    return data.publicUrl;
  },

  // حذف صورة إعلان من Storage
  async deleteAdImage(storagePath: string) {
    try {
      const { error } = await supabase.storage
        .from('img')
        .remove([storagePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting ad image:', error);
      return false;
    }
  }
};



// =====================================================
// SLOGANS SERVICES - خدمات الشعارات
// =====================================================

export const slogansService = {
  // جلب جميع الشعارات
  async getAllSlogans() {
    try {
      const { data, error } = await supabase
        .from('slogans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get all slogans error:', error);
      return [];
    }
  },

  // إنشاء شعار جديد
  async createSlogan(sloganData: Partial<Slogan>) {
    try {
      const { data, error } = await supabase
        .from('slogans')
        .insert(sloganData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create slogan error:', error);
      throw error;
    }
  },

  // تحديث شعار
  async updateSlogan(sloganId: string, sloganData: Partial<Slogan>) {
    try {
      const { data, error } = await supabase
        .from('slogans')
        .update({ ...sloganData, updated_at: new Date().toISOString() })
        .eq('id', sloganId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update slogan error:', error);
      throw error;
    }
  },

  // حذف شعار
  async deleteSlogan(sloganId: string) {
    try {
      const { error } = await supabase
        .from('slogans')
        .delete()
        .eq('id', sloganId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete slogan error:', error);
      throw error;
    }
  }
}; 