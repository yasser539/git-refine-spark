# إعداد Supabase Storage للصور

## إنشاء Bucket للصور

### 1. إنشاء Bucket في Supabase
1. اذهب إلى لوحة تحكم Supabase
2. اذهب إلى Storage في القائمة الجانبية
3. اضغط على "Create a new bucket"
4. أدخل المعلومات التالية:
   - **Name**: `img`
   - **Public bucket**: ✅ (مفعل)
   - **File size limit**: `5MB`
   - **Allowed MIME types**: `image/*`

### 2. إعداد سياسات الأمان
بعد إنشاء Bucket، اذهب إلى Settings > Policies وأضف السياسات التالية:

#### سياسة القراءة العامة
```sql
CREATE POLICY "Allow public read access to images" ON storage.objects
    FOR SELECT USING (bucket_id = 'img');
```

#### سياسة رفع الصور للمديرين
```sql
CREATE POLICY "Allow admin upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'img' AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );
```

#### سياسة حذف الصور للمديرين
```sql
CREATE POLICY "Allow admin delete images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'img' AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );
```

### 3. إعداد CORS (اختياري)
إذا كنت تريد رفع الصور من المتصفح مباشرة:

1. اذهب إلى Storage > Settings > CORS
2. أضف القواعد التالية:
   ```
   Origin: *
   Methods: GET, POST, PUT, DELETE
   Headers: *
   ```

## استخدام Storage في التطبيق

### رفع صورة
```typescript
import { storageService } from '../lib/database-services';

const uploadImage = async (file: File) => {
  const imageUrl = await storageService.uploadProductImage(file);
  if (imageUrl) {
    console.log('Image uploaded:', imageUrl);
  }
};
```

### حذف صورة
```typescript
const deleteImage = async (imageUrl: string) => {
  const success = await storageService.deleteProductImage(imageUrl);
  if (success) {
    console.log('Image deleted successfully');
  }
};
```

## هيكل الملفات في Bucket

```
img/
├── 1703123456789-abc123.jpg
├── 1703123456790-def456.png
└── 1703123456791-ghi789.gif
```

## ملاحظات مهمة

1. **أسماء الملفات**: يتم إنشاء أسماء فريدة تلقائياً لتجنب التعارض
2. **حجم الملفات**: الحد الأقصى 5MB لكل صورة
3. **أنواع الملفات**: يدعم JPG, PNG, GIF, WebP
4. **الأمان**: الصور عامة للقراءة، لكن الرفع والحذف للمديرين فقط
5. **الأداء**: يتم تخزين الصور في CDN لتحسين الأداء

## استكشاف الأخطاء

### مشكلة: لا يمكن رفع الصور
- تأكد من إعداد السياسات بشكل صحيح
- تأكد من أن المستخدم لديه صلاحيات المدير
- تأكد من أن حجم الملف أقل من 5MB

### مشكلة: لا تظهر الصور
- تأكد من أن Bucket عام (public)
- تأكد من صحة URL الصورة
- تحقق من إعدادات CORS

### مشكلة: لا يمكن حذف الصور
- تأكد من إعداد سياسة الحذف
- تأكد من أن المستخدم لديه صلاحيات المدير
- تحقق من صحة مسار الملف 