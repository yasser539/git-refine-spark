"use client";

import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { adsService, notificationsService } from "../../lib/supabase-services";
import { supabase } from "../../lib/supabase";
import { 
  Bell, 
  Megaphone, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Image as ImageIcon,
  X,
  Loader2
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  target_user_id?: string;
  target_role?: 'admin' | 'employee' | 'all';
  is_read: boolean;
  created_at: string;
}

interface Ad {
  id: string;
  image_url: string;
  storage_bucket: string;
  storage_path?: string;
  created_at: string;
}

export default function NotificationsPage() {
  const { permissions } = useAuth();
  const [activeTab, setActiveTab] = useState<'ads' | 'notifications'>('ads');
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    message: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalAds: 0,
    totalNotifications: 0
  });

  // جلب البيانات
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Starting to fetch notifications data...');

      const [adsData, notificationsData] = await Promise.all([
        adsService.getAllAds(),
        notificationsService.getAllNotifications()
      ]);

      setAds(adsData);
      setNotifications(notificationsData);

      setStats({
        totalAds: adsData.length,
        totalNotifications: notificationsData.length
      });

      console.log('✅ Data fetched successfully:', { ads: adsData.length, notifications: notificationsData.length });
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError('فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // إضافة عنصر جديد
  const handleAddNotification = async () => {
    try {
      if (activeTab === 'notifications') {
        const newNotification = await notificationsService.createNotification({
          title: newItem.message // Use message as the title if only message is provided
        });
        if (newNotification) {
          setNotifications([newNotification, ...notifications]);
          setSuccessMessage('تم إضافة التنبيه بنجاح');
        }
      } else if (activeTab === 'ads') {
        // التحقق من وجود صورة
        if (!selectedFile) {
          setError('يرجى اختيار صورة للإعلان');
          return;
        }

        // رفع الصورة إلى Storage
        const uploadResult = await uploadImageToStorage(selectedFile);
        if (!uploadResult) {
          setError('فشل في رفع الصورة');
          return;
        }

        // إنشاء إعلان جديد
        const newAd = await adsService.createAd({
          image_url: uploadResult.url,
          storage_bucket: 'img',
          storage_path: uploadResult.path
        });
        
        if (newAd) {
          // التأكد من أن العنصر الجديد له id فريد
          const adWithUniqueId = {
            ...newAd,
            id: newAd.id || `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          };
          setAds([adWithUniqueId, ...ads]);
          setStats(prev => ({ ...prev, totalAds: prev.totalAds + 1 }));
          setSuccessMessage('تم إضافة الإعلان بنجاح');
        }
      }
      
      setShowAddModal(false);
  setNewItem({ message: "" });
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error adding item:', error);
      setError(`فشل في إضافة ${activeTab === 'notifications' ? 'التنبيه' : 'الإعلان'}`);
    }
  };

  // حذف عنصر
  const handleDelete = async (item: any) => {
    try {
      if (activeTab === 'notifications') {
        await notificationsService.deleteNotification(item.id);
        setNotifications(notifications.filter(n => n.id !== item.id));
        setStats(prev => ({ ...prev, totalNotifications: prev.totalNotifications - 1 }));
      } else if (activeTab === 'ads') {
        await adsService.deleteAd(item.id);
        setAds(ads.filter(a => a.id !== item.id));
        setStats(prev => ({ ...prev, totalAds: prev.totalAds - 1 }));
      }
      
      setSuccessMessage('تم الحذف بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('فشل في الحذف');
    }
  };

  // تحديث البيانات
  const handleRefresh = () => {
    fetchData();
    setSuccessMessage('تم تحديث البيانات');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // معاينة الصورة المحددة
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  // لا يوجد حقل title بعد الآن
    
    // إنشاء URL للمعاينة
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // رفع الصورة إلى Supabase Storage
  const uploadImageToStorage = async (file: File): Promise<{ url: string; path: string } | null> => {
    try {
      // تنظيف اسم الملف للتأكد من أنه صالح لـ Supabase Storage
      const cleanFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_') // استبدال الأحرف غير الصالحة بـ _
        .replace(/\s+/g, '_') // استبدال المسافات بـ _
        .replace(/_{2,}/g, '_') // إزالة _ المتكررة
        .toLowerCase(); // تحويل إلى أحرف صغيرة
      
      const fileName = `${Date.now()}-${cleanFileName}`;
      const filePath = `ads/${fileName}`;
      
      console.log('📤 رفع الملف:', { originalName: file.name, cleanName: cleanFileName, path: filePath });
      
      // رفع الملف إلى Supabase Storage - استخدام bucket 'img' الموجود
      const { data, error } = await supabase.storage
        .from('img')
        .upload(filePath, file);
      
      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
      
      // الحصول على الرابط العام
      const { data: urlData } = supabase.storage
        .from('img')
        .getPublicUrl(filePath);
      
      return {
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('Error in uploadImageToStorage:', error);
      return null;
    }
  };

  // تنظيف المعاينة عند إغلاق Modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  setNewItem({ message: "" });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>جاري التحميل...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">إدارة الإعلانات والتنبيهات</h1>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 space-x-reverse"
            >
              <RefreshCw className="h-4 w-4" />
              <span>تحديث</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة جديد</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي التنبيهات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNotifications}</p>
                <p className="text-sm text-gray-500">تنبيه</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الإعلانات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAds}</p>
                <p className="text-sm text-gray-500">إعلان</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Megaphone className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 space-x-reverse px-6">
              <button
                onClick={() => setActiveTab('ads')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 space-x-reverse ${
                  activeTab === 'ads'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Megaphone className="h-4 w-4" />
                <span>الإعلانات ({ads.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 space-x-reverse ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>التنبيهات ({notifications.length})</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Ads Tab */}
            {activeTab === 'ads' && (
              <div>
                {ads.length === 0 ? (
                  <div className="text-center py-12">
                    <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إعلانات</h3>
                    <p className="text-gray-500">ابدأ بإضافة إعلان جديد</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ads.map((ad, index) => (
                      <div key={ad.id || `ad-${index}-${Date.now()}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                          {ad.image_url ? (
                            <img
                              src={ad.image_url}
                              alt="صورة الإعلان"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // إذا فشل تحميل الصورة، اعرض الأيقونة
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <ImageIcon className={`h-8 w-8 text-gray-400 ${ad.image_url ? 'hidden' : ''}`} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {new Date(ad.created_at).toLocaleDateString('ar-SA')}
                          </span>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button
                              onClick={() => handleDelete(ad)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(ad);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تنبيهات</h3>
                    <p className="text-gray-500">ابدأ بإضافة تنبيه جديد</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification, index) => (
                      <div key={notification.id || `notification-${index}-${Date.now()}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 space-x-reverse mb-2">
                              <h3 className="font-medium text-gray-900">{notification.title}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                notification.type === 'success' ? 'bg-green-100 text-green-800' :
                                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                notification.type === 'error' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {notification.type}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                            <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500">
                              <span>المستهدف: {notification.target_role}</span>
                              <span>تاريخ الإنشاء: {new Date(notification.created_at).toLocaleDateString('ar-SA')}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <button
                              onClick={() => handleDelete(notification)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(notification);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">إضافة {activeTab === 'notifications' ? 'تنبيه' : 'إعلان'} جديد</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة</label>
                    <textarea
                      value={newItem.message}
                      onChange={(e) => setNewItem({ ...newItem, message: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="أدخل رسالة التنبيه"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'ads' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اختر صورة</label>
                    {!selectedFile ? (
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>رفع صورة</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileSelect(file);
                                  }
                                }}
                              />
                            </label>
                            <p className="pl-1">أو اسحب وأفلت</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF حتى 10MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1">
                        <div className="relative">
                          <img
                            src={previewUrl || ''}
                            alt="معاينة الصورة"
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl(null);
                              setNewItem({ message: "" });
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">تم اختيار: {selectedFile.name}</p>
                      </div>
                    )}
                  </div>

                </div>
              )}
              
              <div className="flex items-center justify-end space-x-3 space-x-reverse mt-6">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddNotification}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {error}
          </div>
        )}
      </div>
    </Layout>
  );
}
