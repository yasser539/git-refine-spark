-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
    image_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    total_sold INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- إضافة بيانات تجريبية للمنتجات
INSERT INTO products (name, description, price, category, image_url, status, total_sold, rating) VALUES
('مياه طبيعية', 'مياه طبيعية نقية من الينابيع الجبلية', 2.50, 'مياه طبيعية', '/icon/iconApp.png', 'active', 450, 4.8),
('مياه معدنية', 'مياه معدنية غنية بالمعادن الطبيعية', 3.20, 'مياه معدنية', '/icon/iconApp.png', 'active', 320, 4.6),
('مياه فوارة', 'مياه فوارة منعشة بنكهة الليمون', 4.00, 'مياه فوارة', '/icon/iconApp.png', 'active', 180, 4.4),
('مياه نكهة الليمون', 'مياه منكهة بنكهة الليمون الطبيعية', 3.80, 'مياه منكهة', '/icon/iconApp.png', 'active', 280, 4.7),
('مياه نكهة البرتقال', 'مياه منكهة بنكهة البرتقال الطبيعية', 3.80, 'مياه منكهة', '/icon/iconApp.png', 'active', 220, 4.5),
('مياه نكهة النعناع', 'مياه منكهة بنكهة النعناع المنعشة', 3.80, 'مياه منكهة', '/icon/iconApp.png', 'active', 150, 4.3);

-- إعداد Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان
-- السماح للجميع بقراءة المنتجات النشطة
CREATE POLICY "Allow public read access to active products" ON products
    FOR SELECT USING (status = 'active');

-- السماح للمديرين بقراءة جميع المنتجات
CREATE POLICY "Allow admin read access to all products" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- السماح للمديرين بإضافة منتجات جديدة
CREATE POLICY "Allow admin insert products" ON products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- السماح للمديرين بتحديث المنتجات
CREATE POLICY "Allow admin update products" ON products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- السماح للمديرين بحذف المنتجات
CREATE POLICY "Allow admin delete products" ON products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    ); 