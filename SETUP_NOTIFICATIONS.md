# إعداد نظام الإعلانات والتنبيهات

## الخطوات المطلوبة لتشغيل النظام

### 1. تشغيل ملف SQL على قاعدة البيانات

قم بتشغيل الملف `notifications_tables.sql` على قاعدة البيانات الخاصة بك:

#### في Supabase:
1. اذهب إلى لوحة تحكم Supabase
2. اذهب إلى **SQL Editor** (في القائمة الجانبية)
3. انسخ محتوى ملف `notifications_tables.sql`
4. الصق الكود في المحرر
5. اضغط **Run** أو **Ctrl+Enter**

#### في PostgreSQL مباشرة:
```bash
psql -h your-host -U your-username -d your-database -f notifications_tables.sql
```

### 2. التحقق من إنشاء الجداول

بعد تشغيل الملف، تأكد من إنشاء الجداول التالية في Supabase:
- `ads` - جدول الإعلانات
- `alerts` - جدول التنبيهات
- `ad_views` - جدول مشاهدات الإعلانات
- `ad_clicks` - جدول نقرات الإعلانات
- `alert_views` - جدول مشاهدات التنبيهات
- `alert_dismissals` - جدول إغلاق التنبيهات

**للتحقق من الجداول:**
1. اذهب إلى **Table Editor** في Supabase
2. تأكد من وجود الجداول المذكورة أعلاه

### 3. التحقق من البيانات التجريبية

بعد تشغيل الملف، ستجد بيانات تجريبية في الجداول:
- 3 إعلانات تجريبية
- 3 تنبيهات تجريبية

**للتحقق من البيانات:**
1. اذهب إلى **Table Editor** في Supabase
2. اختر جدول `ads` أو `alerts`
3. تأكد من وجود البيانات التجريبية

### 4. اختبار النظام

بعد تشغيل الملف، يمكنك:
1. فتح التطبيق على `http://localhost:3003`
2. الذهاب إلى صفحة الإعلانات والإشعارات
3. التأكد من ظهور البيانات التجريبية

## استكشاف الأخطاء

### إذا واجهت خطأ "Error fetching notifications data: {}":

1. **تأكد من تشغيل ملف SQL:**
   - اذهب إلى Supabase SQL Editor
   - تأكد من تشغيل `notifications_tables.sql`

2. **تحقق من وجود الجداول:**
   - اذهب إلى Table Editor في Supabase
   - تأكد من وجود جداول `ads` و `alerts`

3. **تحقق من إعدادات Supabase:**
   - تأكد من أن متغيرات البيئة صحيحة
   - تأكد من أن RLS (Row Level Security) مفعل

### إذا واجهت خطأ "relation does not exist":

هذا يعني أن الجداول لم يتم إنشاؤها. اتبع الخطوات التالية:

1. **تشغيل ملف SQL مرة أخرى:**
   ```sql
   -- انسخ محتوى notifications_tables.sql
   -- والصقه في SQL Editor
   -- ثم اضغط Run
   ```

2. **التحقق من الأخطاء:**
   - تحقق من سجلات Supabase
   - تأكد من أن لديك صلاحيات كافية

### إذا واجهت خطأ في RLS (Row Level Security):

1. **تعطيل RLS مؤقتاً للاختبار:**
   ```sql
   ALTER TABLE ads DISABLE ROW LEVEL SECURITY;
   ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
   ```

2. **أو إضافة سياسات مخصصة:**
   ```sql
   CREATE POLICY "Allow all operations" ON ads FOR ALL USING (true);
   CREATE POLICY "Allow all operations" ON alerts FOR ALL USING (true);
   ```

## ملاحظات مهمة

- تأكد من أن جدول `users` موجود قبل تشغيل هذا الملف
- تأكد من أن جدول `customers` موجود قبل تشغيل هذا الملف
- إذا واجهت أي أخطاء، تحقق من سجلات Supabase
- تأكد من أن متغيرات البيئة صحيحة في ملف `.env.local`

## متغيرات البيئة المطلوبة

تأكد من وجود المتغيرات التالية في ملف `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## اختبار النظام

بعد إكمال جميع الخطوات:

1. **إعادة تشغيل التطبيق:**
   ```bash
   npm run dev
   ```

2. **فتح صفحة الإعلانات:**
   - اذهب إلى `http://localhost:3003/notifications`
   - تأكد من ظهور البيانات التجريبية

3. **اختبار الوظائف:**
   - اختبار إظهار/إخفاء الإعلانات
   - اختبار حذف الإعلانات
   - اختبار تحديث البيانات 