-- تحديث صلاحيات التقارير وسجل العمليات للمستخدم
-- استبدل 'USER_ID_HERE' بمعرف المستخدم الفعلي

-- تحديث الصلاحيات الموجودة
UPDATE permissions 
SET 
  can_view_reports = true,
  can_export_reports = true,
  can_view_audit_log = true,
  updated_at = NOW()
WHERE user_id = 'USER_ID_HERE';

-- التحقق من النتيجة
SELECT 
  p.user_id,
  u.name,
  u.email,
  u.role,
  p.can_view_reports,
  p.can_export_reports,
  p.can_view_audit_log,
  p.updated_at
FROM permissions p
JOIN users u ON p.user_id = u.id
WHERE p.user_id = 'USER_ID_HERE'; 