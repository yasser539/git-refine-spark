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
  
  // صلاحيات الإشعارات والدعم
  can_view_notifications: boolean;
  can_send_notifications: boolean;
  can_view_support: boolean;
  can_process_complaints: boolean;
}

export interface Order {
  id: string
  customer_id: string
  merchant_id: string
  deliverer_id?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled'
  total_amount: number
  items: any[]
  delivery_address: string
  delivery_phone: string
  notes?: string
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
  old_values?: any
  new_values?: any
  ip_address: string
  user_agent: string
  created_at: string
} 