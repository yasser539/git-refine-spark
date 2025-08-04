-- =====================================================
-- IMPLEMENTATION CORRECTE POUR LA TABLE ADS
-- التنفيذ الصحيح لجدول الإعلانات
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ADS TABLE - جدول الإعلانات
-- =====================================================
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,                                  -- المسار فقط: ads/nom-image.png
    storage_bucket TEXT DEFAULT 'img',                        -- اسم البكت
    storage_path TEXT,                                        -- المسار الكامل: ads/nom-image.png
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES - فهارس
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at);
CREATE INDEX IF NOT EXISTS idx_ads_storage_bucket ON ads(storage_bucket);

-- =====================================================
-- EXEMPLE PRATIQUE - مثال عملي
-- =====================================================

-- 1. إدراج إعلان مع مسار فقط (الطريقة الصحيحة)
INSERT INTO ads (image_url, storage_bucket, storage_path) VALUES 
('ads/abcd1234.png', 'img', 'ads/abcd1234.png');

-- 2. إدراج إعلان آخر
INSERT INTO ads (image_url, storage_bucket, storage_path) VALUES 
('ads/efgh5678.jpg', 'img', 'ads/efgh5678.jpg');

-- 3. إدراج إعلان مع مسار فقط (بدون storage_path)
INSERT INTO ads (image_url) VALUES 
('ads/sample-ad-1.jpg');

-- 4. إدراج إعلان مع مسار فقط (بدون storage_path)
INSERT INTO ads (image_url) VALUES 
('ads/sample-ad-2.jpg');

-- =====================================================
-- COMMENTAIRES - التعليقات
-- =====================================================

COMMENT ON TABLE ads IS 'جدول الإعلانات - تخزين مسارات الصور فقط';
COMMENT ON COLUMN ads.id IS 'رقم تعريفي فريد للإعلان';
COMMENT ON COLUMN ads.image_url IS 'المسار فقط: ads/nom-image.png (وليس رابط كامل)';
COMMENT ON COLUMN ads.storage_bucket IS 'اسم البكت في Storage (عادة img)';
COMMENT ON COLUMN ads.storage_path IS 'المسار الكامل للصورة داخل البكت';
COMMENT ON COLUMN ads.created_at IS 'تاريخ إنشاء الإعلان';

-- =====================================================
-- EXEMPLE D'UTILISATION - مثال للاستخدام
-- =====================================================

-- عرض جميع الإعلانات
SELECT * FROM ads;

-- عرض الإعلانات مع معلومات Storage
SELECT 
    id,
    image_url,
    storage_bucket,
    storage_path,
    created_at
FROM ads 
ORDER BY created_at DESC;

-- =====================================================
-- NOTES IMPORTANTES - ملاحظات مهمة
-- =====================================================

/*
✅ الطريقة الصحيحة:
- image_url = 'ads/nom-image.png' (مسار فقط)
- storage_path = 'ads/nom-image.png' (مسار كامل)

❌ الطريقة الخاطئة:
- image_url = 'https://supabase.co/storage/v1/object/public/img/ads/nom-image.png' (رابط كامل)
- تخزين base64 في قاعدة البيانات

📝 ملاحظات:
1. تخزين المسار فقط في image_url
2. استخدام storage_path للوصول المباشر
3. الحصول على الرابط العام في التطبيق
4. لا تخزن روابط كاملة في قاعدة البيانات
*/ 