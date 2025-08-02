"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function TestDBPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    const newResults: any = {};

    try {
      // Test 1: Basic connection
      console.log('🧪 Test 1: Testing basic connection...');
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      newResults.connection = {
        success: !testError,
        error: testError?.message || null,
        data: testData
      };

      // Test 2: Check if ads table exists
      console.log('🧪 Test 2: Checking ads table...');
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('*')
        .limit(1);

      newResults.adsTable = {
        exists: !adsError,
        error: adsError?.message || null,
        count: adsData?.length || 0
      };

      // Test 3: Check if alerts table exists
      console.log('🧪 Test 3: Checking alerts table...');
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .limit(1);

      newResults.alertsTable = {
        exists: !alertsError,
        error: alertsError?.message || null,
        count: alertsData?.length || 0
      };

      // Test 4: Check environment variables
      newResults.environment = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
      };

      setResults(newResults);

    } catch (error) {
      console.error('❌ Test failed:', error);
      newResults.error = error instanceof Error ? error.message : 'Unknown error';
      setResults(newResults);
    } finally {
      setLoading(false);
    }
  };

  const createTables = async () => {
    setLoading(true);
    try {
      console.log('🔧 Creating tables...');
      
      // Create ads table
      const { error: adsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS ads (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            image_url VARCHAR(255),
            link_url VARCHAR(255),
            status VARCHAR(20) DEFAULT 'active',
            priority INTEGER DEFAULT 1,
            target_audience VARCHAR(50) DEFAULT 'all',
            views_count INTEGER DEFAULT 0,
            clicks_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      // Create alerts table
      const { error: alertsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS alerts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(20) DEFAULT 'info',
            priority VARCHAR(20) DEFAULT 'medium',
            status VARCHAR(20) DEFAULT 'active',
            target_audience VARCHAR(50) DEFAULT 'all',
            views_count INTEGER DEFAULT 0,
            dismissals_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      // Insert sample data
      const { error: insertError } = await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO ads (title, description, status, target_audience) VALUES
          ('عرض خاص على الحلويات', 'احصل على خصم 20% على جميع الحلويات', 'active', 'all'),
          ('توصيل مجاني', 'توصيل مجاني للطلبات التي تزيد عن 50 ريال', 'active', 'customers')
          ON CONFLICT DO NOTHING;
        `
      });

      const { error: insertAlertsError } = await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO alerts (title, message, type, priority, status, target_audience) VALUES
          ('صيانة النظام', 'سيتم إجراء صيانة للنظام يوم الأحد من 2-4 صباحاً', 'warning', 'medium', 'active', 'all'),
          ('تحديث جديد', 'تم إطلاق تحديث جديد للتطبيق مع ميزات محسنة', 'info', 'low', 'active', 'all')
          ON CONFLICT DO NOTHING;
        `
      });

      setResults({
        ...results,
        tablesCreated: {
          ads: !adsError,
          alerts: !alertsError,
          sampleData: !insertError && !insertAlertsError
        }
      });

    } catch (error) {
      console.error('❌ Failed to create tables:', error);
      setResults({
        ...results,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">اختبار قاعدة البيانات</h1>
      
      <div className="space-y-4 mb-6">
        <Button onClick={testConnection} disabled={loading}>
          {loading ? 'جاري الاختبار...' : 'اختبار الاتصال'}
        </Button>
        
        <Button onClick={createTables} disabled={loading} className="ml-4">
          {loading ? 'جاري الإنشاء...' : 'إنشاء الجداول'}
        </Button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          {results.environment && (
            <Card>
              <CardHeader>
                <CardTitle>متغيرات البيئة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>Supabase URL: <span className={results.environment.supabaseUrl === 'Set' ? 'text-green-600' : 'text-red-600'}>{results.environment.supabaseUrl}</span></div>
                  <div>Supabase Key: <span className={results.environment.supabaseKey === 'Set' ? 'text-green-600' : 'text-red-600'}>{results.environment.supabaseKey}</span></div>
                </div>
              </CardContent>
            </Card>
          )}

          {results.connection && (
            <Card>
              <CardHeader>
                <CardTitle>اختبار الاتصال</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>الحالة: <span className={results.connection.success ? 'text-green-600' : 'text-red-600'}>{results.connection.success ? 'نجح' : 'فشل'}</span></div>
                  {results.connection.error && <div>الخطأ: {results.connection.error}</div>}
                </div>
              </CardContent>
            </Card>
          )}

          {results.adsTable && (
            <Card>
              <CardHeader>
                <CardTitle>جدول الإعلانات (ads)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>موجود: <span className={results.adsTable.exists ? 'text-green-600' : 'text-red-600'}>{results.adsTable.exists ? 'نعم' : 'لا'}</span></div>
                  <div>عدد السجلات: {results.adsTable.count}</div>
                  {results.adsTable.error && <div>الخطأ: {results.adsTable.error}</div>}
                </div>
              </CardContent>
            </Card>
          )}

          {results.alertsTable && (
            <Card>
              <CardHeader>
                <CardTitle>جدول التنبيهات (alerts)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>موجود: <span className={results.alertsTable.exists ? 'text-green-600' : 'text-red-600'}>{results.alertsTable.exists ? 'نعم' : 'لا'}</span></div>
                  <div>عدد السجلات: {results.alertsTable.count}</div>
                  {results.alertsTable.error && <div>الخطأ: {results.alertsTable.error}</div>}
                </div>
              </CardContent>
            </Card>
          )}

          {results.tablesCreated && (
            <Card>
              <CardHeader>
                <CardTitle>إنشاء الجداول</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>جدول الإعلانات: <span className={results.tablesCreated.ads ? 'text-green-600' : 'text-red-600'}>{results.tablesCreated.ads ? 'تم إنشاؤه' : 'فشل'}</span></div>
                  <div>جدول التنبيهات: <span className={results.tablesCreated.alerts ? 'text-green-600' : 'text-red-600'}>{results.tablesCreated.alerts ? 'تم إنشاؤه' : 'فشل'}</span></div>
                  <div>البيانات التجريبية: <span className={results.tablesCreated.sampleData ? 'text-green-600' : 'text-red-600'}>{results.tablesCreated.sampleData ? 'تم إدراجها' : 'فشل'}</span></div>
                </div>
              </CardContent>
            </Card>
          )}

          {results.error && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-600">خطأ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-red-600">{results.error}</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold mb-2">تعليمات:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>اضغط "اختبار الاتصال" لفحص الاتصال بقاعدة البيانات</li>
          <li>إذا كانت الجداول غير موجودة، اضغط "إنشاء الجداول"</li>
          <li>بعد إنشاء الجداول، اذهب إلى صفحة الإعلانات</li>
        </ol>
      </div>
    </div>
  );
} 