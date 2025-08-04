-- =====================================================
-- UPDATED ADS TABLE - جدول الإعلانات المحدث
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ADS TABLE - جدول الإعلانات
-- =====================================================
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),            -- رقم تعريفي فريد للإعلان
    image_url TEXT NOT NULL,                                  -- مسار أو رابط الصورة في Storage
    storage_bucket TEXT DEFAULT 'img',                        -- اسم البكت (عادة 'img')
    storage_path TEXT,                                        -- المسار الكامل داخل البكت (مثلاً 'ads/uuid.png')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP            -- تاريخ إضافة الإعلان
);

-- =====================================================
-- INDEXES FOR BETTER PERFORMANCE - فهارس لتحسين الأداء
-- =====================================================

-- Ads indexes
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at);
CREATE INDEX IF NOT EXISTS idx_ads_storage_bucket ON ads(storage_bucket);

-- =====================================================
-- SAMPLE DATA INSERTION - إدراج البيانات الأولية
-- =====================================================

-- Insert sample ads
INSERT INTO ads (id, image_url, storage_bucket, storage_path, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400', 'img', 'ads/sample-ad-1.jpg', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 'img', 'ads/sample-ad-2.jpg', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'img', 'ads/sample-ad-3.jpg', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMMENTS - التعليقات
-- =====================================================

COMMENT ON TABLE ads IS 'جدول الإعلانات - يحتوي على صور الإعلانات مع معلومات Storage';
COMMENT ON COLUMN ads.id IS 'رقم تعريفي فريد للإعلان';
COMMENT ON COLUMN ads.image_url IS 'رابط الصورة العامة';
COMMENT ON COLUMN ads.storage_bucket IS 'اسم البكت في Storage (عادة img)';
COMMENT ON COLUMN ads.storage_path IS 'المسار الكامل للصورة داخل البكت';
COMMENT ON COLUMN ads.created_at IS 'تاريخ إنشاء الإعلان';

-- =====================================================
-- END OF SCHEMA - نهاية مخطط قاعدة البيانات
-- ===================================================== 