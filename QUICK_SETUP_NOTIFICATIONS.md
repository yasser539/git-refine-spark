# إعداد سريع لنظام الإعلانات والتنبيهات

## الطريقة السريعة (5 دقائق)

### 1. اذهب إلى Supabase Dashboard
- افتح [supabase.com](https://supabase.com)
- سجل دخولك إلى مشروعك

### 2. افتح SQL Editor
- في القائمة الجانبية، اضغط على **SQL Editor**
- اضغط على **New Query**

### 3. انسخ والصق الكود التالي

```sql
-- إنشاء جداول الإعلانات والتنبيهات
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- جدول الإعلانات
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
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول التنبيهات
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
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جداول التتبع
CREATE TABLE IF NOT EXISTS ad_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    user_id UUID,
    customer_id UUID,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    user_id UUID,
    customer_id UUID,
    ip_address INET,
    user_agent TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    user_id UUID,
    customer_id UUID,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_dismissals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    user_id UUID,
    customer_id UUID,
    ip_address INET,
    user_agent TEXT,
    dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج بيانات تجريبية
INSERT INTO ads (title, description, image_url, link_url, status, priority, target_audience) VALUES
('عرض خاص على الحلويات', 'احصل على خصم 20% على جميع الحلويات هذا الأسبوع', 'https://example.com/ad1.jpg', 'https://example.com/offer1', 'active', 1, 'all'),
('توصيل مجاني', 'توصيل مجاني للطلبات التي تزيد عن 50 ريال', 'https://example.com/ad2.jpg', 'https://example.com/free-delivery', 'active', 2, 'customers'),
('انضم إلى فريق التوصيل', 'نبحث عن سائقين موثوقين للانضمام إلى فريقنا', 'https://example.com/ad3.jpg', 'https://example.com/join-us', 'active', 3, 'employees');

INSERT INTO alerts (title, message, type, priority, status, target_audience) VALUES
('صيانة النظام', 'سيتم إجراء صيانة للنظام يوم الأحد من 2-4 صباحاً', 'warning', 'medium', 'active', 'all'),
('تحديث جديد', 'تم إطلاق تحديث جديد للتطبيق مع ميزات محسنة', 'info', 'low', 'active', 'all'),
('عرض محدود', 'عرض خاص على الشوكولاتة لمدة 24 ساعة فقط', 'promotion', 'high', 'active', 'customers');
```

### 4. اضغط Run
- اضغط على زر **Run** أو **Ctrl+Enter**

### 5. تحقق من النتيجة
- اذهب إلى **Table Editor**
- تأكد من وجود الجداول: `ads`, `alerts`, `ad_views`, `ad_clicks`, `alert_views`, `alert_dismissals`

### 6. اختبر التطبيق
```bash
npm run dev
```
ثم اذهب إلى `http://localhost:3003/notifications`

## استكشاف الأخطاء

### إذا ظهر خطأ "relation does not exist":
- تأكد من أنك في المشروع الصحيح في Supabase
- تأكد من أن لديك صلاحيات كافية

### إذا ظهر خطأ في RLS:
```sql
-- تعطيل RLS مؤقتاً
ALTER TABLE ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
```

### إذا لم تظهر البيانات:
- تحقق من أن البيانات التجريبية تم إدراجها بنجاح
- اذهب إلى Table Editor وتحقق من وجود البيانات

## النتيجة المتوقعة

بعد التشغيل الناجح، ستجد:
- ✅ 3 إعلانات تجريبية
- ✅ 3 تنبيهات تجريبية
- ✅ صفحة الإعلانات تعمل بشكل صحيح
- ✅ إحصائيات كاملة

## مساعدة إضافية

إذا واجهت أي مشاكل:
1. تحقق من ملف `SETUP_NOTIFICATIONS.md` للحصول على دليل مفصل
2. تأكد من أن متغيرات البيئة صحيحة في `.env.local`
3. تحقق من سجلات Supabase للأخطاء 