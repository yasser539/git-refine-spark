import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// أنواع البيانات
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'employee'
  avatar?: string
  created_at: string
  updated_at: string
}

export interface Permissions {
  // صلاحيات أساسية
  can_view_dashboard: boolean;
  can_view_orders: boolean;
  can_update_order_status: boolean;
  can_view_live_map: boolean;
  
  // صلاحيات إدارة المستخدمين
  can_view_users: boolean;
  can_modify_users: boolean;
  can_view_merchants: boolean;
  can_modify_merchants: boolean;
  can_view_employees: boolean;
  can_modify_employees: boolean;
  
  // صلاحيات إدارة المنتجات والمخزون
  can_view_products: boolean;
  can_add_products: boolean;
  can_view_inventory: boolean;
  can_modify_inventory: boolean;
  
  // صلاحيات التقارير والمراقبة
  can_view_reports: boolean;
  can_export_reports: boolean;
  can_view_audit_log: boolean;
  
  // صلاحيات الإشعارات
  can_view_notifications: boolean;
  can_send_notifications: boolean;
  
  // صلاحيات الدعم

  can_view_support: boolean;
  can_process_complaints: boolean;
}

export interface Order {
  id: string
  customer_id: string
  merchant_id: string
  deliverer_id?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  total_amount: number
  total?: number
  subtotal?: number
  final_amount?: number
  tax_amount?: number
  shipping_amount?: number
  discount_amount?: number
  voucher_discount?: number
  items?: Record<string, unknown>[]
  delivery_address: string
  delivery_phone: string
  delivery_notes?: string
  notes?: string
  estimated_delivery_time?: string
  actual_delivery_time?: string
  approval_status?: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_at?: string
  approval_notes?: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  address: string
  avatar?: string
  created_at: string
  updated_at: string
}

export interface Merchant {
  id: string
  name: string
  email: string
  phone: string
  address: string
  avatar?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: 'deliverer' | 'manager' | 'support'
  avatar?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  merchant_id?: string
  image_url?: string
  status: string
  total_sold: number
  rating: number
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: string
  product_id: string
  quantity: number
  min_quantity: number
  max_quantity: number
  location: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  target_user_id?: string
  target_role?: 'admin' | 'employee' | 'all'
  is_read: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  ip_address: string
  user_agent: string
  created_at: string
}

// =====================================================
// NEW TYPES FOR ADS, NOTIFICATIONS, AND SLOGANS
// =====================================================

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  target_user_id?: string
  target_role?: 'admin' | 'employee' | 'all'
  is_read: boolean
  created_at: string
}

export interface Ad {
  id: string
  image_url: string
  storage_bucket: string
  storage_path?: string
  created_at: string
}

// NOTE: Removed a duplicate Notification interface that conflicted with the
// primary Notification shape above to avoid declaration merging confusion.

export interface Slogan {
  id: string
  title: string
  slogan_text: string
  created_at: string
}

// =====================================================
// DELIVERY CAPTAINS TYPES
// =====================================================

export interface DeliveryCaptain {
  id: string
  name: string
  email: string
  phone: string
  password: string
  position: 'كابتن توصيل' | 'مندوب'
  department: string
  status: 'نشط' | 'إجازة' | 'غير نشط'
  location?: string
  city?: string
  region?: string
  description?: string
  avatar?: string
  profile_image?: string
  performance: number
  tasks: number
  completed: number
  rating: number
  total_deliveries: number
  total_earnings: number
  vehicle_type?: string
  vehicle_model?: string
  vehicle_plate?: string
  vehicle_color?: string
  emergency_contact?: string
  emergency_phone?: string
  id_number?: string
  license_number?: string
  insurance_number?: string
  date_of_birth?: string
  join_date: string
  contract_start_date?: string
  contract_end_date?: string
  salary?: number
  commission_rate: number
  device_id?: string
  app_version?: string
  last_active?: string
  is_verified: boolean
  verification_date?: string
  background_check_status: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  notes?: string
  admin_notes?: string
}

export interface DeliveryWorkLog {
  id: string
  captain_id: string
  order_id?: string
  customer_name?: string
  delivery_address?: string
  delivery_phone?: string
  pickup_time?: string
  delivery_time?: string
  total_distance?: number
  delivery_fee?: number
  customer_rating?: number
  customer_feedback?: string
  status: 'pending' | 'picked_up' | 'delivered' | 'cancelled'
  notes?: string
  created_at: string
}

export interface DeliveryPerformanceMonthly {
  id: string
  captain_id: string
  year: number
  month: number
  total_deliveries: number
  completed_deliveries: number
  cancelled_deliveries: number
  total_earnings: number
  average_rating: number
  total_distance: number
  notes?: string
  created_at: string
  updated_at: string
} 