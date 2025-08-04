-- =====================================================
-- ADS, NOTIFICATIONS, AND SLOGANS TABLES
-- جداول الإعلانات والتنبيهات والشعارات
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ADS TABLE - جدول الإعلانات
-- =====================================================
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL, -- رابط أو مسار الصورة
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- NOTIFICATIONS TABLE - جدول التنبيهات
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message VARCHAR(30) NOT NULL, -- نص التنبيه بحد أقصى ٣٠ حرف
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SLOGANS TABLE - جدول الشعارات
-- =====================================================
CREATE TABLE IF NOT EXISTS slogans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,         -- عنوان الشعار
    slogan_text VARCHAR(120) NOT NULL, -- نص الشعار بحد أقصى ١٢٠ حرف
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR BETTER PERFORMANCE - فهارس لتحسين الأداء
-- =====================================================

-- Ads indexes
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Slogans indexes
CREATE INDEX IF NOT EXISTS idx_slogans_created_at ON slogans(created_at);

-- =====================================================
-- SAMPLE DATA INSERTION - إدراج البيانات الأولية
-- =====================================================

-- Insert sample ads
INSERT INTO ads (id, image_url, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (id, message, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440004', 'صيانة النظام غداً من 2-4 صباحاً', NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'تحديث جديد للتطبيق متاح الآن', NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'عرض خاص على الحلويات 20% خصم', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample slogans
INSERT INTO slogans (id, title, slogan_text, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440007', 'شعار الشركة', 'نحمل الماء إلى بابك بكل سهولة وأمان، خدمة 24 ساعة على مدار الأسبوع', NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'شعار التوصيل', 'توصيل سريع وآمن، نضمن لك وصول طلبك في الوقت المحدد وبأفضل جودة', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMMENTS - التعليقات
-- =====================================================

COMMENT ON TABLE ads IS 'جدول الإعلانات - يحتوي على صور الإعلانات';
COMMENT ON TABLE notifications IS 'جدول التنبيهات - يحتوي على رسائل التنبيهات القصيرة';
COMMENT ON TABLE slogans IS 'جدول الشعارات - يحتوي على عناوين ونصوص الشعارات';

-- =====================================================
-- END OF SCHEMA - نهاية مخطط قاعدة البيانات
-- ===================================================== 