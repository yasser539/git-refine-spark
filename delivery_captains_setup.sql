-- =====================================================
-- إنشاء جدول كباتن التوصيل والمناديب الشامل
-- =====================================================

CREATE TABLE IF NOT EXISTS delivery_captains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- المعلومات الشخصية الأساسية
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,

  -- المعلومات الوظيفية
  position VARCHAR(50) NOT NULL CHECK (position IN ('كابتن توصيل', 'مندوب')),
  department VARCHAR(100) DEFAULT 'التوصيل',
  status VARCHAR(20) DEFAULT 'نشط' CHECK (status IN ('نشط', 'إجازة', 'غير نشط')),

  -- معلومات الموقع والمنطقة
  location VARCHAR(255),
  city VARCHAR(100),
  region VARCHAR(100),

  -- معلومات إضافية
  description TEXT,
  avatar VARCHAR(10),
  profile_image VARCHAR(500),

  -- معلومات الأداء والإحصائيات
  performance INTEGER DEFAULT 0,
  tasks INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_deliveries INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,

  -- معلومات المركبة (للكباتن)
  vehicle_type VARCHAR(50),
  vehicle_model VARCHAR(100),
  vehicle_plate VARCHAR(20),
  vehicle_color VARCHAR(50),

  -- معلومات الاتصال الإضافية
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(20),

  -- معلومات التوثيق
  id_number VARCHAR(50),
  license_number VARCHAR(50),
  insurance_number VARCHAR(50),

  -- معلومات العمل
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contract_start_date DATE,
  contract_end_date DATE,
  salary DECIMAL(10,2),
  commission_rate DECIMAL(5,2) DEFAULT 0.00,

  -- معلومات التقنية
  device_id VARCHAR(100),
  app_version VARCHAR(20),
  last_active TIMESTAMP WITH TIME ZONE,

  -- معلومات الأمان
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  background_check_status VARCHAR(50) DEFAULT 'pending',

  -- معلومات إدارية
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,

  -- ملاحظات إدارية
  notes TEXT,
  admin_notes TEXT
);

-- =====================================================
-- إنشاء الفهارس لتحسين الأداء
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_delivery_captains_email ON delivery_captains(email);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_phone ON delivery_captains(phone);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_status ON delivery_captains(status);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_position ON delivery_captains(position);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_location ON delivery_captains(location);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_city ON delivery_captains(city);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_performance ON delivery_captains(performance);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_rating ON delivery_captains(rating);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_join_date ON delivery_captains(join_date);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_vehicle_plate ON delivery_captains(vehicle_plate);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_vehicle_type ON delivery_captains(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_id_number ON delivery_captains(id_number);
CREATE INDEX IF NOT EXISTS idx_delivery_captains_license_number ON delivery_captains(license_number);

-- =====================================================
-- تحديث عمود updated_at تلقائياً
-- =====================================================

CREATE OR REPLACE FUNCTION update_delivery_captains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_delivery_captains_updated_at
  BEFORE UPDATE ON delivery_captains
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_captains_updated_at();

-- =====================================================
-- بيانات تجريبية للكباتن والمناديب
-- =====================================================

INSERT INTO delivery_captains (
  name, email, phone, password, position, location, city, region, description,
  performance, tasks, completed, rating, total_deliveries, total_earnings,
  vehicle_type, vehicle_model, vehicle_plate, vehicle_color, emergency_contact,
  emergency_phone, id_number, license_number, insurance_number, contract_start_date,
  salary, commission_rate, device_id, app_version, is_verified, background_check_status
) VALUES 
  ('أحمد محمد علي','ahmed@candywater.com','+966501234567','123456','كابتن توصيل','حي النزهة','الرياض','المنطقة الوسطى','كابتن توصيل متمرس مع خبرة 3 سنوات في مجال التوصيل. متخصص في التوصيل السريع والآمن.',95,12,10,4.8,150,2500.00,'سيارة','تويوتا كامري 2022','أ ب ج 1234','أبيض','فاطمة علي','+966501234568','1234567890','DL-2023-001','INS-2023-001','2023-01-15',3000.00,15.00,'DEVICE-001','1.2.0',TRUE,'approved'),
  ('سارة أحمد حسن','sara@candywater.com','+966502345678','123456','كابتن توصيل','حي الشاطئ','جدة','المنطقة الغربية','كابتن توصيل نشط ومتفاني في العمل. متخصصة في التوصيل للمناطق السكنية.',88,8,7,4.5,120,2100.00,'سيارة','هيونداي إلنترا 2021','أ ب ج 5678','أزرق','محمد حسن','+966502345679','1234567891','DL-2023-002','INS-2023-002','2023-03-20',2800.00,12.00,'DEVICE-002','1.2.0',TRUE,'approved'),
  ('محمد عبدالله','mohammed@candywater.com','+966503456789','123456','كابتن توصيل','حي الشاطئ','الدمام','المنطقة الشرقية','كابتن توصيل محترف مع سجل ممتاز. متخصص في التوصيل للمؤسسات والشركات.',92,15,14,4.9,180,2800.00,'سيارة','نيسان ألتيما 2023','أ ب ج 9012','أسود','عبدالله محمد','+966503456790','1234567892','DL-2023-003','INS-2023-003','2023-02-10',3200.00,18.00,'DEVICE-003','1.2.0',TRUE,'approved'),
  ('فاطمة الزهراء','fatima@candywater.com','+966504567890','123456','مندوب','حي الملك فهد','الرياض','المنطقة الوسطى','مندوب توصيل في إجازة مؤقتة. متخصصة في التوصيل للمنازل.',87,6,5,4.3,80,1500.00,'دراجة نارية','هوندا CG 150','أ ب ج 3456','أحمر','علي الزهراء','+966504567891','1234567893','DL-2023-004','INS-2023-004','2023-01-05',2000.00,10.00,'DEVICE-004','1.2.0',TRUE,'approved'),
  ('علي حسن محمد','ali@candywater.com','+966505678901','123456','كابتن توصيل','حي الكورنيش','جدة','المنطقة الغربية','كابتن توصيل جديد مع أداء ممتاز. متخصص في التوصيل السريع.',90,10,9,4.6,95,1800.00,'سيارة','كيا سيراتو 2022','أ ب ج 7890','رمادي','حسن محمد','+966505678902','1234567894','DL-2023-005','INS-2023-005','2023-04-12',2500.00,14.00,'DEVICE-005','1.2.0',TRUE,'approved'),
  ('نور الهدى','noor@candywater.com','+966506789012','123456','مندوب','حي الشاطئ','الدمام','المنطقة الشرقية','مندوب توصيل نشط ومتفاني. متخصصة في التوصيل للمناطق التجارية.',85,9,8,4.4,70,1300.00,'دراجة نارية','ياماها YBR 125','أ ب ج 1234','أخضر','الهدى نور','+966506789013','1234567895','DL-2023-006','INS-2023-006','2023-05-18',1800.00,8.00,'DEVICE-006','1.2.0',TRUE,'approved'),
  ('خالد عبدالرحمن','khalid@candywater.com','+966507890123','123456','كابتن توصيل','حي النزهة','الرياض','المنطقة الوسطى','كابتن توصيل محترف مع خبرة 5 سنوات. متخصص في التوصيل للمطاعم.',94,18,17,4.7,200,3000.00,'سيارة','تويوتا كورولا 2023','أ ب ج 5678','أبيض','عبدالرحمن خالد','+966507890124','1234567896','DL-2023-007','INS-2023-007','2023-06-01',3500.00,20.00,'DEVICE-007','1.2.0',TRUE,'approved'),
  ('ريم أحمد','reem@candywater.com','+966508901234','123456','مندوب','حي الملك فهد','جدة','المنطقة الغربية','مندوب توصيل نشط ومتفاني. متخصصة في التوصيل للمنازل والمكاتب.',89,11,10,4.5,85,1600.00,'دراجة نارية','سوزوكي GN 125','أ ب ج 9012','أزرق','أحمد ريم','+966508901235','1234567897','DL-2023-008','INS-2023-008','2023-07-15',2200.00,12.00,'DEVICE-008','1.2.0',TRUE,'approved');

-- =====================================================
-- جدول سجل العمل
-- =====================================================

CREATE TABLE IF NOT EXISTS delivery_work_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  captain_id UUID REFERENCES delivery_captains(id) ON DELETE CASCADE,
  order_id VARCHAR(100),
  customer_name VARCHAR(255),
  delivery_address TEXT,
  delivery_phone VARCHAR(20),
  pickup_time TIMESTAMP WITH TIME ZONE,
  delivery_time TIMESTAMP WITH TIME ZONE,
  total_distance DECIMAL(8,2),
  delivery_fee DECIMAL(8,2),
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_logs_captain_id ON delivery_work_logs(captain_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_status ON delivery_work_logs(status);
CREATE INDEX IF NOT EXISTS idx_work_logs_created_at ON delivery_work_logs(created_at);

-- =====================================================
-- جدول الأداء الشهري
-- =====================================================

CREATE TABLE IF NOT EXISTS delivery_performance_monthly (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  captain_id UUID REFERENCES delivery_captains(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  total_deliveries INTEGER DEFAULT 0,
  completed_deliveries INTEGER DEFAULT 0,
  cancelled_deliveries INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_distance DECIMAL(10,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(captain_id, year, month)
);

CREATE INDEX IF NOT EXISTS idx_performance_captain_id ON delivery_performance_monthly(captain_id);
CREATE INDEX IF NOT EXISTS idx_performance_year_month ON delivery_performance_monthly(year, month);

-- =====================================================
-- تفعيل RLS (Row Level Security)
-- =====================================================

ALTER TABLE delivery_captains ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_performance_monthly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view delivery captains" ON delivery_captains
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to insert delivery captains" ON delivery_captains
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to update delivery captains" ON delivery_captains
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to delete delivery captains" ON delivery_captains
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view work logs" ON delivery_work_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert work logs" ON delivery_work_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update work logs" ON delivery_work_logs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to view performance" ON delivery_performance_monthly
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert performance" ON delivery_performance_monthly
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update performance" ON delivery_performance_monthly
  FOR UPDATE USING (auth.role() = 'authenticated');

-- =====================================================
-- دوال الأداء والتريجرات
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_captain_performance(captain_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE delivery_captains 
  SET 
    performance = (
      SELECT COALESCE(AVG(customer_rating) * 20, 0)
      FROM delivery_work_logs 
      WHERE captain_id = captain_uuid 
      AND status = 'delivered'
      AND delivery_time >= NOW() - INTERVAL '30 days'
    ),
    total_deliveries = (
      SELECT COUNT(*)
      FROM delivery_work_logs 
      WHERE captain_id = captain_uuid
    ),
    completed = (
      SELECT COUNT(*)
      FROM delivery_work_logs 
      WHERE captain_id = captain_uuid 
      AND status = 'delivered'
    ),
    rating = (
      SELECT COALESCE(AVG(customer_rating), 0)
      FROM delivery_work_logs 
      WHERE captain_id = captain_uuid 
      AND status = 'delivered'
    ),
    total_earnings = (
      SELECT COALESCE(SUM(delivery_fee), 0)
      FROM delivery_work_logs 
      WHERE captain_id = captain_uuid 
      AND status = 'delivered'
    )
  WHERE id = captain_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_captain_performance_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_captain_performance(NEW.captain_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_captain_performance
  AFTER INSERT OR UPDATE ON delivery_work_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_captain_performance_trigger();

-- =====================================================
-- دالة إدخال سجلات عمل تجريبية
-- =====================================================

CREATE OR REPLACE FUNCTION add_sample_work_logs()
RETURNS VOID AS $$
DECLARE
  captain_record RECORD;
BEGIN
  FOR captain_record IN SELECT id FROM delivery_captains LOOP
    INSERT INTO delivery_work_logs (
      captain_id,
      order_id,
      customer_name,
      delivery_address,
      delivery_phone,
      pickup_time,
      delivery_time,
      total_distance,
      delivery_fee,
      customer_rating,
      customer_feedback,
      status
    ) VALUES 
    (
      captain_record.id,
      'ORD-' || EXTRACT(EPOCH FROM NOW())::TEXT || '-1',
      'أحمد محمد',
      'حي النزهة، الرياض',
      '+966501234567',
      NOW() - INTERVAL '2 hours',
      NOW() - INTERVAL '1 hour',
      5.5,
      25.00,
      5,
      'توصيل سريع وممتاز',
      'delivered'
    ),
    (
      captain_record.id,
      'ORD-' || EXTRACT(EPOCH FROM NOW())::TEXT || '-2',
      'سارة أحمد',
      'حي الشاطئ، جدة',
      '+966502345678',
      NOW() - INTERVAL '4 hours',
      NOW() - INTERVAL '3 hours',
      3.2,
      20.00,
      4,
      'توصيل جيد',
      'delivered'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT add_sample_work_logs();

-- =====================================================
-- ملاحظات عامة
-- =====================================================
-- ملاحظات:
-- 1. أنشئ bucket باسم 'captain-profiles' في Supabase Storage.
-- 2. حدّد الإعدادات (public, max file size, images only).
-- 3. في الإنتاج: استخدم تشفير لكلمة المرور، والتحقق من البريد، وصلاحيات أكثر.
-- 4. نفذ هذا الكود من Supabase SQL Editor دفعة واحدة.
