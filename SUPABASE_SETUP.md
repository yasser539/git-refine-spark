# إعداد Supabase للإعلانات والتنبيهات

## 🔧 الإعداد السريع (5 دقائق)

### 1. إنشاء الجداول في Supabase

#### اذهب إلى Supabase Dashboard:
1. افتح [supabase.com](https://supabase.com)
2. سجل دخولك إلى مشروعك
3. اذهب إلى **SQL Editor**

#### انسخ والصق هذا الكود:

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

-- إدراج بيانات تجريبية
INSERT INTO ads (title, description, image_url, link_url, status, priority, target_audience) VALUES
('عرض خاص على الحلويات', 'احصل على خصم 20% على جميع الحلويات هذا الأسبوع', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400', 'https://example.com/offer1', 'active', 1, 'all'),
('توصيل مجاني', 'توصيل مجاني للطلبات التي تزيد عن 50 ريال', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 'https://example.com/free-delivery', 'active', 2, 'customers'),
('انضم إلى فريق التوصيل', 'نبحث عن سائقين موثوقين للانضمام إلى فريقنا', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'https://example.com/join-us', 'active', 3, 'employees');

INSERT INTO alerts (title, message, type, priority, status, target_audience) VALUES
('صيانة النظام', 'سيتم إجراء صيانة للنظام يوم الأحد من 2-4 صباحاً', 'warning', 'medium', 'active', 'all'),
('تحديث جديد', 'تم إطلاق تحديث جديد للتطبيق مع ميزات محسنة', 'info', 'low', 'active', 'all'),
('عرض محدود', 'عرض خاص على الشوكولاتة لمدة 24 ساعة فقط', 'promotion', 'high', 'active', 'customers');
```

### 2. التحقق من الإعداد

#### تحقق من الجداول:
1. اذهب إلى **Table Editor**
2. تأكد من وجود الجداول: `ads`, `alerts`
3. تحقق من البيانات التجريبية

#### تحقق من متغيرات البيئة:
في ملف `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. اختبار الربط

#### افتح Console في المتصفح:
1. اضغط F12
2. اذهب إلى تبويب Console
3. أضف إعلان أو تنبيه جديد
4. ستجد رسائل مثل:
   - `🔄 محاولة إضافة الإعلان إلى Supabase...`
   - `✅ تم إضافة الإعلان إلى Supabase بنجاح`

## 🔍 استكشاف الأخطاء

### إذا ظهر خطأ "relation does not exist":
- تأكد من تشغيل كود SQL في Supabase
- تحقق من وجود الجداول في Table Editor

### إذا ظهر خطأ في RLS:
```sql
-- تعطيل RLS مؤقتاً للاختبار
ALTER TABLE ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
```

### إذا لم تعمل الإضافة:
- تحقق من متغيرات البيئة
- تأكد من أن Supabase مشروع نشط
- تحقق من سجلات Supabase

## ✅ النتيجة المتوقعة

بعد الإعداد الصحيح:
- ✅ **الإضافة تعمل** مع Supabase
- ✅ **الحذف يعمل** مع Supabase  
- ✅ **التحديث يعمل** مع Supabase
- ✅ **البيانات محفوظة** في قاعدة البيانات
- ✅ **رسائل واضحة** في Console

## 🚀 اختبار النظام

1. **أضف إعلان جديد** - يجب أن يظهر في Supabase
2. **أضف تنبيه جديد** - يجب أن يظهر في Supabase
3. **احذف عنصر** - يجب أن يختفي من Supabase
4. **غير الحالة** - يجب أن تتحدث في Supabase

الآن النظام مرتبط بشكل كامل مع Supabase! 🎉 