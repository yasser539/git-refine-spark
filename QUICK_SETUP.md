# حل مشكلة "Error fetching ads"

## المشكلة
يظهر خطأ `Error fetching ads: {}` لأن جداول الإعلانات والتنبيهات غير موجودة في قاعدة البيانات.

## الحل السريع

### 1. تشغيل ملف SQL على Supabase

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **SQL Editor**
4. انسخ محتوى ملف `notifications_tables.sql`
5. الصق الكود واضغط **Run**

### 2. محتوى الملف المطلوب تشغيله

```sql
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

-- Sample data
INSERT INTO ads (title, description, image_url, link_url, status, priority, target_audience) VALUES
('عرض خاص على الحلويات', 'احصل على خصم 20% على جميع الحلويات هذا الأسبوع', 'https://example.com/ad1.jpg', 'https://example.com/offer1', 'active', 1, 'all'),
('توصيل مجاني', 'توصيل مجاني للطلبات التي تزيد عن 50 ريال', 'https://example.com/ad2.jpg', 'https://example.com/free-delivery', 'active', 2, 'customers'),
('انضم إلى فريق التوصيل', 'نبحث عن سائقين موثوقين للانضمام إلى فريقنا', 'https://example.com/ad3.jpg', 'https://example.com/join-us', 'active', 3, 'employees');

INSERT INTO alerts (title, message, type, priority, status, target_audience) VALUES
('صيانة النظام', 'سيتم إجراء صيانة للنظام يوم الأحد من 2-4 صباحاً', 'warning', 'medium', 'active', 'all'),
('تحديث جديد', 'تم إطلاق تحديث جديد للتطبيق مع ميزات محسنة', 'info', 'low', 'active', 'all'),
('عرض محدود', 'عرض خاص على الشوكولاتة لمدة 24 ساعة فقط', 'promotion', 'high', 'active', 'customers');
```

### 3. التحقق من النتيجة

بعد تشغيل الكود:
1. اذهب إلى **Table Editor** في Supabase
2. تأكد من وجود الجداول: `ads`, `alerts`
3. تأكد من وجود البيانات التجريبية

### 4. اختبار التطبيق

1. افتح التطبيق على `http://localhost:3003`
2. اذهب إلى صفحة الإعلانات والإشعارات
3. يجب أن تظهر البيانات التجريبية الآن

## إذا استمرت المشكلة

1. تحقق من إعدادات Supabase في ملف `.env.local`
2. تأكد من أن الجداول `users` و `customers` موجودة
3. تحقق من سجلات Supabase للأخطاء 