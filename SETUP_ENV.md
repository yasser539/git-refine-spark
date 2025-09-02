# إعداد متغيرات البيئة

## خطوات إعداد ملف .env.local

1. **أنشئ ملف `.env.local` في المجلد الرئيسي للمشروع**

2. **أضف المتغيرات التالية إلى الملف:**

```env
# متغيرات البيئة لـ Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Maps API Key (اختياري)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

3. **استبدل القيم بالبيانات الحقيقية من مشروع Supabase الخاص بك:**

   - اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
   - اختر مشروعك
   - اذهب إلى Settings > API
   - انسخ `Project URL` و `anon public` key

4. **مثال على القيم الصحيحة:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcd1234.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2QxMjM0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2MzQ1Njc4NzQsImV4cCI6MTk1MDE0Mzg3NH0.example
```

## إعداد قاعدة البيانات

بعد إنشاء ملف `.env.local`، تأكد من تنفيذ ملف SQL التالي في Supabase:

1. اذهب إلى Supabase Dashboard > SQL Editor
2. انسخ محتوى الملفات التالية ونفذها:
   - `delivery_captains_setup.sql`
   - `database_schema.sql`
   - `products_table.sql`
   - `notifications_tables.sql`

## اختبار الاتصال

بعد إعداد المتغيرات، يمكنك اختبار الاتصال من خلال:
1. اذهب إلى صفحة `/test-db` في التطبيق
2. اضغط على "اختبار الاتصال"
3. تأكد من أن جميع الاختبارات تنجح

## ملاحظات مهمة

- لا تشارك ملف `.env.local` في Git
- تأكد من أن RLS (Row Level Security) مفعل في Supabase
- تأكد من إنشاء جميع الجداول المطلوبة

