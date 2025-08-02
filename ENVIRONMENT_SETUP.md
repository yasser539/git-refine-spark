# إعداد متغيرات البيئة

## الملفات المطلوبة

### 1. ملف .env.local
قم بإنشاء ملف `.env.local` في المجلد الرئيسي للمشروع وأضف المتغيرات التالية:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Configuration
DATABASE_URL=your_database_url

# Application Configuration
NEXT_PUBLIC_APP_NAME=Candy Water Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0

# Google Maps API (if needed)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## كيفية الحصول على قيم Supabase

### 1. إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ مشروع جديد
3. اختر اسم المشروع والمنطقة

### 2. الحصول على URL و API Key
1. في لوحة تحكم Supabase، اذهب إلى Settings > API
2. انسخ `Project URL` وضعه في `NEXT_PUBLIC_SUPABASE_URL`
3. انسخ `anon public` key وضعه في `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. إعداد قاعدة البيانات
1. اذهب إلى SQL Editor في Supabase
2. انسخ محتوى ملف `complete_database_schema.sql`
3. نفذ الأوامر لإنشاء الجداول

## تشغيل المشروع

بعد إعداد متغيرات البيئة:

```bash
# تثبيت التبعيات
npm install

# تشغيل المشروع في وضع التطوير
npm run dev
```

## ملاحظات مهمة

- تأكد من أن ملف `.env.local` موجود في `.gitignore`
- لا تشارك مفاتيح API مع أي شخص
- استخدم مفاتيح مختلفة للإنتاج والتطوير 