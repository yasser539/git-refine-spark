"use client";

import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { deliveryCaptainsService } from "../../lib/supabase-services";
import { databaseService } from "@/lib/database-services";
import { 
  Users, 
  Plus,
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Car, 
  Star,
  CheckCircle,
  Clock,
  UserX,
  AlertTriangle,
  X,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import type { DeliveryCaptain } from "../../lib/supabase";

export default function DeliveryCaptainsPage() {
  const { user } = useAuth();
  const [captains, setCaptains] = useState<DeliveryCaptain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCaptain, setEditingCaptain] = useState<DeliveryCaptain | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    position: 'كابتن توصيل' as 'كابتن توصيل' | 'مندوب',
    department: '',
    status: 'نشط' as 'نشط' | 'إجازة' | 'غير نشط',
    location: '',
    city: '',
    region: '',
    description: '',
    vehicle_type: '',
    vehicle_model: '',
    vehicle_plate: '',
    vehicle_color: '',
    emergency_contact: '',
    emergency_phone: '',
    id_number: '',
    license_number: '',
    insurance_number: '',
    date_of_birth: '',
    salary: 0,
    commission_rate: 0,
    device_id: '',
    app_version: '',
    is_verified: false,
    background_check_status: 'pending',
    contract_start_date: '',
    profile_image: null as string | null,
    preview_image: null as string | null,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('يجب اختيار ملف صورة');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('الحد الأقصى للصورة 5MB');
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const isFormValid = Boolean(formData.name && formData.email && formData.phone && formData.password);

  const toDateOnly = (value: string) => {
    if (!value) return undefined;
    // value is expected from <input type="date"> as YYYY-MM-DD already
    return value;
  };

  const pickCaptainDbFields = () => {
    const base: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      position: formData.position,
      department: formData.department || 'التوصيل',
      status: formData.status,
      location: formData.location || null,
      city: formData.city || null,
      region: formData.region || null,
      description: formData.description || null,
      vehicle_type: formData.vehicle_type || null,
      vehicle_model: formData.vehicle_model || null,
      vehicle_plate: formData.vehicle_plate || null,
      vehicle_color: formData.vehicle_color || null,
      emergency_contact: formData.emergency_contact || null,
      emergency_phone: formData.emergency_phone || null,
      id_number: formData.id_number || null,
      license_number: formData.license_number || null,
      insurance_number: formData.insurance_number || null,
      salary: formData.salary || 0,
      commission_rate: formData.commission_rate || 0,
      device_id: formData.device_id || null,
      app_version: formData.app_version || null,
      is_verified: formData.is_verified,
      background_check_status: formData.background_check_status,
      contract_start_date: toDateOnly(formData.contract_start_date) || undefined,
      date_of_birth: toDateOnly(formData.date_of_birth) || null,
    };
    return base;
  };

  // جلب البيانات
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // التحقق من وجود متغيرات البيئة
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('يرجى إعداد متغيرات البيئة لـ Supabase. راجع ملف SETUP_ENV.md للتعليمات.');
        return;
      }
      
      // 1) جلب من جدول كباتن التوصيل المخصص
      const captainsData = await deliveryCaptainsService.getAllDeliveryCaptains();

      // 2) جلب من جدول الموظفين لمن لديهم دور deliverer
      const employeesDeliverers = await databaseService.getDeliveryCaptains();
      const mappedEmployees = (employeesDeliverers || []).map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        password: '',
        position: 'كابتن توصيل',
        department: 'التوصيل',
        status: emp.status === 'active' ? 'نشط' : 'غير نشط',
        location: emp.location || null,
        city: emp.city || null,
        region: emp.region || null,
        description: emp.description || null,
        avatar: emp.name?.charAt(0) || 'ك',
        profile_image: emp.profile_image || null,
        performance: Number(emp.performance ?? 0),
        tasks: Number(emp.tasks ?? 0),
        completed: Number(emp.completed ?? 0),
        rating: Number(emp.rating ?? 0),
        total_deliveries: Number(emp.total_deliveries ?? 0),
        total_earnings: Number(emp.total_earnings ?? 0),
        commission_rate: Number(emp.commission_rate ?? 0),
        device_id: emp.device_id || null,
        app_version: emp.app_version || null,
        last_active: emp.last_active || null,
        is_verified: Boolean(emp.is_verified ?? true),
        background_check_status: emp.background_check_status || 'approved',
        join_date: emp.join_date || new Date().toISOString(),
        contract_start_date: emp.contract_start_date || null,
        date_of_birth: emp.date_of_birth || null,
        salary: Number(emp.salary ?? 0),
        id_number: emp.id_number || null,
        license_number: emp.license_number || null,
        insurance_number: emp.insurance_number || null,
        vehicle_type: emp.vehicle_type || null,
        vehicle_model: emp.vehicle_model || null,
        vehicle_plate: emp.vehicle_plate || null,
        vehicle_color: emp.vehicle_color || null,
        created_at: emp.created_at || new Date().toISOString(),
        updated_at: emp.updated_at || new Date().toISOString(),
        created_by: emp.created_by || user?.id || '',
        updated_by: emp.updated_by || user?.id || '',
        notes: emp.notes || '',
        admin_notes: emp.admin_notes || ''
      })) as unknown as DeliveryCaptain[];

      // 3) دمج وإزالة التكرار (حسب البريد إن وجد، وإلا حسب المعرف)
      const combined = [...(captainsData || []), ...mappedEmployees];
      const unique = combined.filter((item, index, self) => {
        const key = item.email ? `email:${item.email}` : `id:${item.id}`;
        return index === self.findIndex((x) => (x.email ? `email:${x.email}` : `id:${x.id}`) === key);
      });

      setCaptains(unique);
    } catch (error: unknown) {
      console.error('❌ خطأ في جلب البيانات:', error);
      setError('فشل في جلب بيانات كباتن التوصيل. تأكد من إعداد قاعدة البيانات بشكل صحيح.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      position: 'كابتن توصيل',
      department: '',
      status: 'نشط',
      location: '',
      city: '',
      region: '',
      description: '',
      vehicle_type: '',
      vehicle_model: '',
      vehicle_plate: '',
      vehicle_color: '',
      emergency_contact: '',
      emergency_phone: '',
      id_number: '',
      license_number: '',
      insurance_number: '',
      date_of_birth: '',
      salary: 0,
      commission_rate: 0,
      device_id: '',
      app_version: '',
      is_verified: false,
      background_check_status: 'pending',
      contract_start_date: '',
      profile_image: null,
      preview_image: null,
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingCaptain(null);
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateCaptain = async () => {
    try {
      setLoading(true);
      const captainData = {
        ...pickCaptainDbFields(),
        join_date: new Date().toISOString(),
        contract_start_date: toDateOnly(formData.contract_start_date),
        performance: 0,
        tasks: 0,
        completed: 0,
        rating: 0,
        total_deliveries: 0,
        total_earnings: 0,
        last_active: new Date().toISOString(),
        verification_date: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user?.id || '',
        updated_by: user?.id || '',
        notes: '',
        admin_notes: ''
      } as any;

      // رفع الصورة إن وُجدت
      if (selectedImage) {
        const cleanName = selectedImage.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
        const upload = await deliveryCaptainsService.uploadCaptainProfileImage(selectedImage, `${Date.now()}-${cleanName}`);
        if (upload?.success && upload.publicUrl) {
          captainData.profile_image = upload.publicUrl;
        }
      }

      const newCaptain = await deliveryCaptainsService.createDeliveryCaptain(captainData);
      if (newCaptain) {
        setCaptains(prev => [...prev, newCaptain]);
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating captain:', error);
      setError('فشل في إضافة كابتن التوصيل');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCaptain = async () => {
    if (!editingCaptain) return;

    try {
      setLoading(true);
      const updatePayload = { ...pickCaptainDbFields(), updated_at: new Date().toISOString(), updated_by: user?.id || '' } as any;

      if (selectedImage) {
        const cleanName = selectedImage.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
        const upload = await deliveryCaptainsService.uploadCaptainProfileImage(selectedImage, `${Date.now()}-${cleanName}`);
        if (upload?.success && upload.publicUrl) {
          updatePayload.profile_image = upload.publicUrl;
        }
      }
      const updatedCaptain = await deliveryCaptainsService.updateDeliveryCaptain(
        editingCaptain.id,
        updatePayload
      );

      if (updatedCaptain) {
        setCaptains(prev => prev.map(c => c.id === editingCaptain.id ? updatedCaptain : c));
        setShowCreateModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating captain:', error);
      setError('فشل في تحديث كابتن التوصيل');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCaptain = async (captain: DeliveryCaptain) => {
    if (!confirm('هل أنت متأكد من حذف هذا كابتن التوصيل؟')) return;

    try {
      await deliveryCaptainsService.deleteDeliveryCaptain(captain.id);
      
      // حذف الصورة من Storage إذا كانت موجودة
      if (captain.profile_image) {
        await deliveryCaptainsService.deleteCaptainProfileImage(captain.profile_image);
      }
      
      setCaptains(prevCaptains => prevCaptains.filter(c => c.id !== captain.id));

    } catch (error) {
      console.error('Error deleting captain:', error);
      setError('فشل في حذف كابتن التوصيل');
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">كباتن التوصيل والمناديب</h1>
            <p className="text-gray-600">إدارة كباتن التوصيل والمناديب وتتبع أدائهم</p>
          </div>
          <div className="flex items-center gap-3">
          <Button 
            onClick={fetchData}
            disabled={loading}
              className="bg-gray-500 text-white hover:bg-gray-600"
          >
            تحديث
          </Button>
            <Button 
              onClick={() => {
                setShowCreateModal(true);
                resetForm();
              }}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة كابتن جديد
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">إجمالي الكباتن</p>
                <p className="text-2xl font-bold text-blue-900">{captains.length}</p>
                <p className="text-sm text-blue-600">كابتن</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">الكباتن النشطون</p>
                <p className="text-2xl font-bold text-green-900">{captains.filter(c => c.status === 'نشط').length}</p>
                <p className="text-sm text-green-600">نشط</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">في إجازة</p>
                <p className="text-2xl font-bold text-yellow-900">{captains.filter(c => c.status === 'إجازة').length}</p>
                <p className="text-sm text-yellow-600">إجازة</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">إجمالي التوصيلات</p>
                <p className="text-2xl font-bold text-purple-900">{captains.reduce((sum, c) => sum + c.total_deliveries, 0)}</p>
                <p className="text-sm text-purple-600">توصيل</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500">
                <Car className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 font-medium">خطأ في الاتصال</p>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
          <div className="mt-3">
            <Button 
              onClick={fetchData}
              className="bg-red-500 text-white hover:bg-red-600 text-sm"
            >
              إعادة المحاولة
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات كباتن التوصيل...</p>
        </div>
      )}

      {/* Captains List */}
      {!loading && (
      <div className="space-y-6">
        {captains.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد كباتن توصيل</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة كابتن توصيل جديد</p>
              <Button onClick={() => {
                  setShowCreateModal(true);
                  resetForm();
              }} className="bg-blue-500 text-white">
                <Plus className="h-4 w-4 ml-2" />
                إضافة كابتن جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {captains.map((captain) => (
              <Card key={captain.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        {captain.profile_image ? (
                          <img 
                            src={captain.profile_image} 
                            alt={captain.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-blue-600">
                            {captain.avatar || captain.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{captain.name}</CardTitle>
                        <p className="text-sm text-gray-600">{captain.position}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${captain.status === 'نشط' ? 'text-green-600 bg-green-100' : captain.status === 'إجازة' ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100'}`}>
                      {captain.status === 'نشط' ? <CheckCircle className="h-4 w-4" /> : captain.status === 'إجازة' ? <Clock className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                      {captain.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{captain.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{captain.phone}</span>
                    </div>
                    {captain.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{captain.location}</span>
                      </div>
                    )}
                    {captain.vehicle_plate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Car className="h-4 w-4" />
                        <span>{captain.vehicle_plate}</span>
                      </div>
                    )}
                      {captain.license_number && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Car className="h-4 w-4" />
                          <span>رقم الرخصة: {captain.license_number}</span>
                      </div>
                    )}
                    
                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">التوصيلات</p>
                        <p className="text-lg font-semibold text-blue-600">{captain.total_deliveries}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">التقييم</p>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-lg font-semibold text-yellow-600">{captain.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      onClick={() => {
                          setEditingCaptain(captain);
                          setFormData({
                            name: captain.name,
                            email: captain.email,
                            phone: captain.phone,
                            password: captain.password,
                            position: captain.position,
                            department: captain.department,
                            status: captain.status,
                            location: captain.location || '',
                            city: captain.city || '',
                            region: captain.region || '',
                            description: captain.description || '',
                            vehicle_type: captain.vehicle_type || '',
                            vehicle_model: captain.vehicle_model || '',
                            vehicle_plate: captain.vehicle_plate || '',
                            vehicle_color: captain.vehicle_color || '',
                            emergency_contact: captain.emergency_contact || '',
                            emergency_phone: captain.emergency_phone || '',
                            id_number: captain.id_number || '',
                            license_number: captain.license_number || '',
                            insurance_number: captain.insurance_number || '',
                            salary: captain.salary || 0,
                            commission_rate: captain.commission_rate,
                            device_id: captain.device_id || '',
                            app_version: captain.app_version || '',
                            is_verified: captain.is_verified,
                            background_check_status: captain.background_check_status,
                            contract_start_date: captain.contract_start_date || '',
                            date_of_birth: (captain as any).date_of_birth || '',
                            profile_image: captain.profile_image || null,
                            preview_image: captain.profile_image || null,
                          });
                          setSelectedImage(null);
                          setImagePreview(captain.profile_image || null);
                          setShowCreateModal(true);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4" />
                      تعديل
                    </Button>
                    <Button
                      onClick={() => handleDeleteCaptain(captain)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCaptain ? 'تعديل كابتن التوصيل' : 'إضافة كابتن توصيل جديد'}
              </h2>
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Required hint */}
              <p className="text-xs text-gray-500">الحقول المعلمة بـ * مطلوبة</p>

              {/* Basic Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">المعلومات الأساسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="أدخل الاسم الكامل" />
                  </div>
                  <div>
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="example@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="05xxxxxxxx" />
                  </div>
                  <div>
                    <Label htmlFor="password">كلمة المرور *</Label>
                    <Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="••••••••" />
                  </div>
                  <div>
                    <Label htmlFor="position">المنصب</Label>
                    <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                      <SelectTrigger><SelectValue placeholder="اختر المنصب"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="كابتن توصيل">كابتن توصيل</SelectItem>
                        <SelectItem value="مندوب">مندوب</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">الحالة</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger><SelectValue placeholder="اختر الحالة"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="نشط">نشط</SelectItem>
                        <SelectItem value="إجازة">إجازة</SelectItem>
                        <SelectItem value="غير نشط">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">الموقع</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="location">الموقع</Label>
                    <Input id="location" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="الحي/الشارع" />
                  </div>
                  <div>
                    <Label htmlFor="city">المدينة</Label>
                    <Input id="city" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} placeholder="المدينة" />
                  </div>
                  <div>
                    <Label htmlFor="region">المنطقة</Label>
                    <Input id="region" value={formData.region} onChange={(e) => handleInputChange('region', e.target.value)} placeholder="المنطقة" />
                  </div>
                </div>
              </div>

              {/* Identity and Dates */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">التوثيق والتواريخ</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="id_number">رقم الهوية</Label>
                    <Input id="id_number" value={formData.id_number} onChange={(e) => handleInputChange('id_number', e.target.value)} placeholder="رقم الهوية" />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">تاريخ الميلاد</Label>
                    <Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={(e) => handleInputChange('date_of_birth', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="contract_start_date">تاريخ بدء العمل</Label>
                    <Input id="contract_start_date" type="date" value={formData.contract_start_date} onChange={(e) => handleInputChange('contract_start_date', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">المركبة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicle_type">نوع المركبة</Label>
                    <Input id="vehicle_type" value={formData.vehicle_type} onChange={(e) => handleInputChange('vehicle_type', e.target.value)} placeholder="نوع المركبة" />
                  </div>
                  <div>
                    <Label htmlFor="vehicle_plate">رقم اللوحة</Label>
                    <Input id="vehicle_plate" value={formData.vehicle_plate} onChange={(e) => handleInputChange('vehicle_plate', e.target.value)} placeholder="رقم اللوحة" />
                  </div>
                  <div>
                    <Label htmlFor="license_number">رقم الرخصة</Label>
                    <Input id="license_number" value={formData.license_number} onChange={(e) => handleInputChange('license_number', e.target.value)} placeholder="رقم الرخصة" />
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">الراتب والعمولة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salary">الراتب</Label>
                    <Input id="salary" type="number" value={formData.salary} onChange={(e) => handleInputChange('salary', parseFloat(e.target.value) || 0)} placeholder="الراتب" />
                  </div>
                  <div>
                    <Label htmlFor="commission_rate">نسبة العمولة</Label>
                    <Input id="commission_rate" type="number" value={formData.commission_rate} onChange={(e) => handleInputChange('commission_rate', parseFloat(e.target.value) || 0)} placeholder="نسبة العمولة" />
                  </div>
                </div>
              </div>

              {/* Profile Image */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">الصورة الشخصية</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img src={imagePreview} alt="Preview" className="mx-auto max-h-40 rounded-lg" />
                      <div className="flex justify-center gap-2">
                        <Button onClick={() => { setSelectedImage(null); setImagePreview(null); }} className="px-3 py-1.5 text-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">إزالة</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
                      <div>
                        <input id="captain-image" type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                        <label htmlFor="captain-image" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer">
                          <Upload className="h-4 w-4" /> اختر صورة
                        </label>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG حتى 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-6">
              <span className="text-xs text-gray-500">لن نستعمل بياناتك إلا داخل النظام</span>
              <div className="flex items-center gap-3">
                <Button onClick={() => { setShowCreateModal(false); resetForm(); }} className="bg-gray-500 text-white hover:bg-gray-600">
                  إلغاء
                </Button>
                <Button onClick={editingCaptain ? handleUpdateCaptain : handleCreateCaptain} disabled={loading || !isFormValid} className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                  {loading ? 'جاري الحفظ...' : (editingCaptain ? 'تحديث' : 'إضافة')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
