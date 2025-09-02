-- =====================================================
-- Candy Dashboard Admin Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
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
-- PERMISSIONS TABLE
-- =====================================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic permissions
    can_modify_users BOOLEAN DEFAULT false,
    can_view_orders BOOLEAN DEFAULT false,
    can_assign_deliverer BOOLEAN DEFAULT false,
    can_add_products BOOLEAN DEFAULT false,
    can_modify_prices BOOLEAN DEFAULT false,
    can_export_reports BOOLEAN DEFAULT false,
    can_update_order_status BOOLEAN DEFAULT false,
    can_send_notifications BOOLEAN DEFAULT false,
    can_process_complaints BOOLEAN DEFAULT false,
    
    -- View permissions
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
    
    -- Management permissions
    can_manage_merchants BOOLEAN DEFAULT false,
    can_manage_employees BOOLEAN DEFAULT false,
    can_manage_inventory BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MERCHANTS TABLE
-- =====================================================
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    avatar VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EMPLOYEES TABLE
-- =====================================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('deliverer', 'manager', 'support')),
    avatar VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    image_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INVENTORY TABLE
-- =====================================================
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER NOT NULL DEFAULT 0,
    max_quantity INTEGER NOT NULL DEFAULT 100,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    merchant_id UUID NULL REFERENCES merchants(id) ON DELETE CASCADE,
    deliverer_id UUID NULL REFERENCES employees(id) ON DELETE SET NULL,

    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled')),

    -- amounts
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    total        NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    subtotal     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    final_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (final_amount >= 0),
    tax_amount   NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    shipping_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    voucher_discount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (voucher_discount >= 0),

    items JSONB NULL,

    delivery_address TEXT NOT NULL DEFAULT '',
    delivery_phone   TEXT NOT NULL DEFAULT '',
    delivery_notes   TEXT NULL,
    notes            TEXT NULL,

    estimated_delivery_time TIMESTAMP WITH TIME ZONE NULL,
    actual_delivery_time    TIMESTAMP WITH TIME ZONE NULL,

    -- approvals
    approval_status TEXT NOT NULL DEFAULT 'pending',
    approved_by UUID NULL,
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    approval_notes TEXT NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
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
-- AUDIT_LOG TABLE
-- =====================================================
CREATE TABLE audit_log (
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
-- SUPPORT_TICKETS TABLE
-- =====================================================
CREATE TABLE support_tickets (
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
-- TICKET_MESSAGES TABLE
-- =====================================================
CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REPORTS TABLE
-- =====================================================
CREATE TABLE reports (
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
-- INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Permissions indexes
CREATE INDEX idx_permissions_user_id ON permissions(user_id);

-- Orders indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_merchant_id ON orders(merchant_id);
CREATE INDEX idx_orders_deliverer_id ON orders(deliverer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Products indexes
CREATE INDEX idx_products_merchant_id ON products(merchant_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);

-- Inventory indexes
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);

-- Notifications indexes
CREATE INDEX idx_notifications_target_user_id ON notifications(target_user_id);
CREATE INDEX idx_notifications_target_role ON notifications(target_role);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Audit log indexes
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Support tickets indexes
CREATE INDEX idx_support_tickets_customer_id ON support_tickets(customer_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
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

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert default admin user
INSERT INTO users (id, name, email, password_hash, role, avatar) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'المدير العام', 'admin@example.com', '$2a$10$example_hash', 'admin', 'م');

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
    true, true, true);

-- Insert sample employee
INSERT INTO users (id, name, email, password_hash, role, avatar) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'أحمد محمد', 'employee@example.com', '$2a$10$example_hash', 'employee', 'أ');

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
    true, true, true, true, true);

-- Insert sample customer
INSERT INTO customers (id, name, phone, address) VALUES 
('550e8400-e29b-41d4-a716-446655440003', 'محمد أحمد', '+966501234567', 'الرياض، المملكة العربية السعودية');

-- Insert sample merchant
INSERT INTO merchants (id, name, email, phone, address) VALUES 
('550e8400-e29b-41d4-a716-446655440004', 'مطعم الحلويات', 'merchant@example.com', '+966501234568', 'الرياض، المملكة العربية السعودية');

-- Insert sample employee
INSERT INTO employees (id, name, email, phone, role) VALUES 
('550e8400-e29b-41d4-a716-446655440005', 'سارة أحمد', 'deliverer@example.com', '+966501234569', 'deliverer');

-- Insert sample product
INSERT INTO products (id, name, description, price, category, merchant_id) VALUES 
('550e8400-e29b-41d4-a716-446655440006', 'كيك الشوكولاتة', 'كيك شوكولاتة طازج', 25.00, 'حلويات', '550e8400-e29b-41d4-a716-446655440004');

-- Insert sample inventory
INSERT INTO inventory (id, product_id, quantity, min_quantity, max_quantity, location) VALUES 
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440006', 50, 10, 100, 'المخزن الرئيسي');

-- Insert sample order
INSERT INTO orders (id, customer_id, merchant_id, total_amount, delivery_address, delivery_phone) VALUES 
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 50.00, 'الرياض، المملكة العربية السعودية', '+966501234567');

-- Insert sample notification
INSERT INTO notifications (id, title, message, type, target_role) VALUES 
('550e8400-e29b-41d4-a716-446655440009', 'مرحباً بك', 'مرحباً بك في نظام إدارة الحلويات', 'info', 'all'); 