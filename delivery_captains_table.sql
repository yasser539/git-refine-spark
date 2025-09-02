-- إنشاء جدول كباتن التوصيل
CREATE TABLE IF NOT EXISTS delivery_captains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  position VARCHAR(50) NOT NULL CHECK (position IN ('كابتن توصيل', 'مندوب')),
  department VARCHAR(100) DEFAULT 'التوصيل',
  status VARCHAR(20) DEFAULT 'نشط' CHECK (status IN ('نشط', 'إجازة', 'غير نشط')),
  location VARCHAR(255),
  description TEXT,
  avatar VARCHAR(10),
  profile_image VARCHAR(500),
  performance INTEGER DEFAULT 0,
  tasks INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_delivery_captains_email ON delivery_captains(email);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_status ON delivery_captains(status);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_position ON delivery_captains(position);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_location ON delivery_captains(location);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_delivery_captains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_delivery_captains_updated_at
  BEFORE UPDATE ON delivery_captains
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_captains_updated_at();

-- إدراج بيانات تجريبية
INSERT INTO delivery_captains (
  name, 
  email, 
  phone, 
  password, 
  position, 
  location, 
  description, 
  performance, 
  tasks, 
  completed
) VALUES 
  (
    'أحمد محمد علي',
    'ahmed@candywater.com',
    '+966501234567',
    '123456',
    'كابتن توصيل',
    'الرياض',
    'كابتن توصيل متمرس مع خبرة 3 سنوات في مجال التوصيل',
    95,
    12,
    10
  ),
  (
    'سارة أحمد حسن',
    'sara@candywater.com',
    '+966502345678',
    '123456',
    'كابتن توصيل',
    'جدة',
    'كابتن توصيل نشط ومتفاني في العمل',
    88,
    8,
    7
  ),
  (
    'محمد عبدالله',
    'mohammed@candywater.com',
    '+966503456789',
    '123456',
    'كابتن توصيل',
    'الدمام',
    'كابتن توصيل محترف مع سجل ممتاز',
    92,
    15,
    14
  ),
  (
    'فاطمة الزهراء',
    'fatima@candywater.com',
    '+966504567890',
    '123456',
    'مندوب',
    'الرياض',
    'مندوب توصيل في إجازة مؤقتة',
    87,
    6,
    5
  ),
  (
    'علي حسن محمد',
    'ali@candywater.com',
    '+966505678901',
    '123456',
    'كابتن توصيل',
    'جدة',
    'كابتن توصيل جديد مع أداء ممتاز',
    90,
    10,
    9
  ),
  (
    'نور الهدى',
    'noor@candywater.com',
    '+966506789012',
    '123456',
    'مندوب',
    'الدمام',
    'مندوب توصيل نشط ومتفاني',
    85,
    9,
    8
  );

-- إنشاء bucket للصور الشخصية في Storage
-- (يجب إنشاؤه يدوياً في لوحة تحكم Supabase)

-- إعداد RLS (Row Level Security)
ALTER TABLE delivery_captains ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Allow authenticated users to view delivery captains" ON delivery_captains
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to insert delivery captains" ON delivery_captains
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to update delivery captains" ON delivery_captains
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to delete delivery captains" ON delivery_captains
  FOR DELETE USING (auth.role() = 'authenticated');
