// ملف تجريبي لاختبار نظام كباتن التوصيل
// يمكن تشغيل هذا الملف في وحدة تحكم المتصفح لاختبار الخدمات

// اختبار خدمة كباتن التوصيل
const testDeliveryCaptainsService = {
  // اختبار جلب جميع كباتن التوصيل
  async testGetAllCaptains() {
    try {
      console.log('🧪 اختبار جلب جميع كباتن التوصيل...');
      const captains = await deliveryCaptainsService.getAllDeliveryCaptains();
      console.log('✅ تم جلب كباتن التوصيل:', captains);
      return captains;
    } catch (error) {
      console.error('❌ خطأ في جلب كباتن التوصيل:', error);
      throw error;
    }
  },

  // اختبار إنشاء كابتن توصيل جديد
  async testCreateCaptain() {
    try {
      console.log('🧪 اختبار إنشاء كابتن توصيل جديد...');
      const newCaptain = await deliveryCaptainsService.createDeliveryCaptain({
        name: 'أحمد محمد علي',
        email: 'ahmed.test@candywater.com',
        phone: '+966501234567',
        password: '123456',
        position: 'كابتن توصيل',
        location: 'الرياض',
        description: 'كابتن توصيل تجريبي',
        status: 'نشط'
      });
      console.log('✅ تم إنشاء كابتن التوصيل:', newCaptain);
      return newCaptain;
    } catch (error) {
      console.error('❌ خطأ في إنشاء كابتن التوصيل:', error);
      throw error;
    }
  },

  // اختبار رفع صورة شخصية
  async testUploadProfileImage() {
    try {
      console.log('🧪 اختبار رفع صورة شخصية...');
      
      // إنشاء ملف تجريبي
      const testFile = new File(['test image content'], 'test-image.jpg', {
        type: 'image/jpeg'
      });
      
      const uploadResult = await deliveryCaptainsService.uploadCaptainProfileImage(
        testFile, 
        'test-captain-profile'
      );
      
      console.log('✅ تم رفع الصورة الشخصية:', uploadResult);
      return uploadResult;
    } catch (error) {
      console.error('❌ خطأ في رفع الصورة الشخصية:', error);
      throw error;
    }
  },

  // اختبار تحديث كابتن التوصيل
  async testUpdateCaptain(captainId) {
    try {
      console.log('🧪 اختبار تحديث كابتن التوصيل...');
      const updatedCaptain = await deliveryCaptainsService.updateDeliveryCaptain(
        captainId,
        {
          performance: 95,
          status: 'نشط'
        }
      );
      console.log('✅ تم تحديث كابتن التوصيل:', updatedCaptain);
      return updatedCaptain;
    } catch (error) {
      console.error('❌ خطأ في تحديث كابتن التوصيل:', error);
      throw error;
    }
  },

  // اختبار حذف كابتن التوصيل
  async testDeleteCaptain(captainId) {
    try {
      console.log('🧪 اختبار حذف كابتن التوصيل...');
      const result = await deliveryCaptainsService.deleteDeliveryCaptain(captainId);
      console.log('✅ تم حذف كابتن التوصيل:', result);
      return result;
    } catch (error) {
      console.error('❌ خطأ في حذف كابتن التوصيل:', error);
      throw error;
    }
  },

  // تشغيل جميع الاختبارات
  async runAllTests() {
    console.log('🚀 بدء تشغيل جميع اختبارات كباتن التوصيل...');
    
    try {
      // اختبار جلب جميع كباتن التوصيل
      const captains = await this.testGetAllCaptains();
      
      // اختبار إنشاء كابتن توصيل جديد
      const newCaptain = await this.testCreateCaptain();
      
      // اختبار رفع صورة شخصية
      const uploadResult = await this.testUploadProfileImage();
      
      // اختبار تحديث كابتن التوصيل
      if (newCaptain && newCaptain.id) {
        await this.testUpdateCaptain(newCaptain.id);
      }
      
      // اختبار حذف كابتن التوصيل (اختياري)
      // await this.testDeleteCaptain(newCaptain.id);
      
      console.log('🎉 تم إكمال جميع الاختبارات بنجاح!');
      return {
        captains,
        newCaptain,
        uploadResult
      };
    } catch (error) {
      console.error('💥 فشل في تشغيل الاختبارات:', error);
      throw error;
    }
  }
};

// دالة مساعدة لاختبار النموذج
const testFormValidation = {
  // اختبار التحقق من صحة البيانات
  testFormData() {
    const testCases = [
      {
        name: 'أحمد محمد علي',
        email: 'ahmed@candywater.com',
        phone: '+966501234567',
        password: '123456',
        position: 'كابتن توصيل',
        location: 'الرياض',
        status: 'نشط',
        description: 'كابتن توصيل متمرس'
      },
      {
        name: '',
        email: 'invalid-email',
        phone: '',
        password: '',
        position: 'مندوب',
        location: '',
        status: 'إجازة',
        description: ''
      }
    ];

    console.log('🧪 اختبار التحقق من صحة البيانات...');
    
    testCases.forEach((testCase, index) => {
      const isValid = testCase.name && 
                     testCase.email && 
                     testCase.phone && 
                     testCase.password &&
                     testCase.location;
      
      console.log(`اختبار ${index + 1}:`, {
        data: testCase,
        isValid: isValid ? '✅ صحيح' : '❌ خطأ'
      });
    });
  },

  // اختبار رفع الصور
  testImageUpload() {
    const testImages = [
      { name: 'test.jpg', type: 'image/jpeg', size: 1024 * 1024 }, // 1MB
      { name: 'test.png', type: 'image/png', size: 6 * 1024 * 1024 }, // 6MB - كبير جداً
      { name: 'test.txt', type: 'text/plain', size: 1024 } // نوع غير مدعوم
    ];

    console.log('🧪 اختبار رفع الصور...');
    
    testImages.forEach((image, index) => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(image.type);
      const isValidSize = image.size <= 5 * 1024 * 1024; // 5MB
      
      console.log(`صورة ${index + 1}:`, {
        name: image.name,
        type: image.type,
        size: `${(image.size / 1024 / 1024).toFixed(2)}MB`,
        isValidType: isValidType ? '✅' : '❌',
        isValidSize: isValidSize ? '✅' : '❌',
        isValid: isValidType && isValidSize ? '✅ صحيح' : '❌ خطأ'
      });
    });
  }
};

// تصدير الدوال للاستخدام في وحدة تحكم المتصفح
if (typeof window !== 'undefined') {
  window.testDeliveryCaptainsService = testDeliveryCaptainsService;
  window.testFormValidation = testFormValidation;
  
  console.log('📋 تم تحميل أدوات اختبار كباتن التوصيل');
  console.log('💡 استخدم الأوامر التالية:');
  console.log('  - testDeliveryCaptainsService.runAllTests()');
  console.log('  - testFormValidation.testFormData()');
  console.log('  - testFormValidation.testImageUpload()');
}

// تصدير للاستخدام في Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testDeliveryCaptainsService,
    testFormValidation
  };
}
