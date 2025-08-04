// سكريبت لتحويل روابط الصور من المسارات المحلية إلى الروابط المباشرة
// تشغيل: node migrate-image-urls.js

import { createClient } from '@supabase/supabase-js';

// إعدادات Supabase - تأكد من تحديث هذه القيم
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ يرجى تعيين متغيرات البيئة NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// استخراج project-ref من URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  console.error('❌ لا يمكن استخراج project-ref من URL');
  process.exit(1);
}

console.log('🔧 بدء تحويل روابط الصور...');
console.log('📋 Project Ref:', projectRef);

// دالة للحصول على الرابط العام
function getPublicUrl(storagePath) {
  return `https://${projectRef}.supabase.co/storage/v1/object/public/img/${storagePath}`;
}

// دالة لتحويل جميع الإعلانات
async function migrateAds() {
  try {
    console.log('📤 جلب جميع الإعلانات...');
    
    const { data: ads, error } = await supabase
      .from('ads')
      .select('*');

    if (error) {
      console.error('❌ خطأ في جلب الإعلانات:', error);
      return;
    }

    console.log(`📊 تم العثور على ${ads.length} إعلان`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const ad of ads) {
      // تحقق مما إذا كان الرابط يحتاج إلى تحديث
      if (ad.image_url && !ad.image_url.startsWith('http')) {
        // تحويل المسار المحلي إلى رابط مباشر
        const publicUrl = getPublicUrl(ad.image_url);
        
        console.log(`🔄 تحديث الإعلان ${ad.id}:`);
        console.log(`   من: ${ad.image_url}`);
        console.log(`   إلى: ${publicUrl}`);

        // تحديث الإعلان في قاعدة البيانات
        const { error: updateError } = await supabase
          .from('ads')
          .update({ image_url: publicUrl })
          .eq('id', ad.id);

        if (updateError) {
          console.error(`❌ خطأ في تحديث الإعلان ${ad.id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`✅ تم تحديث الإعلان ${ad.id}`);
        }
      } else {
        skippedCount++;
        console.log(`⏭️ تخطي الإعلان ${ad.id} (رابط مباشر موجود)`);
      }
    }

    console.log('\n📈 ملخص التحويل:');
    console.log(`✅ تم تحديث: ${updatedCount} إعلان`);
    console.log(`⏭️ تم تخطي: ${skippedCount} إعلان`);
    console.log(`📊 المجموع: ${ads.length} إعلان`);

  } catch (error) {
    console.error('❌ خطأ في تحويل الإعلانات:', error);
  }
}

// دالة لتحويل جميع المنتجات (إذا كانت تحتوي على صور)
async function migrateProducts() {
  try {
    console.log('\n📤 جلب جميع المنتجات...');
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .not('image_url', 'is', null);

    if (error) {
      console.error('❌ خطأ في جلب المنتجات:', error);
      return;
    }

    console.log(`📊 تم العثور على ${products.length} منتج مع صور`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      // تحقق مما إذا كان الرابط يحتاج إلى تحديث
      if (product.image_url && !product.image_url.startsWith('http')) {
        // تحويل المسار المحلي إلى رابط مباشر
        const publicUrl = getPublicUrl(product.image_url);
        
        console.log(`🔄 تحديث المنتج ${product.id}:`);
        console.log(`   من: ${product.image_url}`);
        console.log(`   إلى: ${publicUrl}`);

        // تحديث المنتج في قاعدة البيانات
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: publicUrl })
          .eq('id', product.id);

        if (updateError) {
          console.error(`❌ خطأ في تحديث المنتج ${product.id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`✅ تم تحديث المنتج ${product.id}`);
        }
      } else {
        skippedCount++;
        console.log(`⏭️ تخطي المنتج ${product.id} (رابط مباشر موجود)`);
      }
    }

    console.log('\n📈 ملخص تحويل المنتجات:');
    console.log(`✅ تم تحديث: ${updatedCount} منتج`);
    console.log(`⏭️ تم تخطي: ${skippedCount} منتج`);
    console.log(`📊 المجموع: ${products.length} منتج`);

  } catch (error) {
    console.error('❌ خطأ في تحويل المنتجات:', error);
  }
}

// تشغيل التحويل
async function runMigration() {
  console.log('🚀 بدء عملية تحويل روابط الصور...\n');
  
  await migrateAds();
  await migrateProducts();
  
  console.log('\n🎉 تم الانتهاء من عملية التحويل!');
  console.log('💡 الآن جميع الصور تستخدم الروابط المباشرة');
}

// تشغيل السكريبت
runMigration().catch(console.error); 