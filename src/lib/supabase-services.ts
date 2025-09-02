import { supabase } from './supabase';
import type { User, Permissions, Order, Customer, Merchant, Employee, Product, AuditLog, Ad, Slogan, DeliveryCaptain, DeliveryWorkLog, DeliveryPerformanceMonthly } from './supabase';

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

// مخطط جديد للتجار وفق SQL المرسل
export type MerchantDb = {
  merchant_id: string;
  store_name: string;
  owner_name: string;
  phone_e164?: string | null;
  phone_display?: string | null;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  terms_accepted_at?: string | null;
  created_at: string;
  updated_at: string;
};

export const merchantsService = {
  // جلب جميع التجار بالمخطط الجديد
  async getAllMerchants(): Promise<MerchantDb[]> {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select(
          'merchant_id, store_name, owner_name, phone_e164, phone_display, address, status, terms_accepted_at, created_at, updated_at'
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as MerchantDb[];
    } catch (error) {
      console.error('Get all merchants error:', error);
      return [] as MerchantDb[];
    }
  },

  // إنشاء تاجر جديد بالمخطط الجديد
  async createMerchant(payload: Partial<MerchantDb>): Promise<MerchantDb> {
    try {
      const insertPayload = {
        store_name: payload.store_name,
        owner_name: payload.owner_name,
        phone_e164: payload.phone_e164 ?? payload.phone_display ?? null,
        phone_display: payload.phone_display ?? payload.phone_e164 ?? null,
        address: payload.address,
        status: (payload.status as MerchantDb['status']) ?? 'pending',
        terms_accepted_at: payload.terms_accepted_at ?? null
      };

      const { data, error } = await supabase
        .from('merchants')
        .insert(insertPayload)
        .select(
          'merchant_id, store_name, owner_name, phone_e164, phone_display, address, status, terms_accepted_at, created_at, updated_at'
        )
        .single();

      if (error) throw error;
      return data as MerchantDb;
    } catch (error) {
      console.error('Create merchant error:', error);
      throw error;
    }
  },

  // تحديث بيانات التاجر بالمخطط الجديد
  async updateMerchant(merchantId: string, updates: Partial<MerchantDb>): Promise<MerchantDb> {
    try {
      const updatePayload = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('merchants')
        .update(updatePayload)
        .eq('merchant_id', merchantId)
        .select(
          'merchant_id, store_name, owner_name, phone_e164, phone_display, address, status, terms_accepted_at, created_at, updated_at'
        )
        .single();

      if (error) throw error;
      return data as MerchantDb;
    } catch (error) {
      console.error('Update merchant error:', error);
      throw error;
    }
  },

  async deleteMerchant(merchantId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('merchants')
        .delete()
        .eq('merchant_id', merchantId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete merchant error:', error);
      throw error;
    }
  }
};

// =====================================================
// MERCHANT DOCUMENTS SERVICES
// =====================================================

export const merchantDocumentsService = {
  async listDocuments(merchantId: string) {
    const { data, error } = await supabase
      .from('merchant_documents')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addDocument(payload: { merchant_id: string; doc_type: string; file_name: string; file_path: string; mime_type?: string; }) {
    const { data, error } = await supabase
      .from('merchant_documents')
      .insert({ ...payload })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDocument(id: string) {
    const { error } = await supabase
      .from('merchant_documents')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  // رفع ملف إلى Bucket عام (img) داخل مسار merchants/<merchant_id>/docs/
  async uploadMerchantDoc(file: File, merchantId: string) {
    const bucket = process.env.NEXT_PUBLIC_DOCS_BUCKET || 'img';
    const cleanFile = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_').toLowerCase();
    const path = `merchants/${merchantId}/docs/${Date.now()}-${cleanFile}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return { path, publicUrl };
  }
};

// =====================================================
// DELIVERY CAPTAINS SERVICES
// =====================================================

const CAPTAINS_BUCKET = process.env.NEXT_PUBLIC_CAPTAINS_BUCKET || 'captain-profiles';

export const deliveryCaptainsService = {
  // جلب جميع كباتن التوصيل
  async getAllDeliveryCaptains() {
    try {
      const { data, error } = await supabase
        .from('delivery_captains')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Get all delivery captains error:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        status: error?.status,
        error
      });
      // Fallback: use employees as delivery captains if dedicated table is missing
      try {
        const { data: employees, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('role', 'deliverer')
          .order('created_at', { ascending: false });
        if (empError) throw empError;
        return employees;
      } catch (fallbackError: any) {
        console.error('Fallback (employees) captains error:', {
          message: fallbackError?.message,
          code: fallbackError?.code,
          details: fallbackError?.details,
          hint: fallbackError?.hint,
          status: fallbackError?.status,
          error: fallbackError
        });
        return [];
      }
    }
  },

  // جلب كابتن توصيل واحد
  async getDeliveryCaptain(captainId: string) {
    try {
      const { data, error } = await supabase
        .from('delivery_captains')
        .select('*')
        .eq('id', captainId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get delivery captain error:', error);
      return null;
    }
  },

  // إنشاء كابتن توصيل جديد
  async createDeliveryCaptain(captainData: Partial<DeliveryCaptain>) {
    try {
      const { data, error } = await supabase
        .from('delivery_captains')
        .insert({
          ...captainData,
          avatar: captainData.name?.charAt(0) || 'ك',
          department: 'التوصيل',
          join_date: new Date().toISOString(),
          performance: 0,
          tasks: 0,
          completed: 0,
          rating: 0,
          total_deliveries: 0,
          total_earnings: 0,
          commission_rate: 0,
          is_verified: false,
          background_check_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create delivery captain error:', error);
      throw error;
    }
  },

  // تحديث بيانات كابتن التوصيل
  async updateDeliveryCaptain(captainId: string, captainData: Partial<DeliveryCaptain>) {
    try {
      const { data, error } = await supabase
        .from('delivery_captains')
        .update({ ...captainData, updated_at: new Date().toISOString() })
        .eq('id', captainId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update delivery captain error:', error);
      throw error;
    }
  },

  // حذف كابتن التوصيل
  async deleteDeliveryCaptain(captainId: string) {
    try {
      const { error } = await supabase
        .from('delivery_captains')
        .delete()
        .eq('id', captainId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete delivery captain error:', error);
      throw error;
    }
  },

  // جلب سجلات العمل لكابتن التوصيل
  async getCaptainWorkLogs(captainId: string) {
    try {
      const { data, error } = await supabase
        .from('delivery_work_logs')
        .select('*')
        .eq('captain_id', captainId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get captain work logs error:', error);
      return [];
    }
  },

  // إضافة سجل عمل جديد
  async createWorkLog(workLogData: Partial<DeliveryWorkLog>) {
    try {
      const { data, error } = await supabase
        .from('delivery_work_logs')
        .insert(workLogData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create work log error:', error);
      throw error;
    }
  },

  // جلب الأداء الشهري لكابتن التوصيل
  async getCaptainPerformance(captainId: string, year?: number, month?: number) {
    try {
      let query = supabase
        .from('delivery_performance_monthly')
        .select('*')
        .eq('captain_id', captainId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (year && month) {
        query = query.eq('year', year).eq('month', month);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get captain performance error:', error);
      return [];
    }
  },

  // رفع صورة شخصية لكابتن التوصيل
  async uploadCaptainProfileImage(file: File, fileName: string) {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `captains/${fileName}.${fileExt}`;

      // محاولة الرفع على البكت المحدد أو الافتراضي
      const tryUpload = async (bucket: string) => {
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);
        return { uploadError };
      };

      let { uploadError } = await tryUpload(CAPTAINS_BUCKET);

      // في حال لم يوجد البكت، جرّب البكت 'img' كخطة بديلة
      if (uploadError && /Bucket not found/i.test(String(uploadError.message))) {
        const fallbackBucket = 'img';
        const res = await tryUpload(fallbackBucket);
        uploadError = res.uploadError;
        if (!uploadError) {
          // الحصول على الرابط العام من البكت الاحتياطي
          const { data: { publicUrl } } = supabase.storage
            .from(fallbackBucket)
            .getPublicUrl(filePath);
          return { success: true, path: filePath, publicUrl };
        }
      }

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // الحصول على الرابط العام من البكت المعلن
      const { data: { publicUrl } } = supabase.storage
        .from(CAPTAINS_BUCKET)
        .getPublicUrl(filePath);

      return {
        success: true,
        path: filePath,
        publicUrl: publicUrl
      };
    } catch (error) {
      console.error('Upload captain profile image error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في رفع الصورة'
      };
    }
  },

  // حذف صورة شخصية لكابتن التوصيل
  async deleteCaptainProfileImage(storagePathOrUrl: string) {
    try {
      // Accept either a raw storage path (e.g., captains/abc.png) or a full public URL
      const extractPath = (value: string): string => {
        if (!value) return value as unknown as string;
        try {
          // If URL, derive the path after the bucket name
          const url = new URL(value);
          // Public URL format: https://.../storage/v1/object/public/<bucket>/<path>
          const idx = url.pathname.indexOf(`/object/public/`);
          if (idx !== -1) {
            const after = url.pathname.substring(idx + `/object/public/`.length);
            const parts = after.split('/');
            // drop bucket segment
            return parts.slice(1).join('/');
          }
          // Signed URLs may look different; try to find bucket name in path
          const bucketIdx = url.pathname.indexOf(`/${CAPTAINS_BUCKET}/`);
          if (bucketIdx !== -1) {
            return url.pathname.substring(bucketIdx + CAPTAINS_BUCKET.length + 2);
          }
        } catch {
          // Not a URL, treat as plain path
        }
        return value;
      };

      const storagePath = extractPath(storagePathOrUrl);

      let { error } = await supabase.storage
        .from(CAPTAINS_BUCKET)
        .remove([storagePath]);

      if (error && /Bucket not found/i.test(String(error.message))) {
        // جرّب البكت الاحتياطي
        const res = await supabase.storage
          .from('img')
          .remove([storagePath]);
        error = res.error as any;
      }

      if (error) {
        console.error('Delete captain profile image error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Delete captain profile image error:', error);
      return false;
    }
  },

  // الحصول على الرابط العام لصورة كابتن التوصيل
  getCaptainProfileUrl(storagePath: string) {
    const { data: { publicUrl } } = supabase.storage
      .from(CAPTAINS_BUCKET)
      .getPublicUrl(storagePath);
    return publicUrl;
  },

  // حساب إحصائيات كابتن التوصيل
  async calculateCaptainStats(captainId: string) {
    try {
      const { data, error } = await supabase.rpc('calculate_captain_performance', {
        captain_uuid: captainId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Calculate captain stats error:', error);
      return null;
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