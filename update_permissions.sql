-- تحديث جدول الصلاحيات - حذف الصلاحيات غير المستخدمة وإضافة الصلاحيات الجديدة

-- حذف الأعمدة القديمة غير المستخدمة
ALTER TABLE permissions DROP COLUMN IF EXISTS can_modify_users;
ALTER TABLE permissions DROP COLUMN IF EXISTS can_assign_deliverer;
ALTER TABLE permissions DROP COLUMN IF EXISTS can_add_products;
ALTER TABLE permissions DROP COLUMN IF EXISTS can_modify_prices;
ALTER TABLE permissions DROP COLUMN IF EXISTS can_export_reports;
ALTER TABLE permissions DROP COLUMN IF EXISTS can_send_notifications;
ALTER TABLE permissions DROP COLUMN IF EXISTS can_process_complaints;
ALTER TABLE permissions DROP COLUMN IF EXISTS can_view_permissions;

-- إضافة الأعمدة الجديدة
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS can_view_notifications BOOLEAN DEFAULT false;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS can_manage_users BOOLEAN DEFAULT false;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS can_manage_products BOOLEAN DEFAULT false;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS can_manage_orders BOOLEAN DEFAULT false;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS can_manage_reports BOOLEAN DEFAULT false;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS can_manage_system BOOLEAN DEFAULT false;

-- تحديث صلاحيات الأدمن (جميع الصلاحيات = true)
UPDATE permissions 
SET 
  can_view_dashboard = true,
  can_view_orders = true,
  can_update_order_status = true,
  can_view_live_map = true,
  can_view_users = true,
  can_view_merchants = true,
  can_view_employees = true,
  can_view_products = true,
  can_view_inventory = true,
  can_view_reports = true,
  can_view_audit_log = true,
  can_view_support = true,
  can_view_notifications = true,
  can_manage_users = true,
  can_manage_merchants = true,
  can_manage_employees = true,
  can_manage_products = true,
  can_manage_inventory = true,
  can_manage_orders = true,
  can_manage_reports = true,
  can_manage_system = true,
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM users WHERE role = 'admin'
);

-- تحديث صلاحيات الموظفين (صلاحيات عرض فقط)
UPDATE permissions 
SET 
  can_view_dashboard = true,
  can_view_orders = true,
  can_update_order_status = true,
  can_view_live_map = true,
  can_view_users = true,
  can_view_merchants = true,
  can_view_employees = true,
  can_view_products = true,
  can_view_inventory = true,
  can_view_reports = true,
  can_view_audit_log = true,
  can_view_support = true,
  can_view_notifications = true,
  can_manage_users = false,
  can_manage_merchants = false,
  can_manage_employees = false,
  can_manage_products = false,
  can_manage_inventory = false,
  can_manage_orders = false,
  can_manage_reports = false,
  can_manage_system = false,
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM users WHERE role = 'employee'
);

-- إضافة صلاحيات للمستخدمين الجدد إذا لم تكن موجودة
INSERT INTO permissions (
  user_id,
  can_view_dashboard,
  can_view_orders,
  can_update_order_status,
  can_view_live_map,
  can_view_users,
  can_view_merchants,
  can_view_employees,
  can_view_products,
  can_view_inventory,
  can_view_reports,
  can_view_audit_log,
  can_view_support,
  can_view_notifications,
  can_manage_users,
  can_manage_merchants,
  can_manage_employees,
  can_manage_products,
  can_manage_inventory,
  can_manage_orders,
  can_manage_reports,
  can_manage_system,
  created_at,
  updated_at
)
SELECT 
  u.id,
  CASE WHEN u.role = 'admin' THEN true ELSE true END,
  CASE WHEN u.role = 'admin' THEN true ELSE true END,
  CASE WHEN u.role = 'admin' THEN true ELSE true END,
  CASE WHEN u.role = 'admin' THEN true ELSE true END,
  CASE WHEN u.role = 'admin' THEN true ELSE true END,
  CASE WHEN u.role = 'admin' THEN true ELSE true END,
  CASE WHEN u.role = 'admin' THEN true ELSE true END,
  CASE WHEN u.role = 'admin' THEN true ELSE true END,
  CASE WHEN u.role = 'admin' THEN true ELSE true END,
  CASE WHEN u.role = 'admin' THEN true ELSE true END,
  CASE WHEN u.role = 'admin' THEN true ELSE true END,
  CASE WHEN u.role = 'admin' THEN true ELSE true END,
  CASE WHEN u.role = 'admin' THEN true ELSE true END,
  CASE WHEN u.role = 'admin' THEN true ELSE false END,
  CASE WHEN u.role = 'admin' THEN true ELSE false END,
  CASE WHEN u.role = 'admin' THEN true ELSE false END,
  CASE WHEN u.role = 'admin' THEN true ELSE false END,
  CASE WHEN u.role = 'admin' THEN true ELSE false END,
  CASE WHEN u.role = 'admin' THEN true ELSE false END,
  CASE WHEN u.role = 'admin' THEN true ELSE false END,
  CASE WHEN u.role = 'admin' THEN true ELSE false END,
  NOW(),
  NOW()
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM permissions p WHERE p.user_id = u.id
); 