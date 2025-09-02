"use client";

import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { deliveryCaptainsService } from "../../lib/supabase-services";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Activity,
  Shield,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  User,
  Truck,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

interface DeliveryCaptain {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  position: "كابتن توصيل" | "مندوب";
  department: string;
  status: "نشط" | "إجازة" | "غير نشط";
  join_date: string;
  avatar: string;
  location: string;
  performance: number;
  tasks: number;
  completed: number;
  description?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export default function DeliveryCaptainsPage() {
  const { permissions } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [captains, setCaptains] = useState<DeliveryCaptain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    position: 'كابتن توصيل' as "كابتن توصيل" | "مندوب",
    location: '',
    description: '',
    status: 'نشط' as "نشط" | "إجازة" | "غير نشط"
  });

  // جلب بيانات كباتن التوصيل
  const fetchCaptains = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const captainsData = await deliveryCaptainsService.getAllDeliveryCaptains();
      setCaptains(captainsData);
    } catch (error) {
      console.error('خطأ في جلب بيانات كباتن التوصيل:', error);
      setError('فشل في جلب بيانات كباتن التوصيل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptains();
  }, []);

  const stats = [
    { 
      title: "إجمالي كباتن التوصيل", 
      value: captains.length, 
      change: "+3", 
      icon: Users, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      title: "كباتن التوصيل النشطين", 
      value: captains.filter(e => e.status === "نشط").length, 
      change: "+2", 
      icon: UserCheck, 
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    { 
      title: "في إجازة", 
      value: captains.filter(e => e.status === "إجازة").length, 
      change: "0", 
      icon: UserX, 
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50"
    },
    { 
      title: "متوسط الأداء", 
      value: captains.length > 0 ? Math.round(captains.reduce((acc, emp) => acc + emp.performance, 0) / captains.length) + "%" : "0%", 
      change: "+5%", 
      icon: TrendingUp, 
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
  ];

  const filteredCaptains = captains.filter(captain =>
    captain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    captain.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    captain.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      let profileImageUrl = null;

      // رفع الصورة الشخصية إذا تم اختيارها
      if (selectedImage) {
        console.log('📤 رفع الصورة الشخصية...');
        
        const cleanFileName = selectedImage.name
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/\s+/g, '_')
          .toLowerCase();
        
        const fileName = `${Date.now()}-${cleanFileName}`;
        
        const uploadResult = await deliveryCaptainsService.uploadCaptainProfileImage(selectedImage, fileName);
        
        if (uploadResult && uploadResult.success) {
          profileImageUrl = uploadResult.publicUrl;
          console.log('✅ تم رفع الصورة الشخصية بنجاح:', profileImageUrl);
        } else {
          throw new Error('فشل في رفع الصورة الشخصية');
        }
      }

      // إنشاء كابتن التوصيل الجديد
      console.log('📝 إنشاء كابتن التوصيل في قاعدة البيانات...');
      const newCaptain = await deliveryCaptainsService.createDeliveryCaptain({
        ...formData,
        profile_image: profileImageUrl || undefined
      });

      if (newCaptain) {
        setCaptains(prevCaptains => [newCaptain, ...prevCaptains]);
        console.log('✅ تم إنشاء كابتن التوصيل بنجاح:', newCaptain);
        
        // إعادة تعيين النموذج
        resetForm();
        setShowAddModal(false);
        
        // إظهار رسالة نجاح
        setSuccessMessage('تم إضافة كابتن التوصيل بنجاح!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error('فشل في إنشاء كابتن التوصيل');
      }

    } catch (error) {
      console.error('خطأ في إضافة كابتن التوصيل:', error);
      setError(`فشل في إضافة كابتن التوصيل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      position: 'كابتن توصيل',
      location: '',
      description: '',
      status: 'نشط'
    });
    setSelectedImage(null);
    setImagePreview('');
    setError(null);
  };

  const handleDelete = async (captainId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا كابتن التوصيل؟')) return;

    try {
      await deliveryCaptainsService.deleteDeliveryCaptain(captainId);
      setCaptains(prevCaptains => prevCaptains.filter(captain => captain.id !== captainId));
      setSuccessMessage('تم حذف كابتن التوصيل بنجاح!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('خطأ في حذف كابتن التوصيل:', error);
      setError('فشل في حذف كابتن التوصيل');
    }
  };

  if (error && !loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchCaptains} className="bg-blue-500 text-white">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة كباتن التوصيل</h1>
            <p className="text-gray-600">إدارة كباتن التوصيل وفريق العمل</p>
          </div>
          {permissions.can_modify_employees ? (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <UserPlus size={20} />
              إضافة كابتن توصيل جديد
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg text-gray-500">
              <Shield className="h-5 w-5" />
              <span className="text-sm">لا تملك صلاحية إضافة كباتن التوصيل</span>
            </div>
          )}
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
              <AlertCircle className="h-5 w-5 text-red-600 ml-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${stat.bgColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-green-600">
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 mr-1">من الشهر الماضي</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              عرض شبكي
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              عرض قائمة
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Filter size={16} />
            تصفية
          </button>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="البحث في كباتن التوصيل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">جاري تحميل بيانات كباتن التوصيل...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCaptains.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد كباتن توصيل</h3>
            <p className="text-gray-600 mb-4">ابدأ بإضافة كابتن توصيل جديد</p>
            {permissions.can_modify_employees && (
              <Button onClick={() => setShowAddModal(true)} className="bg-blue-500 text-white">
                <UserPlus className="h-4 w-4 ml-2" />
                إضافة كابتن توصيل جديد
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Captains Grid */}
      {!loading && viewMode === "grid" && filteredCaptains.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCaptains.map((captain) => (
            <Card key={captain.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {captain.profile_image ? (
                        <img
                          src={captain.profile_image}
                          alt={captain.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {captain.avatar}
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        captain.status === "نشط" ? "bg-green-500" : 
                        captain.status === "إجازة" ? "bg-yellow-500" : "bg-red-500"
                      }`}></div>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{captain.name}</CardTitle>
                      <p className="text-sm text-gray-600">{captain.position}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} />
                    <span>{captain.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} />
                    <span>{captain.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>{captain.location}</span>
                  </div>
                  {captain.description && (
                    <div className="text-sm text-gray-600">
                      <p className="line-clamp-2">{captain.description}</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">الأداء</span>
                      <span className="font-medium">{captain.performance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${captain.performance}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex items-center gap-2 w-full">
                  <Button className="flex-1 px-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                    <Edit size={16} />
                    تعديل
                  </Button>
                  <Button 
                    onClick={() => handleDelete(captain.id)}
                    className="px-3 py-1.5 text-xs border border-gray-300 bg-white text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Captain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">إضافة كابتن توصيل جديد</h3>
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">المعلومات الشخصية</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="أدخل الاسم الكامل"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="example@candywater.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+966501234567"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">كلمة المرور *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="أدخل كلمة المرور"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Position and Location */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">المعلومات الوظيفية</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">نوع الوظيفة *</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value: "كابتن توصيل" | "مندوب") => 
                        setFormData({...formData, position: value})
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر نوع الوظيفة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="كابتن توصيل">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            كابتن توصيل
                          </div>
                        </SelectItem>
                        <SelectItem value="مندوب">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            مندوب
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">الموقع *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="الرياض، جدة، الدمام..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">الحالة</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "نشط" | "إجازة" | "غير نشط") => 
                        setFormData({...formData, status: value})
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="نشط">نشط</SelectItem>
                        <SelectItem value="إجازة">إجازة</SelectItem>
                        <SelectItem value="غير نشط">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Profile Image */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">الصورة الشخصية</h4>
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
                          onClick={() => document.getElementById('profile-image-upload')?.click()}
                          className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <Upload className="h-4 w-4 ml-2" />
                          اختيار صورة شخصية
                        </Button>
                        <p className="text-sm text-gray-500">PNG, JPG حتى 5MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="أدخل وصف مختصر عن كابتن التوصيل..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 px-3 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name || !formData.email || !formData.phone || !formData.password}
                className="flex-1 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-2" />
                    إضافة كابتن التوصيل
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