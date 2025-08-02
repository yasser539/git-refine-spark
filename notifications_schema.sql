-- =====================================================
-- NOTIFICATIONS, ADS, AND ALERTS SCHEMA
-- مخطط الإعلانات والتنبيهات والإشعارات
-- =====================================================

-- Enable UUID extension
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
-- AD_VIEWS TABLE - جدول مشاهدات الإعلانات
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
-- AD_CLICKS TABLE - جدول نقرات الإعلانات
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
-- ALERT_VIEWS TABLE - جدول مشاهدات التنبيهات
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
-- ALERT_DISMISSALS TABLE - جدول إغلاق التنبيهات
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
-- INDEXES FOR BETTER PERFORMANCE - فهارس لتحسين الأداء
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

-- Ad views and clicks indexes
CREATE INDEX IF NOT EXISTS idx_ad_views_ad_id ON ad_views(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_user_id ON ad_views(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_views_customer_id ON ad_views(customer_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_user_id ON ad_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_customer_id ON ad_clicks(customer_id);

-- Alert views and dismissals indexes
CREATE INDEX IF NOT EXISTS idx_alert_views_alert_id ON alert_views(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_views_user_id ON alert_views(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_views_customer_id ON alert_views(customer_id);
CREATE INDEX IF NOT EXISTS idx_alert_dismissals_alert_id ON alert_dismissals(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_dismissals_user_id ON alert_dismissals(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_dismissals_customer_id ON alert_dismissals(customer_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT - محفزات لتحديث updated_at
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for ads and alerts tables
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA INSERTION - إدراج البيانات الأولية
-- =====================================================

-- Insert sample ads
INSERT INTO ads (id, title, description, image_url, link_url, status, target_audience, created_by) VALUES 
('550e8400-e29b-41d4-a716-446655440010', 'إعلان CANDY', 'إعلان تجاري لمنتجات الحلويات', '/images/candy-logo.png', '/products', 'active', 'all', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440011', 'عرض خاص', 'خصومات على جميع المنتجات', '/images/special-offer.png', '/offers', 'active', 'customers', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT DO NOTHING;

-- Insert sample alerts
INSERT INTO alerts (id, title, message, type, priority, status, target_audience, created_by) VALUES 
('550e8400-e29b-41d4-a716-446655440012', 'خصم 20% على المياه المعدنية', 'احصل على خصم 20% على جميع أنواع المياه المعدنية', 'promotion', 'high', 'active', 'all', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440013', 'صيانة النظام', 'سيتم إجراء صيانة للنظام غداً من الساعة 2-4 صباحاً', 'warning', 'medium', 'active', 'all', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT DO NOTHING;

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

-- =====================================================
-- COMMENTS - التعليقات
-- =====================================================

COMMENT ON TABLE ads IS 'جدول الإعلانات - إعلانات النظام للمستخدمين';
COMMENT ON TABLE alerts IS 'جدول التنبيهات - تنبيهات النظام للمستخدمين';
COMMENT ON TABLE ad_views IS 'جدول مشاهدات الإعلانات - تتبع مشاهدات الإعلانات';
COMMENT ON TABLE ad_clicks IS 'جدول نقرات الإعلانات - تتبع نقرات الإعلانات';
COMMENT ON TABLE alert_views IS 'جدول مشاهدات التنبيهات - تتبع مشاهدات التنبيهات';
COMMENT ON TABLE alert_dismissals IS 'جدول إغلاق التنبيهات - تتبع إغلاق التنبيهات';

-- =====================================================
-- END OF SCHEMA - نهاية مخطط قاعدة البيانات
-- ===================================================== 