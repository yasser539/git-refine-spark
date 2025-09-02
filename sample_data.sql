-- =====================================================
-- بيانات افتراضية للمشروع
-- =====================================================

-- إدراج المستخدمين الافتراضيين
INSERT INTO users (id, name, email, password_hash, role, avatar, is_active) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'المدير العام', 'admin@example.com', '$2a$10$example_hash', 'admin', 'م', true),
('550e8400-e29b-41d4-a716-446655440002', 'أحمد محمد', 'employee@example.com', '$2a$10$example_hash', 'employee', 'أ', true),
('550e8400-e29b-41d4-a716-446655440003', 'سارة أحمد', 'sara@example.com', '$2a$10$example_hash', 'employee', 'س', true),
('550e8400-e29b-41d4-a716-446655440004', 'محمد علي', 'mohammed@example.com', '$2a$10$example_hash', 'employee', 'م', true);

-- إدراج صلاحيات المدير
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

-- إدراج صلاحيات الموظف الأول
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

-- إدراج صلاحيات الموظف الثاني
INSERT INTO permissions (user_id, 
    can_view_orders, can_assign_deliverer, can_update_order_status, 
    can_process_complaints, can_view_live_map, can_view_users, 
    can_view_merchants, can_view_employees, can_view_products, 
    can_view_inventory, can_view_reports, can_view_audit_log, 
    can_view_support, can_view_permissions, can_view_dashboard,
    can_add_products, can_send_notifications) 
VALUES 
('550e8400-e29b-41d4-a716-446655440003', 
    true, true, true, true, true, true, true, true, true, true, 
    true, true, true, true, true, true, true);

-- إدراج صلاحيات الموظف الثالث
INSERT INTO permissions (user_id, 
    can_view_orders, can_assign_deliverer, can_update_order_status, 
    can_process_complaints, can_view_live_map, can_view_users, 
    can_view_merchants, can_view_employees, can_view_products, 
    can_view_inventory, can_view_reports, can_view_audit_log, 
    can_view_support, can_view_permissions, can_view_dashboard,
    can_export_reports) 
VALUES 
('550e8400-e29b-41d4-a716-446655440004', 
    true, true, true, true, true, true, true, true, true, true, 
    true, true, true, true, true, true);

-- إدراج العملاء
INSERT INTO customers (id, name, email, phone, address, avatar, is_active) VALUES 
('550e8400-e29b-41d4-a716-446655440005', 'محمد أحمد', 'customer1@example.com', '+966501234567', 'الرياض، المملكة العربية السعودية', 'م', true),
('550e8400-e29b-41d4-a716-446655440006', 'فاطمة علي', 'customer2@example.com', '+966501234568', 'جدة، المملكة العربية السعودية', 'ف', true),
('550e8400-e29b-41d4-a716-446655440007', 'علي حسن', 'customer3@example.com', '+966501234569', 'الدمام، المملكة العربية السعودية', 'ع', true),
('550e8400-e29b-41d4-a716-446655440008', 'خديجة محمد', 'customer4@example.com', '+966501234570', 'مكة المكرمة، المملكة العربية السعودية', 'خ', true),
('550e8400-e29b-41d4-a716-446655440009', 'عبدالله سعد', 'customer5@example.com', '+966501234571', 'المدينة المنورة، المملكة العربية السعودية', 'ع', true);

-- إدراج التجار
INSERT INTO merchants (id, name, email, phone, address, avatar, status) VALUES 
('550e8400-e29b-41d4-a716-446655440010', 'مطعم الحلويات الملكي', 'merchant1@example.com', '+966501234572', 'الرياض، المملكة العربية السعودية', 'م', 'active'),
('550e8400-e29b-41d4-a716-446655440011', 'مخبز الحلويات الطازجة', 'merchant2@example.com', '+966501234573', 'جدة، المملكة العربية السعودية', 'م', 'active'),
('550e8400-e29b-41d4-a716-446655440012', 'حلويات الشرق', 'merchant3@example.com', '+966501234574', 'الدمام، المملكة العربية السعودية', 'ح', 'active'),
('550e8400-e29b-41d4-a716-446655440013', 'مطعم الحلويات التقليدية', 'merchant4@example.com', '+966501234575', 'مكة المكرمة، المملكة العربية السعودية', 'م', 'active'),
('550e8400-e29b-41d4-a716-446655440014', 'حلويات المدينة', 'merchant5@example.com', '+966501234576', 'المدينة المنورة، المملكة العربية السعودية', 'ح', 'active');

-- إدراج الموظفين (كباتن التوصيل)
INSERT INTO employees (id, name, email, phone, role, avatar, status) VALUES 
('550e8400-e29b-41d4-a716-446655440015', 'أحمد سعد', 'deliverer1@example.com', '+966501234577', 'deliverer', 'أ', 'active'),
('550e8400-e29b-41d4-a716-446655440016', 'محمد حسن', 'deliverer2@example.com', '+966501234578', 'deliverer', 'م', 'active'),
('550e8400-e29b-41d4-a716-446655440017', 'علي محمد', 'deliverer3@example.com', '+966501234579', 'deliverer', 'ع', 'active'),
('550e8400-e29b-41d4-a716-446655440018', 'سعد أحمد', 'manager1@example.com', '+966501234580', 'manager', 'س', 'active'),
('550e8400-e29b-41d4-a716-446655440019', 'حسن علي', 'support1@example.com', '+966501234581', 'support', 'ح', 'active');

-- إدراج المنتجات
INSERT INTO products (id, name, description, price, category, merchant_id, image_url, status) VALUES 
('550e8400-e29b-41d4-a716-446655440020', 'كيك الشوكولاتة', 'كيك شوكولاتة طازج مع كريمة الشوكولاتة', 25.00, 'حلويات', '550e8400-e29b-41d4-a716-446655440010', 'https://example.com/chocolate-cake.jpg', 'active'),
('550e8400-e29b-41d4-a716-446655440021', 'كنافة', 'كنافة تقليدية مع جبنة', 30.00, 'حلويات شرقية', '550e8400-e29b-41d4-a716-446655440010', 'https://example.com/kunafa.jpg', 'active'),
('550e8400-e29b-41d4-a716-446655440022', 'بسبوسة', 'بسبوسة محلاة بالسكر', 20.00, 'حلويات شرقية', '550e8400-e29b-41d4-a716-446655440011', 'https://example.com/basbousa.jpg', 'active'),
('550e8400-e29b-41d4-a716-446655440023', 'قطايف', 'قطايف محشوة بالجوز', 35.00, 'حلويات شرقية', '550e8400-e29b-41d4-a716-446655440011', 'https://example.com/qatayef.jpg', 'active'),
('550e8400-e29b-41d4-a716-446655440024', 'كيك الفانيلا', 'كيك فانيلا طازج', 22.00, 'حلويات', '550e8400-e29b-41d4-a716-446655440012', 'https://example.com/vanilla-cake.jpg', 'active'),
('550e8400-e29b-41d4-a716-446655440025', 'مكسرات', 'مكسرات محمصة', 15.00, 'مكسرات', '550e8400-e29b-41d4-a716-446655440012', 'https://example.com/nuts.jpg', 'active'),
('550e8400-e29b-41d4-a716-446655440026', 'حلاوة طحينية', 'حلاوة طحينية طازجة', 18.00, 'حلويات شرقية', '550e8400-e29b-41d4-a716-446655440013', 'https://example.com/halawa.jpg', 'active'),
('550e8400-e29b-41d4-a716-446655440027', 'بقلاوة', 'بقلاوة بالفستق', 40.00, 'حلويات شرقية', '550e8400-e29b-41d4-a716-446655440013', 'https://example.com/baklava.jpg', 'active'),
('550e8400-e29b-41d4-a716-446655440028', 'كيك الجزر', 'كيك جزر صحي', 28.00, 'حلويات', '550e8400-e29b-41d4-a716-446655440014', 'https://example.com/carrot-cake.jpg', 'active'),
('550e8400-e29b-41d4-a716-446655440029', 'شوكولاتة', 'شوكولاتة محلية الصنع', 12.00, 'حلويات', '550e8400-e29b-41d4-a716-446655440014', 'https://example.com/chocolate.jpg', 'active');

-- إدراج المخزون
INSERT INTO inventory (id, product_id, quantity, min_quantity, max_quantity, location) VALUES 
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440020', 50, 10, 100, 'المخزن الرئيسي'),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440021', 30, 5, 80, 'المخزن الرئيسي'),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440022', 40, 8, 90, 'المخزن الفرعي'),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440023', 25, 5, 70, 'المخزن الفرعي'),
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440024', 35, 7, 85, 'المخزن الرئيسي'),
('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440025', 60, 15, 120, 'المخزن الرئيسي'),
('550e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440026', 45, 10, 95, 'المخزن الفرعي'),
('550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440027', 20, 3, 60, 'المخزن الرئيسي'),
('550e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440028', 30, 6, 75, 'المخزن الفرعي'),
('550e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440029', 80, 20, 150, 'المخزن الرئيسي');

-- إدراج الطلبات
INSERT INTO orders (id, customer_id, merchant_id, deliverer_id, status, total_amount, items, delivery_address, delivery_phone, notes) VALUES 
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440015', 'delivered', 55.00, '[{"product_id": "550e8400-e29b-41d4-a716-446655440020", "quantity": 2, "price": 25.00}]', 'الرياض، المملكة العربية السعودية', '+966501234567', 'توصيل سريع'),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440016', 'out_for_delivery', 50.00, '[{"product_id": "550e8400-e29b-41d4-a716-446655440022", "quantity": 2, "price": 20.00}, {"product_id": "550e8400-e29b-41d4-a716-446655440023", "quantity": 1, "price": 35.00}]', 'جدة، المملكة العربية السعودية', '+966501234568', ''),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440017', 'preparing', 37.00, '[{"product_id": "550e8400-e29b-41d4-a716-446655440024", "quantity": 1, "price": 22.00}, {"product_id": "550e8400-e29b-41d4-a716-446655440025", "quantity": 1, "price": 15.00}]', 'الدمام، المملكة العربية السعودية', '+966501234569', ''),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440013', NULL, 'preparing', 58.00, '[{"product_id": "550e8400-e29b-41d4-a716-446655440026", "quantity": 1, "price": 18.00}, {"product_id": "550e8400-e29b-41d4-a716-446655440027", "quantity": 1, "price": 40.00}]', 'مكة المكرمة، المملكة العربية السعودية', '+966501234570', ''),
('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440014', NULL, 'confirmed', 40.00, '[{"product_id": "550e8400-e29b-41d4-a716-446655440028", "quantity": 1, "price": 28.00}, {"product_id": "550e8400-e29b-41d4-a716-446655440029", "quantity": 1, "price": 12.00}]', 'المدينة المنورة، المملكة العربية السعودية', '+966501234571', '');

-- إدراج الإشعارات
INSERT INTO notifications (id, title, message, type, target_role, is_read) VALUES 
('550e8400-e29b-41d4-a716-446655440045', 'مرحباً بك', 'مرحباً بك في نظام إدارة الحلويات', 'info', 'all', false),
('550e8400-e29b-41d4-a716-446655440046', 'طلب جديد', 'تم استلام طلب جديد من العميل محمد أحمد', 'info', 'admin', false),
('550e8400-e29b-41d4-a716-446655440047', 'تحديث المخزون', 'انخفضت كمية كيك الشوكولاتة عن الحد الأدنى', 'warning', 'admin', false),
('550e8400-e29b-41d4-a716-446655440048', 'توصيل مكتمل', 'تم توصيل الطلب بنجاح للعميل فاطمة علي', 'success', 'admin', false),
('550e8400-e29b-41d4-a716-446655440049', 'طلب جاهز', 'الطلب رقم #123 جاهز للتوصيل', 'info', 'employee', false),
('550e8400-e29b-41d4-a716-446655440050', 'تحديث النظام', 'تم تحديث نظام الصلاحيات بنجاح', 'info', 'all', false);

-- إدراج سجلات التدقيق
INSERT INTO audit_log (id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) VALUES 
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440001', 'CREATE', 'orders', '550e8400-e29b-41d4-a716-446655440040', NULL, '{"status": "pending", "total_amount": 55.00}', '192.168.1.1', 'Mozilla/5.0...'),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440002', 'UPDATE', 'orders', '550e8400-e29b-41d4-a716-446655440040', '{"status": "pending"}', '{"status": "delivered"}', '192.168.1.2', 'Mozilla/5.0...'),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440001', 'CREATE', 'products', '550e8400-e29b-41d4-a716-446655440020', NULL, '{"name": "كيك الشوكولاتة", "price": 25.00}', '192.168.1.1', 'Mozilla/5.0...'),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440003', 'UPDATE', 'inventory', '550e8400-e29b-41d4-a716-446655440030', '{"quantity": 60}', '{"quantity": 50}', '192.168.1.3', 'Mozilla/5.0...'),
('550e8400-e29b-41d4-a716-446655440055', '550e8400-e29b-41d4-a716-446655440001', 'UPDATE', 'permissions', '550e8400-e29b-41d4-a716-446655440002', '{"can_add_products": false}', '{"can_add_products": true}', '192.168.1.1', 'Mozilla/5.0...'); 