"use client";

import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";
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

interface Ad {
  id: string;
  image_url: string;
  created_at: string;
}

interface Notification {
  id: string;
  message: string;
  created_at: string;
}

interface Slogan {
  id: string;
  title: string;
  slogan_text: string;
  created_at: string;
}

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

  // جلب البيانات
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Starting to fetch notifications data...');

      // استخدام بيانات تجريبية مؤقتة حتى يتم إنشاء الجداول
      const mockAds: Ad[] = [
        {
          id: '1',
          image_url: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
          created_at: new Date().toISOString()
        }
      ];

      const mockNotifications: Notification[] = [
        {
          id: '1',
          message: 'صيانة النظام غداً من 2-4 صباحاً',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          message: 'تحديث جديد للتطبيق متاح الآن',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          message: 'عرض خاص على الحلويات 20% خصم',
          created_at: new Date().toISOString()
        }
      ];

      const mockSlogans: Slogan[] = [
        {
          id: '1',
          title: 'شعار الشركة',
          slogan_text: 'نحمل الماء إلى بابك بكل سهولة وأمان، خدمة 24 ساعة على مدار الأسبوع',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'شعار التوصيل',
          slogan_text: 'توصيل سريع وآمن، نضمن لك وصول طلبك في الوقت المحدد وبأفضل جودة',
          created_at: new Date().toISOString()
        }
      ];

      // محاولة جلب البيانات من قاعدة البيانات
      try {
        console.log('📊 Attempting to fetch from database...');
        const { data: adsData, error: adsError } = await supabase
          .from('ads')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: slogansData, error: slogansError } = await supabase
          .from('slogans')
          .select('*')
          .order('created_at', { ascending: false });

        // إذا نجح جلب البيانات من قاعدة البيانات، استخدمها
        if (!adsError && !notificationsError && !slogansError) {
          console.log('✅ Database data fetched successfully');
          setAds(adsData || []);
          setNotifications(notificationsData || []);
          setSlogans(slogansData || []);
        } else {
          // إذا فشل، استخدم البيانات التجريبية
          console.log('⚠️  Using mock data (database tables not found)');
          setAds(mockAds);
          setNotifications(mockNotifications);
          setSlogans(mockSlogans);
        }
      } catch (dbError) {
        console.log('⚠️  Database error, using mock data:', dbError);
        setAds(mockAds);
        setNotifications(mockNotifications);
        setSlogans(mockSlogans);
      }

      // حساب الإحصائيات
      const currentAds = ads.length > 0 ? ads : mockAds;
      const currentNotifications = notifications.length > 0 ? notifications : mockNotifications;
      const currentSlogans = slogans.length > 0 ? slogans : mockSlogans;
      
      const totalAds = currentAds.length;
      const totalNotifications = currentNotifications.length;
      const totalSlogans = currentSlogans.length;

      setStats({
        totalAds,
        totalNotifications,
        totalSlogans
      });

      console.log('📈 Stats calculated:', {
        totalAds,
        totalNotifications,
        totalSlogans
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
      if (modalType === 'ad') {
        // إنشاء إعلان جديد (صورة فقط)
        const newAd: Ad = {
          id: Date.now().toString(),
          image_url: imagePreview || 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400',
          created_at: new Date().toISOString()
        };

        // محاولة الإضافة إلى قاعدة البيانات
        console.log('🔄 محاولة إضافة الإعلان إلى Supabase...');
        const { data: insertedAd, error } = await supabase
          .from('ads')
          .insert([{
            image_url: imagePreview || 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400'
          }])
          .select();

        if (error) {
          console.error('❌ خطأ في إضافة الإعلان إلى Supabase:', error);
          console.log('⚠️  سيتم الإضافة محلياً فقط');
          setAds(prevAds => [newAd, ...prevAds]);
        } else {
          console.log('✅ تم إضافة الإعلان إلى Supabase بنجاح:', insertedAd);
          if (insertedAd && insertedAd[0]) {
            setAds(prevAds => [insertedAd[0] as Ad, ...prevAds]);
          } else {
            setAds(prevAds => [newAd, ...prevAds]);
          }
        }

        // إعادة حساب الإحصائيات
        const currentAds = [newAd, ...ads];
        setStats(prev => ({
          ...prev,
          totalAds: currentAds.length
        }));

      } else if (modalType === 'notification') {
        // إنشاء تنبيه جديد (نص 30 حرف)
        const newNotification: Notification = {
          id: Date.now().toString(),
          message: formData.message,
          created_at: new Date().toISOString()
        };

        // محاولة الإضافة إلى قاعدة البيانات
        console.log('🔄 محاولة إضافة التنبيه إلى Supabase...');
        const { data: insertedNotification, error } = await supabase
          .from('notifications')
          .insert([{
            message: formData.message
          }])
          .select();

        if (error) {
          console.error('❌ خطأ في إضافة التنبيه إلى Supabase:', error);
          console.log('⚠️  سيتم الإضافة محلياً فقط');
          setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
        } else {
          console.log('✅ تم إضافة التنبيه إلى Supabase بنجاح:', insertedNotification);
          if (insertedNotification && insertedNotification[0]) {
            setNotifications(prevNotifications => [insertedNotification[0] as Notification, ...prevNotifications]);
          } else {
            setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
          }
        }

        // إعادة حساب الإحصائيات
        const currentNotifications = [newNotification, ...notifications];
        setStats(prev => ({
          ...prev,
          totalNotifications: currentNotifications.length
        }));

      } else if (modalType === 'slogan') {
        // إنشاء شعار جديد (عنوان + نص 120 حرف)
        const newSlogan: Slogan = {
          id: Date.now().toString(),
          title: formData.title,
          slogan_text: formData.slogan_text,
          created_at: new Date().toISOString()
        };

        // محاولة الإضافة إلى قاعدة البيانات
        console.log('🔄 محاولة إضافة الشعار إلى Supabase...');
        const { data: insertedSlogan, error } = await supabase
          .from('slogans')
          .insert([{
            title: formData.title,
            slogan_text: formData.slogan_text
          }])
          .select();

        if (error) {
          console.error('❌ خطأ في إضافة الشعار إلى Supabase:', error);
          console.log('⚠️  سيتم الإضافة محلياً فقط');
          setSlogans(prevSlogans => [newSlogan, ...prevSlogans]);
        } else {
          console.log('✅ تم إضافة الشعار إلى Supabase بنجاح:', insertedSlogan);
          if (insertedSlogan && insertedSlogan[0]) {
            setSlogans(prevSlogans => [insertedSlogan[0] as Slogan, ...prevSlogans]);
          } else {
            setSlogans(prevSlogans => [newSlogan, ...prevSlogans]);
          }
        }

        // إعادة حساب الإحصائيات
        const currentSlogans = [newSlogan, ...slogans];
        setStats(prev => ({
          ...prev,
          totalSlogans: currentSlogans.length
        }));
      }

      setShowCreateModal(false);
      resetForm();

    } catch (error) {
      console.error('Error creating item:', error);
      setError('فشل في إنشاء العنصر');
    }
  };

  const handleDelete = async (item: Ad | Notification | Slogan) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;

    try {
      let table: string;
      if ('image_url' in item) {
        table = 'ads';
      } else if ('slogan_text' in item) {
        table = 'slogans';
      } else {
        table = 'notifications';
      }
      
      console.log(`🔄 محاولة حذف ${table === 'ads' ? 'الإعلان' : table === 'notifications' ? 'التنبيه' : 'الشعار'} من Supabase...`);
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', item.id);

      if (error) {
        console.error(`❌ خطأ في حذف ${table} من Supabase:`, error);
        console.log('⚠️  سيتم الحذف محلياً فقط');
      } else {
        console.log(`✅ تم حذف ${table} من Supabase بنجاح`);
      }

      // تحديث البيانات المحلية
      if (table === 'ads') {
        setAds(prevAds => prevAds.filter(ad => ad.id !== item.id));
        setStats(prev => ({ ...prev, totalAds: prev.totalAds - 1 }));
      } else if (table === 'notifications') {
        setNotifications(prevNotifications => prevNotifications.filter(notification => notification.id !== item.id));
        setStats(prev => ({ ...prev, totalNotifications: prev.totalNotifications - 1 }));
      } else {
        setSlogans(prevSlogans => prevSlogans.filter(slogan => slogan.id !== item.id));
        setStats(prev => ({ ...prev, totalSlogans: prev.totalSlogans - 1 }));
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
                        src={ad.image_url} 
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
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedImage(file);
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
                  (modalType === 'ad' && !imagePreview) ||
                  (modalType === 'notification' && !formData.message) ||
                  (modalType === 'slogan' && (!formData.title || !formData.slogan_text))
                }
                className="flex-1 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {modalType === 'ad' ? 'إضافة الإعلان' : 
                 modalType === 'notification' ? 'إضافة التنبيه' : 'إضافة الشعار'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
