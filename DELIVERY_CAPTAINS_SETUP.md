# إعداد نظام كباتن التوصيل والمناديب

## نظرة عامة

تم إنشاء نظام شامل لإدارة كباتن التوصيل والمناديب يتضمن:

- **جدول كباتن التوصيل**: معلومات شاملة عن الكباتن والمناديب
- **جدول سجل العمل**: تتبع التوصيلات والأداء
- **جدول الأداء الشهري**: إحصائيات شهرية مفصلة
- **صفحة إدارة الويب**: واجهة مستخدم متكاملة

## الخطوات المطلوبة

### 1. إعداد قاعدة البيانات

1. **اذهب إلى Supabase Dashboard**
2. **افتح SQL Editor**
3. **انسخ محتوى ملف `delivery_captains_setup.sql`**
4. **نفذ الكود دفعة واحدة**

### 2. إعداد Storage Buckets

1. **اذهب إلى Storage في Supabase**
2. **أنشئ bucket جديد باسم `captain-profiles`**
3. **حدد الإعدادات:**
   - Public bucket: ✅
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

### 3. إعداد سياسات Storage

في SQL Editor، نفذ هذه السياسات:

```sql
-- Public read access
CREATE POLICY "Allow public read access to captain profiles" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'captain-profiles');

-- Upload access for authenticated users
CREATE POLICY "Allow authenticated users to upload captain profiles" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'captain-profiles' AND auth.role() = 'authenticated');

-- Delete access for authenticated users
CREATE POLICY "Allow authenticated users to delete captain profiles" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'captain-profiles' AND auth.role() = 'authenticated');
```

### 4. تحديث التطبيق

تم تحديث الملفات التالية:

- ✅ `src/lib/supabase.ts` - إضافة أنواع البيانات الجديدة
- ✅ `src/lib/supabase-services.ts` - تحديث خدمات كباتن التوصيل
- ✅ `src/app/delivery-captains/page.tsx` - صفحة إدارة كباتن التوصيل
- ✅ `src/app/components/Sidebar.tsx` - إضافة رابط كباتن التوصيل

## الميزات المتاحة

### 📊 إحصائيات شاملة
- إجمالي الكباتن
- الكباتن النشطون
- الكباتن في إجازة
- إجمالي التوصيلات

### 👥 إدارة الكباتن
- عرض جميع الكباتن
- معلومات مفصلة لكل كابتن
- حالة الكابتن (نشط/إجازة/غير نشط)
- معلومات المركبة
- الأداء والتقييم

### 📈 تتبع الأداء
- عدد التوصيلات
- التقييم من العملاء
- الأرباح الإجمالية
- الأداء الشهري

### 🚗 معلومات المركبة
- نوع المركبة
- موديل المركبة
- رقم اللوحة
- لون المركبة

## هيكل قاعدة البيانات

### جدول `delivery_captains`
```sql
- id (UUID, Primary Key)
- name (VARCHAR, NOT NULL)
- email (VARCHAR, UNIQUE, NOT NULL)
- phone (VARCHAR, NOT NULL)
- password (VARCHAR, NOT NULL)
- position (VARCHAR, 'كابتن توصيل' | 'مندوب')
- status (VARCHAR, 'نشط' | 'إجازة' | 'غير نشط')
- location, city, region (VARCHAR)
- description (TEXT)
- avatar, profile_image (VARCHAR)
- performance, tasks, completed (INTEGER)
- rating (DECIMAL)
- total_deliveries, total_earnings (INTEGER, DECIMAL)
- vehicle_type, vehicle_model, vehicle_plate, vehicle_color (VARCHAR)
- emergency_contact, emergency_phone (VARCHAR)
- id_number, license_number, insurance_number (VARCHAR)
- join_date, contract_start_date, contract_end_date (TIMESTAMP, DATE)
- salary, commission_rate (DECIMAL)
- device_id, app_version, last_active (VARCHAR, TIMESTAMP)
- is_verified, verification_date (BOOLEAN, TIMESTAMP)
- background_check_status (VARCHAR)
- created_at, updated_at (TIMESTAMP)
- created_by, updated_by (UUID)
- notes, admin_notes (TEXT)
```

### جدول `delivery_work_logs`
```sql
- id (UUID, Primary Key)
- captain_id (UUID, Foreign Key)
- order_id, customer_name (VARCHAR)
- delivery_address (TEXT)
- delivery_phone (VARCHAR)
- pickup_time, delivery_time (TIMESTAMP)
- total_distance, delivery_fee (DECIMAL)
- customer_rating (INTEGER, 1-5)
- customer_feedback (TEXT)
- status (VARCHAR, 'pending' | 'picked_up' | 'delivered' | 'cancelled')
- notes (TEXT)
- created_at (TIMESTAMP)
```

### جدول `delivery_performance_monthly`
```sql
- id (UUID, Primary Key)
- captain_id (UUID, Foreign Key)
- year, month (INTEGER)
- total_deliveries, completed_deliveries, cancelled_deliveries (INTEGER)
- total_earnings, average_rating, total_distance (DECIMAL)
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

## الدوال والتريجرات

### دالة `calculate_captain_performance`
تحسب أداء الكابتن تلقائياً بناءً على:
- متوسط تقييم العملاء
- عدد التوصيلات الإجمالي
- عدد التوصيلات المكتملة
- إجمالي الأرباح

### تريجر `update_captain_performance_trigger`
يحدث أداء الكابتن تلقائياً عند إضافة أو تحديث سجل عمل

## البيانات التجريبية

تم إضافة 8 كباتن توصيل تجريبيين مع:
- معلومات شخصية كاملة
- معلومات المركبة
- بيانات الأداء
- سجلات عمل تجريبية

## الأمان والصلاحيات

### RLS (Row Level Security)
- تم تفعيل RLS على جميع الجداول
- سياسات للقراءة والكتابة للمستخدمين المصادق عليهم

### Storage Policies
- قراءة عامة للصور
- رفع وحذف للمستخدمين المصادق عليهم

## الخطوات التالية

1. **نفذ ملف SQL** في Supabase
2. **أنشئ Storage Bucket** للصور
3. **اختبر التطبيق** على `/delivery-captains`
4. **أضف المزيد من الميزات** حسب الحاجة

## ملاحظات مهمة

- في الإنتاج، استخدم تشفير لكلمات المرور
- أضف التحقق من البريد الإلكتروني
- نفذ صلاحيات أكثر تفصيلاً
- أضف نظام إشعارات للكباتن
- ربط مع نظام الخرائط للتتبع المباشر

## استكشاف الأخطاء

### مشكلة: لا تظهر البيانات
- تأكد من تنفيذ SQL بنجاح
- تحقق من سياسات RLS
- تأكد من وجود بيانات تجريبية

### مشكلة: لا ترفع الصور
- تأكد من إنشاء Storage Bucket
- تحقق من سياسات Storage
- تأكد من صحة نوع الملف

### مشكلة: أخطاء في التطبيق
- تحقق من console للتفاصيل
- تأكد من تحديث جميع الملفات
- أعد تشغيل التطبيق
