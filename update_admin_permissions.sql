-- تحديث صلاحيات الأدمن - إعطاء جميع الصلاحيات للأدمن
-- هذا الملف يضمن أن جميع المستخدمين الذين لديهم دور 'admin' لديهم جميع الصلاحيات

-- تحديث صلاحيات جميع الأدمن
UPDATE permissions 
SET 
  -- صلاحيات أساسية
  can_view_dashboard = true,
  can_view_orders = true,
  can_update_order_status = true,
  can_view_live_map = true,
  
  -- صلاحيات إدارة المستخدمين
  can_view_users = true,
  can_modify_users = true,
  can_view_merchants = true,
  can_modify_merchants = true,
  can_view_employees = true,
  can_modify_employees = true,
  
  -- صلاحيات إدارة المنتجات والمخزون
  can_view_products = true,
  can_add_products = true,
  can_view_inventory = true,
  can_modify_inventory = true,
  
  -- صلاحيات التقارير والمراقبة
  can_view_reports = true,
  can_export_reports = true,
  can_view_audit_log = true,
  
  -- صلاحيات الإشعارات والدعم
  can_view_notifications = true,
  can_send_notifications = true,
  can_view_support = true,
  can_process_complaints = true,
  
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM users WHERE role = 'admin'
);

-- إنشاء صلاحيات للأدمن إذا لم تكن موجودة
INSERT INTO permissions (
  user_id,
  can_view_dashboard,
  can_view_orders,
  can_update_order_status,
  can_view_live_map,
  can_view_users,
  can_modify_users,
  can_view_merchants,
  can_modify_merchants,
  can_view_employees,
  can_modify_employees,
  can_view_products,
  can_add_products,
  can_view_inventory,
  can_modify_inventory,
  can_view_reports,
  can_export_reports,
  can_view_audit_log,
  can_view_notifications,
  can_send_notifications,
  can_view_support,
  can_process_complaints,
  created_at,
  updated_at
)
SELECT 
  u.id,
  true,  -- can_view_dashboard
  true,  -- can_view_orders
  true,  -- can_update_order_status
  true,  -- can_view_live_map
  true,  -- can_view_users
  true,  -- can_modify_users
  true,  -- can_view_merchants
  true,  -- can_modify_merchants
  true,  -- can_view_employees
  true,  -- can_modify_employees
  true,  -- can_view_products
  true,  -- can_add_products
  true,  -- can_view_inventory
  true,  -- can_modify_inventory
  true,  -- can_view_reports
  true,  -- can_export_reports
  true,  -- can_view_audit_log
  true,  -- can_view_notifications
  true,  -- can_send_notifications
  true,  -- can_view_support
  true,  -- can_process_complaints
  NOW(),
  NOW()
FROM users u
WHERE u.role = 'admin' 
AND NOT EXISTS (
  SELECT 1 FROM permissions p WHERE p.user_id = u.id
);

-- التحقق من النتيجة
SELECT 
  u.name,
  u.email,
  u.role,
  p.can_view_reports,
  p.can_export_reports,
  p.can_view_audit_log,
  p.updated_at
FROM users u
LEFT JOIN permissions p ON u.id = p.user_id
WHERE u.role = 'admin'; 