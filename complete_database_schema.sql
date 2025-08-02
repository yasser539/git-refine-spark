-- =====================================================
-- Candy Dashboard Admin - Complete Database Schema
-- نظام إدارة الحلويات - مخطط قاعدة البيانات الكامل
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE - جدول المستخدمين
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee')),
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PERMISSIONS TABLE - جدول الصلاحيات
-- =====================================================
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic permissions - الصلاحيات الأساسية
    can_modify_users BOOLEAN DEFAULT false,
    can_view_orders BOOLEAN DEFAULT false,
    can_assign_deliverer BOOLEAN DEFAULT false,
    can_add_products BOOLEAN DEFAULT false,
    can_modify_prices BOOLEAN DEFAULT false,
    can_export_reports BOOLEAN DEFAULT false,
    can_update_order_status BOOLEAN DEFAULT false,
    can_send_notifications BOOLEAN DEFAULT false,
    can_process_complaints BOOLEAN DEFAULT false,
    
    -- View permissions - صلاحيات العرض
    can_view_live_map BOOLEAN DEFAULT false,
    can_view_users BOOLEAN DEFAULT false,
    can_view_merchants BOOLEAN DEFAULT false,
    can_view_employees BOOLEAN DEFAULT false,
    can_view_products BOOLEAN DEFAULT false,
    can_view_inventory BOOLEAN DEFAULT false,
    can_view_reports BOOLEAN DEFAULT false,
    can_view_audit_log BOOLEAN DEFAULT false,
    can_view_support BOOLEAN DEFAULT false,
    can_view_permissions BOOLEAN DEFAULT false,
    can_view_dashboard BOOLEAN DEFAULT false,
    
    -- Management permissions - صلاحيات الإدارة
    can_manage_merchants BOOLEAN DEFAULT false,
    can_manage_employees BOOLEAN DEFAULT false,
    can_manage_inventory BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- CUSTOMERS TABLE - جدول العملاء
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    total_spent DECIMAL(10,2) DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MERCHANTS TABLE - جدول التجار
-- =====================================================
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    avatar VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EMPLOYEES TABLE - جدول الموظفين
-- =====================================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('deliverer', 'manager', 'support')),
    avatar VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    total_deliveries INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    current_location POINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE - جدول المنتجات
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    image_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    total_sold INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INVENTORY TABLE - جدول المخزون
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER NOT NULL DEFAULT 0,
    max_quantity INTEGER NOT NULL DEFAULT 100,
    location VARCHAR(255),
    last_restocked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id)
);

-- =====================================================
-- ORDERS TABLE - جدول الطلبات
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    deliverer_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    delivery_address TEXT NOT NULL,
    delivery_phone VARCHAR(20) NOT NULL,
    notes TEXT,
    
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER_ITEMS TABLE - جدول عناصر الطلب
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS TABLE - جدول الإشعارات
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_role VARCHAR(20) CHECK (target_role IN ('admin', 'employee', 'all')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADS TABLE - جدول الإعلانات
-- =====================================================
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    link_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    priority INTEGER DEFAULT 1,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'customers', 'merchants', 'employees')),
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ALERTS TABLE - جدول التنبيهات
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success', 'promotion')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'customers', 'merchants', 'employees', 'admins')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    is_dismissible BOOLEAN DEFAULT true,
    requires_action BOOLEAN DEFAULT false,
    action_url VARCHAR(255),
    action_text VARCHAR(100),
    views_count INTEGER DEFAULT 0,
    dismissals_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AD_VIEWS TABLE - جدول مشاهدات الإعلانات
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AD_CLICKS TABLE - جدول نقرات الإعلانات
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ALERT_VIEWS TABLE - جدول مشاهدات التنبيهات
-- =====================================================
CREATE TABLE IF NOT EXISTS alert_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ALERT_DISMISSALS TABLE - جدول إغلاق التنبيهات
-- =====================================================
CREATE TABLE IF NOT EXISTS alert_dismissals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AUDIT_LOG TABLE - جدول سجل العمليات
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SUPPORT_TICKETS TABLE - جدول تذاكر الدعم
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TICKET_MESSAGES TABLE - جدول رسائل التذاكر
-- =====================================================
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REPORTS TABLE - جدول التقارير
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL,
    parameters JSONB,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    file_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR BETTER PERFORMANCE - فهارس لتحسين الأداء
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Permissions indexes
CREATE INDEX IF NOT EXISTS idx_permissions_user_id ON permissions(user_id);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Merchants indexes
CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email);
CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
CREATE INDEX IF NOT EXISTS idx_merchants_created_at ON merchants(created_at);

-- Employees indexes
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_deliverer_id ON orders(deliverer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_target_user_id ON notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON notifications(target_role);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Ads indexes
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_target_audience ON ads(target_audience);
CREATE INDEX IF NOT EXISTS idx_ads_start_date ON ads(start_date);
CREATE INDEX IF NOT EXISTS idx_ads_end_date ON ads(end_date);
CREATE INDEX IF NOT EXISTS idx_ads_created_by ON ads(created_by);

-- Alerts indexes
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON alerts(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_target_audience ON alerts(target_audience);
CREATE INDEX IF NOT EXISTS idx_alerts_start_date ON alerts(start_date);
CREATE INDEX IF NOT EXISTS idx_alerts_end_date ON alerts(end_date);
CREATE INDEX IF NOT EXISTS idx_alerts_created_by ON alerts(created_by);

-- Ad views and clicks indexes
CREATE INDEX IF NOT EXISTS idx_ad_views_ad_id ON ad_views(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_user_id ON ad_views(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_customer_id ON ad_views(customer_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_user_id ON ad_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_customer_id ON ad_clicks(customer_id);

-- Alert views and dismissals indexes
CREATE INDEX IF NOT EXISTS idx_alert_views_alert_id ON alert_views(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_views_user_id ON alert_views(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_views_customer_id ON alert_views(customer_id);
CREATE INDEX IF NOT EXISTS idx_alert_dismissals_alert_id ON alert_dismissals(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_dismissals_user_id ON alert_dismissals(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_dismissals_customer_id ON alert_dismissals(customer_id);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Support tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_customer_id ON support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT - محفزات لتحديث updated_at
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA INSERTION - إدراج البيانات الأولية
-- =====================================================

-- Insert default admin user
INSERT INTO users (id, name, email, password_hash, role, avatar) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'المدير العام', 'admin@example.com', '$2a$10$example_hash', 'admin', 'م')
ON CONFLICT (email) DO NOTHING;

-- Insert default admin permissions
INSERT INTO permissions (user_id, 
    can_modify_users, can_view_orders, can_assign_deliverer, can_add_products, 
    can_modify_prices, can_export_reports, can_update_order_status, 
    can_send_notifications, can_process_complaints, can_view_live_map, 
    can_view_users, can_view_merchants, can_view_employees, can_view_products, 
    can_view_inventory, can_view_reports, can_view_audit_log, can_view_support, 
    can_view_permissions, can_manage_merchants, can_manage_employees, 
    can_manage_inventory, can_view_dashboard) 
VALUES 
('550e8400-e29b-41d4-a716-446655440001', 
    true, true, true, true, true, true, true, true, true, true, 
    true, true, true, true, true, true, true, true, true, true, 
    true, true, true)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample employee
INSERT INTO users (id, name, email, password_hash, role, avatar) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'أحمد محمد', 'employee@example.com', '$2a$10$example_hash', 'employee', 'أ')
ON CONFLICT (email) DO NOTHING;

-- Insert sample employee permissions
INSERT INTO permissions (user_id, 
    can_view_orders, can_assign_deliverer, can_update_order_status, 
    can_process_complaints, can_view_live_map, can_view_users, 
    can_view_merchants, can_view_employees, can_view_products, 
    can_view_inventory, can_view_reports, can_view_audit_log, 
    can_view_support, can_view_permissions, can_view_dashboard) 
VALUES 
('550e8400-e29b-41d4-a716-446655440002', 
    true, true, true, true, true, true, true, true, true, true, 
    true, true, true, true, true)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample customer
INSERT INTO customers (id, name, phone, address) VALUES 
('550e8400-e29b-41d4-a716-446655440003', 'محمد أحمد', '+966501234567', 'الرياض، المملكة العربية السعودية')
ON CONFLICT DO NOTHING;

-- Insert sample merchant
INSERT INTO merchants (id, name, email, phone, address) VALUES 
('550e8400-e29b-41d4-a716-446655440004', 'مطعم الحلويات', 'merchant@example.com', '+966501234568', 'الرياض، المملكة العربية السعودية')
ON CONFLICT (email) DO NOTHING;

-- Insert sample employee
INSERT INTO employees (id, name, email, phone, role) VALUES 
('550e8400-e29b-41d4-a716-446655440005', 'سارة أحمد', 'deliverer@example.com', '+966501234569', 'deliverer')
ON CONFLICT (email) DO NOTHING;

-- Insert sample product
INSERT INTO products (id, name, description, price, category, merchant_id) VALUES 
('550e8400-e29b-41d4-a716-446655440006', 'كيك الشوكولاتة', 'كيك شوكولاتة طازج', 25.00, 'حلويات', '550e8400-e29b-41d4-a716-446655440004')
ON CONFLICT DO NOTHING;

-- Insert sample inventory
INSERT INTO inventory (id, product_id, quantity, min_quantity, max_quantity, location) VALUES 
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440006', 50, 10, 100, 'المخزن الرئيسي')
ON CONFLICT (product_id) DO NOTHING;

-- Insert sample order
INSERT INTO orders (id, customer_id, merchant_id, total_amount, delivery_address, delivery_phone) VALUES 
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 50.00, 'الرياض، المملكة العربية السعودية', '+966501234567')
ON CONFLICT DO NOTHING;

-- Insert sample notification
INSERT INTO notifications (id, title, message, type, target_role) VALUES 
('550e8400-e29b-41d4-a716-446655440009', 'مرحباً بك', 'مرحباً بك في نظام إدارة الحلويات', 'info', 'all')
ON CONFLICT DO NOTHING;

-- Insert sample ads
INSERT INTO ads (id, title, description, image_url, link_url, status, target_audience, created_by) VALUES 
('550e8400-e29b-41d4-a716-446655440010', 'إعلان CANDY', 'إعلان تجاري لمنتجات الحلويات', '/images/candy-logo.png', '/products', 'active', 'all', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440011', 'عرض خاص', 'خصومات على جميع المنتجات', '/images/special-offer.png', '/offers', 'active', 'customers', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT DO NOTHING;

-- Insert sample alerts
INSERT INTO alerts (id, title, message, type, priority, status, target_audience, created_by) VALUES 
('550e8400-e29b-41d4-a716-446655440012', 'خصم 20% على المياه المعدنية', 'احصل على خصم 20% على جميع أنواع المياه المعدنية', 'promotion', 'high', 'active', 'all', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440013', 'صيانة النظام', 'سيتم إجراء صيانة للنظام غداً من الساعة 2-4 صباحاً', 'warning', 'medium', 'active', 'all', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - أمان مستوى الصف
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_dismissals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- COMMENTS - التعليقات
-- =====================================================

COMMENT ON TABLE users IS 'جدول المستخدمين - يحتوي على بيانات المديرين والموظفين';
COMMENT ON TABLE permissions IS 'جدول الصلاحيات - يحدد صلاحيات كل مستخدم';
COMMENT ON TABLE customers IS 'جدول العملاء - يحتوي على بيانات العملاء';
COMMENT ON TABLE merchants IS 'جدول التجار - يحتوي على بيانات المطاعم والمحلات';
COMMENT ON TABLE employees IS 'جدول الموظفين - يحتوي على بيانات كباتن التوصيل والموظفين';
COMMENT ON TABLE products IS 'جدول المنتجات - يحتوي على بيانات الحلويات والمنتجات';
COMMENT ON TABLE inventory IS 'جدول المخزون - يتبع كمية المنتجات المتوفرة';
COMMENT ON TABLE orders IS 'جدول الطلبات - يحتوي على طلبات العملاء';
COMMENT ON TABLE order_items IS 'جدول عناصر الطلب - تفاصيل المنتجات في كل طلب';
COMMENT ON TABLE notifications IS 'جدول الإشعارات - إشعارات النظام للمستخدمين';
COMMENT ON TABLE audit_log IS 'جدول سجل العمليات - يسجل جميع العمليات في النظام';
COMMENT ON TABLE support_tickets IS 'جدول تذاكر الدعم - شكاوى واستفسارات العملاء';
COMMENT ON TABLE ticket_messages IS 'جدول رسائل التذاكر - الرسائل المتبادلة في التذاكر';
COMMENT ON TABLE reports IS 'جدول التقارير - التقارير المولدة من النظام';
COMMENT ON TABLE ads IS 'جدول الإعلانات - إعلانات النظام للمستخدمين';
COMMENT ON TABLE alerts IS 'جدول التنبيهات - تنبيهات النظام للمستخدمين';
COMMENT ON TABLE ad_views IS 'جدول مشاهدات الإعلانات - تتبع مشاهدات الإعلانات';
COMMENT ON TABLE ad_clicks IS 'جدول نقرات الإعلانات - تتبع نقرات الإعلانات';
COMMENT ON TABLE alert_views IS 'جدول مشاهدات التنبيهات - تتبع مشاهدات التنبيهات';
COMMENT ON TABLE alert_dismissals IS 'جدول إغلاق التنبيهات - تتبع إغلاق التنبيهات';

-- =====================================================
-- END OF SCHEMA - نهاية مخطط قاعدة البيانات
-- ===================================================== 