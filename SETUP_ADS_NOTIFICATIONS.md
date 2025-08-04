# إعداد الإعلانات والتنبيهات والشعارات
# Setup Ads, Notifications, and Slogans

## نظرة عامة | Overview

تم إضافة ثلاثة جداول جديدة إلى قاعدة البيانات:
- **ads**: جدول الإعلانات (صور)
- **notifications**: جدول التنبيهات (رسائل قصيرة)
- **slogans**: جدول الشعارات (عناوين ونصوص)

Three new tables have been added to the database:
- **ads**: Ads table (images)
- **notifications**: Notifications table (short messages)
- **slogans**: Slogans table (titles and texts)

## الخطوات المطلوبة | Required Steps

### 1. إنشاء الجداول في Supabase | Create Tables in Supabase

قم بتنفيذ ملف `ads_notifications_slogans.sql` في Supabase SQL Editor:

Execute the `ads_notifications_slogans.sql` file in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create slogans table
CREATE TABLE IF NOT EXISTS slogans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slogan_text VARCHAR(120) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. إضافة البيانات الأولية | Add Sample Data

```sql
-- Sample ads
INSERT INTO ads (id, image_url, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', NOW());

-- Sample notifications
INSERT INTO notifications (id, message, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440004', 'صيانة النظام غداً من 2-4 صباحاً', NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'تحديث جديد للتطبيق متاح الآن', NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'عرض خاص على الحلويات 20% خصم', NOW());

-- Sample slogans
INSERT INTO slogans (id, title, slogan_text, created_at) VALUES 
('550e8400-e29b-41d4-a716-446655440007', 'شعار الشركة', 'نحمل الماء إلى بابك بكل سهولة وأمان، خدمة 24 ساعة على مدار الأسبوع', NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'شعار التوصيل', 'توصيل سريع وآمن، نضمن لك وصول طلبك في الوقت المحدد وبأفضل جودة', NOW());
```

## الميزات المضافة | Added Features

### 1. خدمات قاعدة البيانات | Database Services

تم إضافة الخدمات التالية في `src/lib/supabase-services.ts`:

The following services have been added in `src/lib/supabase-services.ts`:

- `adsService`: خدمات الإعلانات
- `notificationsService`: خدمات التنبيهات  
- `slogansService`: خدمات الشعارات

### 2. أنواع البيانات | Type Definitions

تم إضافة الأنواع التالية في `src/lib/supabase.ts`:

The following types have been added in `src/lib/supabase.ts`:

```typescript
export interface Ad {
  id: string
  image_url: string
  created_at: string
}

export interface Notification {
  id: string
  message: string
  created_at: string
}

export interface Slogan {
  id: string
  title: string
  slogan_text: string
  created_at: string
}
```

### 3. واجهة المستخدم | User Interface

تم تحديث صفحة الإشعارات (`src/app/notifications/page.tsx`) لتشمل:

The notifications page (`src/app/notifications/page.tsx`) has been updated to include:

- عرض الإعلانات والتنبيهات والشعارات
- إضافة عناصر جديدة
- حذف العناصر
- إحصائيات مباشرة

## الاستخدام | Usage

### الوصول للصفحة | Access the Page

1. سجل دخول كمدير أو موظف
2. انتقل إلى صفحة "الإعلانات والتنبيهات"
3. اختر التبويب المطلوب (إعلانات، تنبيهات، شعارات)

### إضافة عنصر جديد | Add New Item

1. اضغط على زر "إضافة جديد"
2. اختر نوع المحتوى (إعلان، تنبيه، شعار)
3. املأ البيانات المطلوبة
4. اضغط "إضافة"

### حذف عنصر | Delete Item

1. اضغط على زر الحذف (سلة المهملات)
2. أكد الحذف

## ملاحظات مهمة | Important Notes

- الإعلانات: تحتوي على صور فقط
- التنبيهات: نص قصير بحد أقصى 30 حرف
- الشعارات: عنوان ونص بحد أقصى 120 حرف

- Ads: contain images only
- Notifications: short text with max 30 characters
- Slogans: title and text with max 120 characters

## استكشاف الأخطاء | Troubleshooting

إذا واجهت مشاكل:

If you encounter issues:

1. تأكد من إنشاء الجداول في Supabase
2. تحقق من متغيرات البيئة (environment variables)
3. راجع وحدة التحكم في المتصفح للأخطاء
4. تأكد من صلاحيات المستخدم

1. Make sure tables are created in Supabase
2. Check environment variables
3. Review browser console for errors
4. Verify user permissions 