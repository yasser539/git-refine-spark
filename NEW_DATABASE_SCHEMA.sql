-- =====================================================
-- NEW SIMPLIFIED DATABASE SCHEMA
-- مخطط قاعدة البيانات المبسط الجديد
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ADS TABLE - جدول الإعلانات (صور فقط)
-- =====================================================
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL, -- رابط أو مسار الصورة
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. NOTIFICATIONS TABLE - جدول التنبيهات (نص 30 حرف)
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message VARCHAR(30) NOT NULL, -- نص التنبيه بحد أقصى ٣٠ حرف
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. SLOGANS TABLE - جدول الشعارات (عنوان + نص 120 حرف)
-- =====================================================
CREATE TABLE slogans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,         -- عنوان الشعار
    slogan_text VARCHAR(120) NOT NULL, -- نص الشعار بحد أقصى ١٢٠ حرف
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SAMPLE DATA - بيانات تجريبية
-- =====================================================

-- Sample ads (images only)
INSERT INTO ads (image_url) VALUES
('https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400'),
('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'),
('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400');

-- Sample notifications (30 chars max)
INSERT INTO notifications (message) VALUES
('صيانة النظام غداً من 2-4 صباحاً'),
('تحديث جديد للتطبيق متاح الآن'),
('عرض خاص على الحلويات 20% خصم');

-- Sample slogans (title + 120 chars max)
INSERT INTO slogans (title, slogan_text) VALUES
('شعار الشركة', 'نحمل الماء إلى بابك بكل سهولة وأمان، خدمة 24 ساعة على مدار الأسبوع'),
('شعار التوصيل', 'توصيل سريع وآمن، نضمن لك وصول طلبك في الوقت المحدد وبأفضل جودة');

-- =====================================================
-- INDEXES - الفهارس
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_slogans_created_at ON slogans(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - أمان مستوى الصف
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE slogans ENABLE ROW LEVEL SECURITY;

-- Policies for ads (allow all operations for now)
CREATE POLICY "Ads are viewable by everyone" ON ads FOR SELECT USING (true);
CREATE POLICY "Ads are insertable by everyone" ON ads FOR INSERT WITH CHECK (true);
CREATE POLICY "Ads are updatable by everyone" ON ads FOR UPDATE USING (true);
CREATE POLICY "Ads are deletable by everyone" ON ads FOR DELETE USING (true);

-- Policies for notifications (allow all operations for now)
CREATE POLICY "Notifications are viewable by everyone" ON notifications FOR SELECT USING (true);
CREATE POLICY "Notifications are insertable by everyone" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Notifications are updatable by everyone" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Notifications are deletable by everyone" ON notifications FOR DELETE USING (true);

-- Policies for slogans (allow all operations for now)
CREATE POLICY "Slogans are viewable by everyone" ON slogans FOR SELECT USING (true);
CREATE POLICY "Slogans are insertable by everyone" ON slogans FOR INSERT WITH CHECK (true);
CREATE POLICY "Slogans are updatable by everyone" ON slogans FOR UPDATE USING (true);
CREATE POLICY "Slogans are deletable by everyone" ON slogans FOR DELETE USING (true);

-- =====================================================
-- COMMENTS - التعليقات
-- =====================================================

COMMENT ON TABLE ads IS 'جدول الإعلانات - يحتوي على صور الإعلانات فقط';
COMMENT ON TABLE notifications IS 'جدول التنبيهات - يحتوي على نصوص التنبيهات (30 حرف كحد أقصى)';
COMMENT ON TABLE slogans IS 'جدول الشعارات - يحتوي على عناوين ونصوص الشعارات (120 حرف كحد أقصى)';

-- =====================================================
-- END OF SCHEMA - نهاية مخطط قاعدة البيانات
-- ===================================================== 