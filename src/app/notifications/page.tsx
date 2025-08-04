"use client";

import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { adsService, notificationsService, slogansService } from "../../lib/supabase-services";
import { 
  Bell, 
  Megaphone, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Upload,
  Calendar,
  Users,
  Target,
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  X,
  Image as ImageIcon,
  Type
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import type { Ad, Notification, Slogan } from "../../lib/supabase";

interface NotificationStats {
  totalAds: number;
  totalNotifications: number;
  totalSlogans: number;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ads' | 'notifications' | 'slogans'>('ads');
  const [ads, setAds] = useState<Ad[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [slogans, setSlogans] = useState<Slogan[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    totalAds: 0,
    totalNotifications: 0,
    totalSlogans: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Ad | Notification | Slogan | null>(null);
  const [modalType, setModalType] = useState<'ad' | 'notification' | 'slogan'>('ad');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    slogan_text: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // دالة للحصول على رابط الصورة العامة
  const getImageUrl = (ad: Ad) => {
    // إذا كان الرابط يبدأ بـ http، فهو رابط مباشر
    if (ad.image_url.startsWith('http')) {
      return ad.image_url;
    }
    // إذا كان مسار فقط، احصل على الرابط العام
    return adsService.getPublicUrl(ad.image_url);
  };

  // جلب البيانات
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Starting to fetch notifications data...');

      // جلب البيانات من قاعدة البيانات
      const [adsData, notificationsData, slogansData] = await Promise.all([
        adsService.getAllAds(),
        notificationsService.getAllNotifications(),
        slogansService.getAllSlogans()
      ]);

      setAds(adsData);
      setNotifications(notificationsData);
      setSlogans(slogansData);

      // حساب الإحصائيات
      setStats({
        totalAds: adsData.length,
        totalNotifications: notificationsData.length,
        totalSlogans: slogansData.length
      });

      console.log('📈 Stats calculated:', {
        totalAds: adsData.length,
        totalNotifications: notificationsData.length,
        totalSlogans: slogansData.length
      });

    } catch (error: unknown) {
      console.error('❌ Error in fetchData:', error);
      setError('فشل في جلب بيانات الإعلانات والتنبيهات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      slogan_text: ''
    });
    setSelectedImage(null);
    setImagePreview('');
    setModalType('ad');
  };

  const handleCreateItem = async () => {
    try {
      setIsCreating(true);
      setError(null);

      if (modalType === 'ad') {
        let imagePath = 'ads/sample-ad-1.jpg'; // مسار افتراضي
        let storagePath = null;
        let publicUrl = null;

        // إذا تم اختيار صورة جديدة، ارفعها إلى Storage
        if (selectedImage) {
          console.log('📤 رفع الصورة إلى Storage...');
          
          // التحقق من نوع الملف
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
          if (!allowedTypes.includes(selectedImage.type)) {
            throw new Error('نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, GIF, WebP)');
          }
          
          // التحقق من حجم الملف (5MB كحد أقصى)
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (selectedImage.size > maxSize) {
            throw new Error('حجم الملف كبير جداً. الحد الأقصى 5MB');
          }
          
          // تنظيف اسم الملف - إزالة المسافات والأحرف الخاصة
          const cleanFileName = selectedImage.name
            .replace(/[^a-zA-Z0-9.-]/g, '_') // استبدال الأحرف الخاصة بـ _
            .replace(/\s+/g, '_') // استبدال المسافات بـ _
            .toLowerCase(); // تحويل إلى أحرف صغيرة
          
          const fileName = `${Date.now()}-${cleanFileName}`;
          console.log('📝 اسم الملف النظيف:', fileName);
          
          const uploadResult = await adsService.uploadAdImage(selectedImage, fileName);
          
          if (uploadResult && uploadResult.success) {
            imagePath = uploadResult.path;
            storagePath = uploadResult.path;
            publicUrl = uploadResult.publicUrl;
            console.log('✅ تم رفع الصورة بنجاح:', imagePath);
          } else {
            throw new Error('فشل في رفع الصورة');
          }
        }

        console.log('📝 إنشاء الإعلان في قاعدة البيانات...');
        // إنشاء إعلان جديد - تخزين الرابط العام المباشر
        const newAd = await adsService.createAd({
          image_url: publicUrl || imagePath, // استخدام الرابط العام المباشر
          storage_path: storagePath
        });

        if (newAd) {
          setAds(prevAds => [newAd, ...prevAds]);
          setStats(prev => ({
            ...prev,
            totalAds: prev.totalAds + 1
          }));
          console.log('✅ تم إنشاء الإعلان بنجاح:', newAd);
        } else {
          throw new Error('فشل في إنشاء الإعلان');
        }

      } else if (modalType === 'notification') {
        console.log('📝 إنشاء التنبيه...');
        // إنشاء تنبيه جديد
        const newNotification = await notificationsService.createNotification({
          message: formData.message
        });

        if (newNotification) {
          setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
          setStats(prev => ({
            ...prev,
            totalNotifications: prev.totalNotifications + 1
          }));
          console.log('✅ تم إنشاء التنبيه بنجاح:', newNotification);
        } else {
          throw new Error('فشل في إنشاء التنبيه');
        }

      } else if (modalType === 'slogan') {
        console.log('📝 إنشاء الشعار...');
        // إنشاء شعار جديد
        const newSlogan = await slogansService.createSlogan({
          title: formData.title,
          slogan_text: formData.slogan_text
        });

        if (newSlogan) {
          setSlogans(prevSlogans => [newSlogan, ...prevSlogans]);
          setStats(prev => ({
            ...prev,
            totalSlogans: prev.totalSlogans + 1
          }));
          console.log('✅ تم إنشاء الشعار بنجاح:', newSlogan);
        } else {
          throw new Error('فشل في إنشاء الشعار');
        }
      }

      setShowCreateModal(false);
      resetForm();
      
      // إظهار رسالة نجاح
      const successMsg = modalType === 'ad' ? 'تم إضافة الإعلان بنجاح!' :
                        modalType === 'notification' ? 'تم إضافة التنبيه بنجاح!' :
                        'تم إضافة الشعار بنجاح!';
      setSuccessMessage(successMsg);
      
      // إخفاء رسالة النجاح بعد 3 ثوان
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error('❌ Error creating item:', error);
      setError(`فشل في إنشاء العنصر: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (item: Ad | Notification | Slogan) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;

    try {
      if ('image_url' in item) {
        // حذف إعلان
        await adsService.deleteAd(item.id);
        
        // حذف الصورة من Storage إذا كانت موجودة
        if (item.storage_path) {
          await adsService.deleteAdImage(item.storage_path);
        }
        
        setAds(prevAds => prevAds.filter(ad => ad.id !== item.id));
        setStats(prev => ({ ...prev, totalAds: prev.totalAds - 1 }));
      } else if ('slogan_text' in item) {
        // حذف شعار
        await slogansService.deleteSlogan(item.id);
        setSlogans(prevSlogans => prevSlogans.filter(slogan => slogan.id !== item.id));
        setStats(prev => ({ ...prev, totalSlogans: prev.totalSlogans - 1 }));
      } else {
        // حذف تنبيه
        await notificationsService.deleteNotification(item.id);
        setNotifications(prevNotifications => prevNotifications.filter(notification => notification.id !== item.id));
        setStats(prev => ({ ...prev, totalNotifications: prev.totalNotifications - 1 }));
      }

    } catch (error) {
      console.error('Error deleting item:', error);
      setError('فشل في حذف العنصر');
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData} className="bg-blue-500 text-white">
            إعادة المحاولة
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الإعلانات والتنبيهات</h1>
            <p className="text-gray-600">إدارة الإعلانات والتنبيهات والشعارات</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'جاري التحديث...' : 'تحديث'}
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة جديد
            </Button>
          </div>
        </div>

        {/* رسائل النجاح والخطأ */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
              <span className="text-green-800">{successMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 ml-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">إجمالي الإعلانات</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalAds}</p>
                <p className="text-sm text-blue-600">إعلان</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Megaphone className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 mb-1">إجمالي التنبيهات</p>
                <p className="text-2xl font-bold text-orange-900">{stats.totalNotifications}</p>
                <p className="text-sm text-orange-600">تنبيه</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500">
                <Bell className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">إجمالي الشعارات</p>
                <p className="text-2xl font-bold text-purple-900">{stats.totalSlogans}</p>
                <p className="text-sm text-purple-600">شعار</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <Type className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('ads')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ads'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Megaphone className="h-4 w-4 ml-2 inline" />
              الإعلانات ({ads.length})
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="h-4 w-4 ml-2 inline" />
              التنبيهات ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('slogans')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'slogans'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Type className="h-4 w-4 ml-2 inline" />
              الشعارات ({slogans.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          {ads.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إعلانات</h3>
                <p className="text-gray-600 mb-4">ابدأ بإضافة إعلان جديد</p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-blue-500 text-white">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة إعلان جديد
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <Card key={ad.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <img 
                        src={getImageUrl(ad)} 
                        alt="إعلان"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>تاريخ الإنشاء: {new Date(ad.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center gap-2 w-full">
                      <Button
                        onClick={() => setEditingItem(ad)}
                        className="flex-1 px-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                        تعديل
                      </Button>
                      <Button
                        onClick={() => handleDelete(ad)}
                        className="px-3 py-1.5 text-xs border border-gray-300 bg-white text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تنبيهات</h3>
                <p className="text-gray-600 mb-4">ابدأ بإضافة تنبيه جديد</p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-blue-500 text-white">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة تنبيه جديد
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Bell className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{notification.message}</CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>تاريخ الإنشاء: {new Date(notification.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {notification.message.length}/30 حرف
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center gap-2 w-full">
                      <Button
                        onClick={() => setEditingItem(notification)}
                        className="flex-1 px-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                        تعديل
                      </Button>
                      <Button
                        onClick={() => handleDelete(notification)}
                        className="px-3 py-1.5 text-xs border border-gray-300 bg-white text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'slogans' && (
        <div className="space-y-6">
          {slogans.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Type className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد شعارات</h3>
                <p className="text-gray-600 mb-4">ابدأ بإضافة شعار جديد</p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-blue-500 text-white">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة شعار جديد
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {slogans.map((slogan) => (
                <Card key={slogan.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Type className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{slogan.title}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{slogan.slogan_text}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>تاريخ الإنشاء: {new Date(slogan.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {slogan.slogan_text.length}/120 حرف
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center gap-2 w-full">
                      <Button
                        onClick={() => setEditingItem(slogan)}
                        className="flex-1 px-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                        تعديل
                      </Button>
                      <Button
                        onClick={() => handleDelete(slogan)}
                        className="px-3 py-1.5 text-xs border border-gray-300 bg-white text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {modalType === 'ad' ? 'إضافة إعلان جديد' : 
                 modalType === 'notification' ? 'إضافة تنبيه جديد' : 'إضافة شعار جديد'}
              </h3>
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع المحتوى</label>
              <div className="flex gap-2">
                <Button
                  onClick={() => setModalType('ad')}
                  className={`flex-1 ${modalType === 'ad' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  <Megaphone className="h-4 w-4 ml-2" />
                  إعلان
                </Button>
                <Button
                  onClick={() => setModalType('notification')}
                  className={`flex-1 ${modalType === 'notification' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  <Bell className="h-4 w-4 ml-2" />
                  تنبيه
                </Button>
                <Button
                  onClick={() => setModalType('slogan')}
                  className={`flex-1 ${modalType === 'slogan' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  <Type className="h-4 w-4 ml-2" />
                  شعار
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Image Upload for Ads */}
              {modalType === 'ad' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">صورة الإعلان</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto max-h-48 rounded-lg"
                        />
                        <Button
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview('');
                          }}
                          className="px-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        >
                          <X className="h-4 w-4 ml-1" />
                          إزالة الصورة
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <div className="space-y-2">
                          <Button
                            onClick={() => document.getElementById('image-upload')?.click()}
                            className="bg-blue-500 text-white hover:bg-blue-600"
                          >
                            <Upload className="h-4 w-4 ml-2" />
                            اختيار صورة
                          </Button>
                          <p className="text-sm text-gray-500">PNG, JPG حتى 5MB</p>
                        </div>
                      </div>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // التحقق من نوع الملف
                          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                          if (!allowedTypes.includes(file.type)) {
                            setError('نوع الملف غير مدعوم. يرجى اختيار صورة (JPG, PNG, GIF, WebP)');
                            return;
                          }
                          
                          // التحقق من حجم الملف (5MB كحد أقصى)
                          const maxSize = 5 * 1024 * 1024; // 5MB
                          if (file.size > maxSize) {
                            setError('حجم الملف كبير جداً. الحد الأقصى 5MB');
                            return;
                          }
                          
                          setSelectedImage(file);
                          setError(null); // مسح أي أخطاء سابقة
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setImagePreview(e.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Message for Notifications */}
              {modalType === 'notification' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رسالة التنبيه <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 mr-2">(30 حرف كحد أقصى)</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 30) {
                        setFormData({...formData, message: value});
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="أدخل رسالة التنبيه (30 حرف كحد أقصى)"
                    maxLength={30}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.message.length}/30 حرف
                  </div>
                </div>
              )}

              {/* Title and Slogan Text for Slogans */}
              {modalType === 'slogan' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان الشعار <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="أدخل عنوان الشعار"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نص الشعار <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 mr-2">(120 حرف كحد أقصى)</span>
                    </label>
                    <textarea
                      value={formData.slogan_text}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 120) {
                          setFormData({...formData, slogan_text: value});
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="أدخل نص الشعار (120 حرف كحد أقصى)"
                      maxLength={120}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.slogan_text.length}/120 حرف
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 px-3 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCreateItem}
                disabled={
                  isCreating ||
                  (modalType === 'notification' && !formData.message) ||
                  (modalType === 'slogan' && (!formData.title || !formData.slogan_text))
                }
                className="flex-1 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    {modalType === 'ad' ? 'إضافة الإعلان' : 
                     modalType === 'notification' ? 'إضافة التنبيه' : 'إضافة الشعار'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
