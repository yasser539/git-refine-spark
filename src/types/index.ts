// User Management Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'customer' | 'merchant' | 'delivery_captain';
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permissions {
  canManageOrders: boolean;
  canManageUsers: boolean;
  canManageDelivery: boolean;
  canManageProducts: boolean;
  canManageAds: boolean;
  canManageNotifications: boolean;
  canViewReports: boolean;
}

// Order Management Types
export type OrderStatus = 
  | 'under_review' 
  | 'approved_searching_driver' 
  | 'pending' 
  | 'on_the_way' 
  | 'delivered' 
  | 'cancelled';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type PaymentMethod = 'cash' | 'card' | 'online' | 'wallet';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  merchant_id?: string;
  delivery_captain_id?: string;
  
  // Order Status
  approval_status: ApprovalStatus;
  status: OrderStatus;
  
  // Amounts
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  voucher_discount: number;
  total_amount: number;
  
  // Payment
  payment_method: PaymentMethod;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  
  // Delivery Information
  delivery_address: string;
  delivery_phone: string;
  delivery_notes?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  
  // Metadata
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations (populated by joins)
  customer?: Customer;
  merchant?: Merchant;
  delivery_captain?: DeliveryCaptain;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  previous_status?: OrderStatus;
  new_status: OrderStatus;
  notes?: string;
  created_by: string;
  created_at: string;
}

// Customer & Merchant Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  category: string;
  is_active: boolean;
  commission_rate: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Delivery Captain Types
export interface DeliveryCaptain {
  id: string;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  vehicle_type: 'motorcycle' | 'car' | 'bicycle';
  vehicle_model?: string;
  vehicle_plate?: string;
  
  // Status
  is_active: boolean;
  is_available: boolean;
  current_location?: string;
  
  // Performance
  total_deliveries: number;
  success_rate: number;
  average_rating: number;
  
  // Metadata
  hire_date: string;
  notes?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryWorkLog {
  id: string;
  captain_id: string;
  order_id: string;
  start_time: string;
  end_time?: string;
  distance_km?: number;
  earnings: number;
  notes?: string;
  created_at: string;
}

// Product & Inventory Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  merchant_id?: string;
  sku?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  last_restocked: string;
  supplier?: string;
  cost_per_unit: number;
  updated_at: string;
}

// Notification & Ads Types
export interface Notification {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target_role: 'admin' | 'employee' | 'delivery_captain' | 'customer' | 'merchant' | 'all';
  target_user_id?: string;
  is_read: boolean;
  is_active: boolean;
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
}

export interface Ad {
  id: string;
  title?: string;
  image_url: string;
  storage_bucket?: string;
  storage_path?: string;
  click_url?: string;
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  target_audience?: string;
  created_at: string;
  updated_at: string;
}

// Statistics & Reports Types
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  activeDeliveries: number;
  completedToday: number;
  totalRevenue: number;
  activeDrivers: number;
  totalCustomers: number;
  averageDeliveryTime: number;
}

export interface OrdersByStatus {
  under_review: number;
  approved_searching_driver: number;
  pending: number;
  on_the_way: number;
  delivered: number;
  cancelled: number;
}

// Filter & Search Types
export interface OrderFilters {
  status?: OrderStatus[];
  approval_status?: ApprovalStatus[];
  payment_method?: PaymentMethod[];
  date_from?: string;
  date_to?: string;
  customer_search?: string;
  order_number?: string;
}

export interface DeliveryCaptainFilters {
  is_active?: boolean;
  is_available?: boolean;
  vehicle_type?: string[];
  city?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}