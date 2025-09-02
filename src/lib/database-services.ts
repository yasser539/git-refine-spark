import { supabase } from './supabase';

// تصدير supabase للاستخدام المباشر إذا لزم الأمر
export { supabase };

// =====================================================
// STORAGE SERVICES - خدمات تخزين الملفات
// =====================================================

export const storageService = {
  // رفع صورة منتج إلى Supabase Storage
  async uploadProductImage(file: File, productId?: string): Promise<string | null> {
    try {
      console.log('Uploading product image to Supabase Storage...');
      
      // إنشاء اسم فريد للملف
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `img/${fileName}`;
      
      // رفع الملف إلى bucket
      const { data, error } = await supabase.storage
        .from('img')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase storage error:', error);
        throw new Error(`فشل في رفع الصورة: ${error.message}`);
      }

      // الحصول على URL العام للصورة
      const { data: urlData } = supabase.storage
        .from('img')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading product image:', error);
      return null;
    }
  },

  // حذف صورة منتج من Supabase Storage
  async deleteProductImage(imageUrl: string): Promise<boolean> {
    try {
      console.log('Deleting product image from Supabase Storage...');
      
      // استخراج مسار الملف من URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(-2).join('/'); // img/filename.ext
      
      const { error } = await supabase.storage
        .from('img')
        .remove([filePath]);

      if (error) {
        console.error('Supabase storage error:', error);
        throw new Error(`فشل في حذف الصورة: ${error.message}`);
      }

      console.log('Image deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting product image:', error);
      return false;
    }
  },

  // الحصول على قائمة الصور في bucket
  async listProductImages(): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from('img')
        .list('', {
          limit: 100,
          offset: 0
        });

      if (error) {
        console.error('Supabase storage error:', error);
        throw error;
      }

      return data.map(file => {
        const { data: urlData } = supabase.storage
          .from('img')
          .getPublicUrl(`${file.name}`);
        return urlData.publicUrl;
      });
    } catch (error) {
      console.error('Error listing product images:', error);
      return [];
    }
  }
};

// =====================================================
// DATABASE SERVICES - جلب البيانات من قاعدة البيانات
// =====================================================

export const databaseService = {
  // اختبار الاتصال بقاعدة البيانات
  async testConnection() {
    try {
      console.log('Testing database connection...');
      const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('Database connection test successful');
      return true;
    } catch (error) {
      console.error('Database connection test error:', error);
      return false;
    }
  },

  // جلب العملاء من قاعدة البيانات
  async getCustomers() {
    try {
      console.log('Attempting to fetch customers from database...');
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Customers fetched successfully:', data?.length || 0, 'customers');
      return data || [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Return empty array to prevent app crash
      return [];
    }
  },

  // إضافة عميل جديد إلى قاعدة البيانات
  async addCustomer(customerData: {
    name: string;
    phone: string;
    address: string;
  }) {
    try {
      console.log('Adding new customer to database:', customerData);
      
      // التحقق من البيانات
      if (!customerData.name || !customerData.phone || !customerData.address) {
        throw new Error('جميع الحقول مطلوبة');
      }

      const customerToInsert = {
        name: customerData.name.trim(),
        phone: customerData.phone.trim(),
        address: customerData.address.trim(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Customer data to insert:', customerToInsert);
      
      const { data, error } = await supabase
        .from('customers')
        .insert([customerToInsert])
        .select('*');

      if (error) {
        console.error('Supabase error adding customer:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`فشل في إضافة العميل: ${error.message}`);
      }
      
      console.log('Customer added successfully:', data);
      return data?.[0] || null;
    } catch (error) {
      console.error('Error adding customer:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('حدث خطأ غير متوقع في إضافة العميل');
    }
  },

  // تحديث بيانات العميل في قاعدة البيانات
  async updateCustomer(customerId: string, updateData: {
    name?: string;
    phone?: string;
    address?: string;
    is_active?: boolean;
  }) {
    try {
      console.log('Updating customer in database:', customerId, updateData);
      
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .select();

      if (error) {
        console.error('Supabase error updating customer:', error);
        throw error;
      }
      
      console.log('Customer updated successfully:', data);
      return data?.[0] || null;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // حذف العميل من قاعدة البيانات
  async deleteCustomer(customerId: string) {
    try {
      console.log('Deleting customer from database:', customerId);
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) {
        console.error('Supabase error deleting customer:', error);
        throw error;
      }
      
      console.log('Customer deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // جلب كباتن التوصيل من قاعدة البيانات
  async getDeliveryCaptains() {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('role', 'deliverer')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching delivery captains:', error);
      return [];
    }
  },

  // جلب الطلبات من قاعدة البيانات
  async getOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers(name, phone),
          employees(name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  // جلب المنتجات من قاعدة البيانات
  async getProducts() {
    try {
      console.log('Attempting to fetch products from database...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching products:', error);
        throw error;
      }
      
      console.log('Products fetched successfully:', data?.length || 0, 'products');
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return empty array to prevent app crash
      return [];
    }
  },

  // إضافة منتج جديد إلى قاعدة البيانات
  async addProduct(productData: {
    name: string;
    description: string;
    price: number;
    category: string;
    image_url?: string;
    status: string;
    total_sold: number;
    rating: number;
    imageFile?: File;
  }) {
    try {
      console.log('Adding new product to database:', productData);
      
      // التحقق من البيانات
      if (!productData.name || !productData.description || !productData.price || !productData.category) {
        throw new Error('جميع الحقول مطلوبة');
      }

      let imageUrl = productData.image_url || "/icon/iconApp.png";
      
      // رفع الصورة إذا تم توفير ملف
      if (productData.imageFile) {
        const uploadedImageUrl = await storageService.uploadProductImage(productData.imageFile);
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        }
      }

      const productToInsert = {
        name: productData.name.trim(),
        description: productData.description.trim(),
        price: productData.price,
        category: productData.category.trim(),
        image_url: imageUrl,
        status: productData.status,
        total_sold: productData.total_sold || 0,
        rating: productData.rating || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Product data to insert:', productToInsert);
      
      const { data, error } = await supabase
        .from('products')
        .insert([productToInsert])
        .select('*');

      if (error) {
        console.error('Supabase error adding product:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`فشل في إضافة المنتج: ${error.message}`);
      }
      
      console.log('Product added successfully:', data);
      return data?.[0] || null;
    } catch (error) {
      console.error('Error adding product:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('حدث خطأ غير متوقع في إضافة المنتج');
    }
  },

  // تحديث منتج في قاعدة البيانات
  async updateProduct(productId: string, updateData: {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    image_url?: string;
    status?: string;
    total_sold?: number;
    rating?: number;
  }) {
    try {
      console.log('Updating product in database:', productId, updateData);
      
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select();

      if (error) {
        console.error('Supabase error updating product:', error);
        throw error;
      }
      
      console.log('Product updated successfully:', data);
      return data?.[0] || null;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // حذف منتج من قاعدة البيانات
  async deleteProduct(productId: string) {
    try {
      console.log('Deleting product from database:', productId);
      
      // جلب معلومات المنتج أولاً لحذف الصورة
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('image_url')
        .eq('id', productId)
        .single();

      if (fetchError) {
        console.error('Supabase error fetching product:', fetchError);
        throw fetchError;
      }

      // حذف الصورة من Storage إذا لم تكن الصورة الافتراضية
      if (product?.image_url && !product.image_url.includes('/icon/iconApp.png')) {
        try {
          await storageService.deleteProductImage(product.image_url);
        } catch (imageError) {
          console.warn('Failed to delete product image:', imageError);
          // لا نوقف العملية إذا فشل حذف الصورة
        }
      }

      // حذف المنتج من قاعدة البيانات
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Supabase error deleting product:', error);
        throw error;
      }
      
      console.log('Product deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // جلب المخزون من قاعدة البيانات
  async getInventory() {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products(name, price, category)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  },

  // جلب التجار من قاعدة البيانات
  async getMerchants() {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching merchants:', error);
      return [];
    }
  },



  // جلب التقارير من قاعدة البيانات
  async getReports() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  // جلب سجل العمليات من قاعدة البيانات
  async getAuditLogs() {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select(`
          *,
          users(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  },

  // إحصائيات لوحة التحكم
  async getDashboardStats() {
    try {
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

      // جلب إحصائيات كباتن التوصيل
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

      return {
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalDrivers,
        activeOrders,
        completedOrders,
        averageDeliveryTime: "25 دقيقة",
        customerSatisfaction: 4.5
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalDrivers: 0,
        activeOrders: 0,
        completedOrders: 0,
        averageDeliveryTime: "0 دقيقة",
        customerSatisfaction: 0
      };
    }
  }
}; 

// =====================================================
// ADS SERVICES - خدمات الإعلانات
// =====================================================

export interface Ad {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  start_date: string;
  end_date?: string;
  target_audience: 'all' | 'customers' | 'merchants' | 'employees';
  views_count: number;
  clicks_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export async function getAds(): Promise<Ad[]> {
  try {
    console.log('Attempting to fetch ads from database...');
    
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching ads:', error);
      throw error;
    }
    
    console.log('Ads fetched successfully:', data?.length || 0, 'ads');
    return data || [];
  } catch (error) {
    console.error('Error fetching ads:', error);
    // Return empty array to prevent app crash
    return [];
  }
}

export async function getActiveAds(): Promise<Ad[]> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active ads:', error);
    return [];
  }
}

export async function createAd(ad: Omit<Ad, 'id' | 'created_at' | 'updated_at'>): Promise<Ad | null> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .insert([ad])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating ad:', error);
    return null;
  }
}

export async function updateAd(id: string, updates: Partial<Ad>): Promise<Ad | null> {
  try {
    const { data, error } = await supabase
      .from('ads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating ad:', error);
    return null;
  }
}

export async function deleteAd(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting ad:', error);
    return false;
  }
}

// =====================================================
// ALERTS SERVICES - خدمات التنبيهات
// =====================================================

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'inactive' | 'draft';
  target_audience: 'all' | 'customers' | 'merchants' | 'employees' | 'admins';
  start_date: string;
  end_date?: string;
  is_dismissible: boolean;
  requires_action: boolean;
  action_url?: string;
  action_text?: string;
  views_count: number;
  dismissals_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export async function getAlerts(): Promise<Alert[]> {
  try {
    console.log('Attempting to fetch alerts from database...');
    
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching alerts:', error);
      throw error;
    }
    
    console.log('Alerts fetched successfully:', data?.length || 0, 'alerts');
    return data || [];
  } catch (error) {
    console.error('Error fetching alerts:', error);
    // Return empty array to prevent app crash
    return [];
  }
}

export async function getActiveAlerts(): Promise<Alert[]> {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    return [];
  }
}

export async function createAlert(alert: Omit<Alert, 'id' | 'created_at' | 'updated_at'>): Promise<Alert | null> {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .insert([alert])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating alert:', error);
    return null;
  }
}

export async function updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | null> {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating alert:', error);
    return null;
  }
}

export async function deleteAlert(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting alert:', error);
    return false;
  }
}





// =====================================================
// NOTIFICATIONS SERVICES - خدمات الإشعارات
// =====================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  target_user_id?: string;
  target_role?: 'admin' | 'employee' | 'all';
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function getUnreadNotifications(): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return [];
  }
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification | null> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

export async function deleteNotification(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

// =====================================================
// AD VIEWS AND CLICKS SERVICES - خدمات مشاهدات ونقرات الإعلانات
// =====================================================

export interface AdView {
  id: string;
  ad_id: string;
  user_id?: string;
  customer_id?: string;
  ip_address?: string;
  user_agent?: string;
  viewed_at: string;
}

export interface AdClick {
  id: string;
  ad_id: string;
  user_id?: string;
  customer_id?: string;
  ip_address?: string;
  user_agent?: string;
  clicked_at: string;
}

export async function recordAdView(adId: string, userId?: string, customerId?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ad_views')
      .insert([{
        ad_id: adId,
        user_id: userId,
        customer_id: customerId,
        ip_address: '127.0.0.1', // في التطبيق الحقيقي سيتم الحصول على IP العميل
        user_agent: navigator.userAgent
      }]);

    if (error) throw error;

    // تحديث عداد المشاهدات
    await supabase
      .from('ads')
      .update({ views_count: supabase.sql`views_count + 1` })
      .eq('id', adId);

    return true;
  } catch (error) {
    console.error('Error recording ad view:', error);
    return false;
  }
}

export async function recordAdClick(adId: string, userId?: string, customerId?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ad_clicks')
      .insert([{
        ad_id: adId,
        user_id: userId,
        customer_id: customerId,
        ip_address: '127.0.0.1', // في التطبيق الحقيقي سيتم الحصول على IP العميل
        user_agent: navigator.userAgent
      }]);

    if (error) throw error;

    // تحديث عداد النقرات
    await supabase
      .from('ads')
      .update({ clicks_count: supabase.sql`clicks_count + 1` })
      .eq('id', adId);

    return true;
  } catch (error) {
    console.error('Error recording ad click:', error);
    return false;
  }
}

// =====================================================
// ALERT VIEWS AND DISMISSALS SERVICES - خدمات مشاهدات وإغلاق التنبيهات
// =====================================================

export interface AlertView {
  id: string;
  alert_id: string;
  user_id?: string;
  customer_id?: string;
  ip_address?: string;
  user_agent?: string;
  viewed_at: string;
}

export interface AlertDismissal {
  id: string;
  alert_id: string;
  user_id?: string;
  customer_id?: string;
  ip_address?: string;
  user_agent?: string;
  dismissed_at: string;
}

export async function recordAlertView(alertId: string, userId?: string, customerId?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('alert_views')
      .insert([{
        alert_id: alertId,
        user_id: userId,
        customer_id: customerId,
        ip_address: '127.0.0.1', // في التطبيق الحقيقي سيتم الحصول على IP العميل
        user_agent: navigator.userAgent
      }]);

    if (error) throw error;

    // تحديث عداد المشاهدات
    await supabase
      .from('alerts')
      .update({ views_count: supabase.sql`views_count + 1` })
      .eq('id', alertId);

    return true;
  } catch (error) {
    console.error('Error recording alert view:', error);
    return false;
  }
}

export async function recordAlertDismissal(alertId: string, userId?: string, customerId?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('alert_dismissals')
      .insert([{
        alert_id: alertId,
        user_id: userId,
        customer_id: customerId,
        ip_address: '127.0.0.1', // في التطبيق الحقيقي سيتم الحصول على IP العميل
        user_agent: navigator.userAgent
      }]);

    if (error) throw error;

    // تحديث عداد الإغلاق
    await supabase
      .from('alerts')
      .update({ dismissals_count: supabase.sql`dismissals_count + 1` })
      .eq('id', alertId);

    return true;
  } catch (error) {
    console.error('Error recording alert dismissal:', error);
    return false;
  }
} 