-- إعداد Supabase Storage للصور

-- إنشاء bucket للصور (يتم إنشاؤه من لوحة تحكم Supabase)
-- اسم Bucket: img
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/*

-- إعداد سياسات الأمان للـ bucket

-- السماح للجميع بقراءة الصور (لأنها عامة)
CREATE POLICY "Allow public read access to images" ON storage.objects
    FOR SELECT USING (bucket_id = 'img');

-- السماح للمديرين برفع الصور
CREATE POLICY "Allow admin upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'img' AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- السماح للمديرين بحذف الصور
CREATE POLICY "Allow admin delete images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'img' AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- السماح للمديرين بتحديث الصور
CREATE POLICY "Allow admin update images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'img' AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- إعداد CORS للـ bucket (اختياري - للاستخدام من المتصفح)
-- يمكن إعداده من لوحة تحكم Supabase في Storage > Settings > CORS

-- ملاحظات مهمة:
-- 1. تأكد من إنشاء bucket باسم "img" في لوحة تحكم Supabase
-- 2. تأكد من تفعيل RLS على bucket
-- 3. تأكد من إعداد السياسات المذكورة أعلاه
-- 4. تأكد من أن bucket عام (public) لعرض الصور 