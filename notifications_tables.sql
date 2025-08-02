-- =====================================================
-- NOTIFICATIONS SYSTEM TABLES - جداول نظام الإعلانات والتنبيهات
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ADS TABLE - جدول الإعلانات
-- =====================================================
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    link_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    priority INTEGER DEFAULT 1,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'customers', 'merchants', 'employees')),
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ALERTS TABLE - جدول التنبيهات
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success', 'promotion')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'customers', 'merchants', 'employees', 'admins')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    is_dismissible BOOLEAN DEFAULT true,
    requires_action BOOLEAN DEFAULT false,
    action_url VARCHAR(255),
    action_text VARCHAR(100),
    views_count INTEGER DEFAULT 0,
    dismissals_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AD VIEWS TABLE - جدول مشاهدات الإعلانات
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AD CLICKS TABLE - جدول نقرات الإعلانات
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ALERT VIEWS TABLE - جدول مشاهدات التنبيهات
-- =====================================================
CREATE TABLE IF NOT EXISTS alert_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ALERT DISMISSALS TABLE - جدول إغلاق التنبيهات
-- =====================================================
CREATE TABLE IF NOT EXISTS alert_dismissals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES - الفهارس
-- =====================================================

-- Ads indexes
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_target_audience ON ads(target_audience);
CREATE INDEX IF NOT EXISTS idx_ads_start_date ON ads(start_date);
CREATE INDEX IF NOT EXISTS idx_ads_end_date ON ads(end_date);
CREATE INDEX IF NOT EXISTS idx_ads_created_by ON ads(created_by);

-- Alerts indexes
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON alerts(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_target_audience ON alerts(target_audience);
CREATE INDEX IF NOT EXISTS idx_alerts_start_date ON alerts(start_date);
CREATE INDEX IF NOT EXISTS idx_alerts_end_date ON alerts(end_date);
CREATE INDEX IF NOT EXISTS idx_alerts_created_by ON alerts(created_by);

-- Tracking indexes
CREATE INDEX IF NOT EXISTS idx_ad_views_ad_id ON ad_views(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_user_id ON ad_views(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_customer_id ON ad_views(customer_id);

CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_user_id ON ad_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_customer_id ON ad_clicks(customer_id);

CREATE INDEX IF NOT EXISTS idx_alert_views_alert_id ON alert_views(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_views_user_id ON alert_views(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_views_customer_id ON alert_views(customer_id);

CREATE INDEX IF NOT EXISTS idx_alert_dismissals_alert_id ON alert_dismissals(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_dismissals_user_id ON alert_dismissals(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_dismissals_customer_id ON alert_dismissals(customer_id);

-- =====================================================
-- TRIGGERS - المشغلات
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for ads and alerts
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA - بيانات تجريبية
-- =====================================================

-- Sample ads
INSERT INTO ads (title, description, image_url, link_url, status, priority, target_audience) VALUES
('عرض خاص على الحلويات', 'احصل على خصم 20% على جميع الحلويات هذا الأسبوع', 'https://example.com/ad1.jpg', 'https://example.com/offer1', 'active', 1, 'all'),
('توصيل مجاني', 'توصيل مجاني للطلبات التي تزيد عن 50 ريال', 'https://example.com/ad2.jpg', 'https://example.com/free-delivery', 'active', 2, 'customers'),
('انضم إلى فريق التوصيل', 'نبحث عن سائقين موثوقين للانضمام إلى فريقنا', 'https://example.com/ad3.jpg', 'https://example.com/join-us', 'active', 3, 'employees');

-- Sample alerts
INSERT INTO alerts (title, message, type, priority, status, target_audience) VALUES
('صيانة النظام', 'سيتم إجراء صيانة للنظام يوم الأحد من 2-4 صباحاً', 'warning', 'medium', 'active', 'all'),
('تحديث جديد', 'تم إطلاق تحديث جديد للتطبيق مع ميزات محسنة', 'info', 'low', 'active', 'all'),
('عرض محدود', 'عرض خاص على الشوكولاتة لمدة 24 ساعة فقط', 'promotion', 'high', 'active', 'customers');

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - أمان مستوى الصف
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_dismissals ENABLE ROW LEVEL SECURITY;

-- Policies for ads (allow read for all, write for admins)
CREATE POLICY "Ads are viewable by everyone" ON ads FOR SELECT USING (true);
CREATE POLICY "Ads are insertable by admins" ON ads FOR INSERT WITH CHECK (auth.role() = 'admin');
CREATE POLICY "Ads are updatable by admins" ON ads FOR UPDATE USING (auth.role() = 'admin');
CREATE POLICY "Ads are deletable by admins" ON ads FOR DELETE USING (auth.role() = 'admin');

-- Policies for alerts (allow read for all, write for admins)
CREATE POLICY "Alerts are viewable by everyone" ON alerts FOR SELECT USING (true);
CREATE POLICY "Alerts are insertable by admins" ON alerts FOR INSERT WITH CHECK (auth.role() = 'admin');
CREATE POLICY "Alerts are updatable by admins" ON alerts FOR UPDATE USING (auth.role() = 'admin');
CREATE POLICY "Alerts are deletable by admins" ON alerts FOR DELETE USING (auth.role() = 'admin');

-- Policies for tracking tables (allow insert for all, read for admins)
CREATE POLICY "Tracking data is insertable by everyone" ON ad_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Tracking data is viewable by admins" ON ad_views FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY "Tracking data is insertable by everyone" ON ad_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Tracking data is viewable by admins" ON ad_clicks FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY "Tracking data is insertable by everyone" ON alert_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Tracking data is viewable by admins" ON alert_views FOR SELECT USING (auth.role() = 'admin');

CREATE POLICY "Tracking data is insertable by everyone" ON alert_dismissals FOR INSERT WITH CHECK (true);
CREATE POLICY "Tracking data is viewable by admins" ON alert_dismissals FOR SELECT USING (auth.role() = 'admin');

-- =====================================================
-- COMMENTS - التعليقات
-- =====================================================

COMMENT ON TABLE ads IS 'جدول الإعلانات - يحتوي على جميع الإعلانات في النظام';
COMMENT ON TABLE alerts IS 'جدول التنبيهات - يحتوي على جميع التنبيهات والإشعارات المهمة';
COMMENT ON TABLE ad_views IS 'جدول مشاهدات الإعلانات - لتتبع عدد المشاهدات لكل إعلان';
COMMENT ON TABLE ad_clicks IS 'جدول نقرات الإعلانات - لتتبع عدد النقرات على كل إعلان';
COMMENT ON TABLE alert_views IS 'جدول مشاهدات التنبيهات - لتتبع عدد المشاهدات لكل تنبيه';
COMMENT ON TABLE alert_dismissals IS 'جدول إغلاق التنبيهات - لتتبع عدد مرات إغلاق كل تنبيه'; 