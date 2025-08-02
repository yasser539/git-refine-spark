-- =====================================================
-- تحديث جدول العملاء - حذف حقل الإيميل
-- Update Customers Table - Remove Email Field
-- =====================================================

-- حذف الفهارس المتعلقة بالإيميل
DROP INDEX IF EXISTS idx_customers_email;

-- حذف حقل الإيميل من جدول العملاء
ALTER TABLE customers DROP COLUMN IF EXISTS email;

-- تحديث البيانات الموجودة (إزالة الإيميل من البيانات الموجودة)
-- لا حاجة لتنفيذ أي شيء لأن العمود سيتم حذفه

-- إضافة فهارس جديدة (بدون الإيميل)
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- التحقق من تحديث الجدول
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- عرض هيكل الجدول المحدث
\d customers; 