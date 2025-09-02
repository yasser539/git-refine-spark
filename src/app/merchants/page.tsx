"use client";

import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import JSZip from "jszip";
import { 
  Building, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  FileText,
  Download,
  Upload,
  RefreshCw,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  FileImage
} from "lucide-react";

import { merchantsService, merchantDocumentsService, type MerchantDb } from "@/lib/supabase-services";

interface Merchant {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: "نشط" | "معطل" | "في انتظار الموافقة";
  createdAt: string;
  lastLogin: string;
  avatar?: string;
  ordersCount?: number;
  rating?: number;
  location: string;
  totalSpent: number;
  // حقول خاصة بالتاجر
  commercialRecord: string;
  nationalAddress: string;
  taxNumber: string;
  nationalId: string;
  // المستندات المرفوعة
  documents: {
    commercialRecordDoc?: string;
    nationalAddressDoc?: string;
    taxNumberDoc?: string;
    nationalIdDoc?: string;
  };
}

export default function MerchantsManagement() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedMerchantDocs, setSelectedMerchantDocs] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<null | { type: 'success' | 'error' | 'info'; message: string }>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [merchantToApprove, setMerchantToApprove] = useState<Merchant | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("الكل");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const [newMerchant, setNewMerchant] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    password: "",
    commercialRecord: "",
    nationalAddress: "",
    taxNumber: "",
    nationalId: "",
    documents: {
      commercialRecordDoc: null as File | null,
      nationalAddressDoc: null as File | null,
      taxNumberDoc: null as File | null,
      nationalIdDoc: null as File | null
    }
  });

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const downloadDocumentsAsZip = async (merchantName: string, documents: any[]) => {
    if (documents.length === 0) {
      showToast('error', 'لا توجد مستندات للتحميل');
      return;
    }

    showToast('info', 'جاري تجهيز الملف للتحميل...');

    try {
      const zip = new JSZip();
      let addedFiles = 0;
      
      // إضافة كل مستند إلى الملف المضغوط
      for (const doc of documents) {
        try {
          // جلب الملف من الرابط
          const response = await fetch(doc.file_path);
          if (response.ok) {
            const blob = await response.blob();
            
            // تحديد اسم الملف بناءً على نوع المستند
            let fileName = '';
            switch (doc.doc_type) {
              case 'commercial_register':
                fileName = 'السجل_التجاري';
                break;
              case 'national_address':
                fileName = 'العنوان_الوطني';
                break;
              case 'tax_number':
                fileName = 'الرقم_الضريبي';
                break;
              case 'national_id':
                fileName = 'الهوية_الوطنية';
                break;
              default:
                fileName = doc.doc_type;
            }
            
            // إضافة امتداد الملف
            const fileExtension = doc.mime_type?.includes('pdf') ? '.pdf' : '.jpg';
            fileName += fileExtension;
            
            zip.file(fileName, blob);
            addedFiles++;
          }
        } catch (error) {
          console.error(`خطأ في جلب المستند ${doc.doc_type}:`, error);
        }
      }
      
      if (addedFiles === 0) {
        showToast('error', 'لم يتم العثور على مستندات قابلة للتحميل');
        return;
      }
      
      // إنشاء وتحميل الملف المضغوط
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `مستندات_${merchantName}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast('success', `تم تحميل ${addedFiles} مستند بنجاح`);
    } catch (error) {
      console.error('خطأ في إنشاء الملف المضغوط:', error);
      showToast('error', 'حدث خطأ أثناء تحميل المستندات');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newMerchant.name.trim()) errors.name = 'اسم الشركة مطلوب';
    if (!newMerchant.phone.trim()) errors.phone = 'رقم الهاتف مطلوب';
    if (!newMerchant.location.trim()) errors.location = 'الموقع مطلوب';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.phone.includes(searchTerm) ||
                         merchant.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.commercialRecord.includes(searchTerm);
    const matchesStatus = filterStatus === "الكل" || merchant.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // خرائط حالة قاعدة البيانات <-> واجهة المستخدم
  const mapStatusDbToUi = (status: MerchantDb['status']): Merchant['status'] => {
    if (status === 'approved') return 'نشط';
    if (status === 'rejected') return 'معطل';
    return 'في انتظار الموافقة';
  };

  const mapStatusUiToDb = (status: Merchant['status']): MerchantDb['status'] => {
    if (status === 'نشط') return 'approved';
    if (status === 'معطل') return 'rejected';
    return 'pending';
  };

  const dbToUiMerchant = (m: MerchantDb): Merchant => ({
    id: m.merchant_id,
    name: m.store_name,
    phone: m.phone_display || m.phone_e164 || '',
    email: '',
    status: mapStatusDbToUi(m.status),
    createdAt: (m.created_at || '').split('T')[0],
    lastLogin: '-',
    avatar: m.store_name?.charAt(0),
    ordersCount: 0,
    rating: 0,
    location: m.address,
    totalSpent: 0,
    commercialRecord: '',
    nationalAddress: '',
    taxNumber: '',
    nationalId: '',
    documents: {}
  });

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const data = await merchantsService.getAllMerchants();
      setMerchants(data.map(dbToUiMerchant));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const handleAddMerchant = async () => {
    try {
      if (!validateForm()) {
        showToast('error', 'الرجاء تعبئة الحقول المطلوبة');
        return;
      }
      setIsSubmitting(true);
      setLoading(true);
      const created = await merchantsService.createMerchant({
        store_name: newMerchant.name || 'N/A',
        owner_name: 'غير محدد',
        phone_display: newMerchant.phone || null,
        phone_e164: newMerchant.phone || null,
        address: newMerchant.location || 'N/A',
        status: 'pending'
      });
      const ui = dbToUiMerchant(created);
      setMerchants([ui, ...merchants]);

      // رفع المستندات إن وُجدت
      const docsUploads: Array<Promise<any>> = [];
      const filesMap: Array<{ key: keyof typeof newMerchant.documents; type: 'commercial_register'|'national_address'|'tax_number'|'national_id' }>= [
        { key: 'commercialRecordDoc', type: 'commercial_register' },
        { key: 'nationalAddressDoc', type: 'national_address' },
        { key: 'taxNumberDoc', type: 'tax_number' },
        { key: 'nationalIdDoc', type: 'national_id' }
      ];

      filesMap.forEach(({ key, type }) => {
        const file = newMerchant.documents[key];
        if (file) {
          docsUploads.push((async () => {
            const uploaded = await merchantDocumentsService.uploadMerchantDoc(file, created.merchant_id);
            await merchantDocumentsService.addDocument({
              merchant_id: created.merchant_id,
              doc_type: type,
              file_name: file.name,
              file_path: uploaded.path,
              mime_type: file.type
            });
          })());
        }
      });
      await Promise.all(docsUploads);
      setShowAddModal(false);
      showToast('success', 'تم إضافة التاجر ورفع المستندات بنجاح');
    } catch (e) {
      console.error(e);
      showToast('error', 'فشل إضافة التاجر، حاول مرة أخرى');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
      setNewMerchant({
        name: "",
        phone: "",
        email: "",
        location: "",
        password: "",
        commercialRecord: "",
        nationalAddress: "",
        taxNumber: "",
        nationalId: "",
        documents: {
          commercialRecordDoc: null,
          nationalAddressDoc: null,
          taxNumberDoc: null,
          nationalIdDoc: null
        }
      });
    }
  };

  const toggleMerchantStatus = async (merchantId: string) => {
    const current = merchants.find(m => m.id === merchantId);
    if (!current) return;
    const nextUi: Merchant['status'] = current.status === 'نشط' ? 'معطل' : 'نشط';
    try {
      setMerchants(merchants.map(m => m.id === merchantId ? { ...m, status: nextUi } : m));
      await merchantsService.updateMerchant(merchantId, { status: mapStatusUiToDb(nextUi) });
    } catch (e) {
      console.error(e);
      // rollback
      setMerchants(merchants.map(m => m.id === merchantId ? { ...m, status: current.status } : m));
    }
  };

  const approveMerchant = async (merchantId: string) => {
    const merchant = merchants.find(m => m.id === merchantId);
    if (!merchant) return;
    
    setMerchantToApprove(merchant);
    setShowApprovalModal(true);
  };

  const confirmApproval = async () => {
    if (!merchantToApprove) return;
    
    const prev = merchantToApprove.status;
    try {
      setMerchants(merchants.map(merchant => 
        merchant.id === merchantToApprove.id 
          ? { ...merchant, status: "نشط" }
          : merchant
      ));
      await merchantsService.updateMerchant(merchantToApprove.id, { status: 'approved' });
      showToast('success', `تم الموافقة على ${merchantToApprove.name} بنجاح`);
      setShowApprovalModal(false);
      setMerchantToApprove(null);
    } catch (e) {
      console.error(e);
      if (prev) {
        setMerchants(merchants.map(merchant => merchant.id === merchantToApprove.id ? { ...merchant, status: prev } : merchant));
      }
      showToast('error', 'تعذر الموافقة على التاجر');
    }
  };

  const deleteMerchant = async (merchantId: string) => {
    const prev = merchants;
    try {
      const confirmDelete = typeof window !== 'undefined' ? window.confirm('هل أنت متأكد من حذف هذا التاجر؟ لا يمكن التراجع.') : true;
      if (!confirmDelete) return;
      setMerchants(merchants.filter(merchant => merchant.id !== merchantId));
      await merchantsService.deleteMerchant(merchantId);
      showToast('success', 'تم حذف التاجر');
    } catch (e) {
      console.error(e);
      setMerchants(prev);
      showToast('error', 'تعذر حذف التاجر');
    }
  };

  const handleFileUpload = (field: keyof typeof newMerchant.documents, file: File) => {
    setNewMerchant({
      ...newMerchant,
      documents: {
        ...newMerchant.documents,
        [field]: file
      }
    });
  };

  const stats = [
    { 
      title: "إجمالي التجار", 
      value: merchants.length, 
      change: "+8%", 
      icon: Building, 
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      title: "التجار النشطين", 
      value: merchants.filter(m => m.status === "نشط").length, 
      change: "+5%", 
      icon: CheckCircle, 
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    { 
      title: "في انتظار الموافقة", 
      value: merchants.filter(m => m.status === "في انتظار الموافقة").length, 
      change: "+3%", 
      icon: Clock, 
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50"
    },
    { 
      title: "إجمالي الطلبات", 
      value: merchants.reduce((acc, m) => acc + (m.ordersCount || 0), 0), 
      change: "+15%", 
      icon: TrendingUp, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "نشط": return "bg-green-100 text-green-800";
      case "معطل": return "bg-red-100 text-red-800";
      case "في انتظار الموافقة": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        {toast && (
          <div className={`mb-4 rounded-lg p-3 text-sm ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
            {toast.message}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة التجار</h1>
            <p className="text-gray-600">إدارة جميع التجار والمستندات المطلوبة</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <Download className="h-4 w-4" />
              تصدير
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              استيراد
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-60"
              disabled={isSubmitting}
            >
              <UserPlus className="h-4 w-4" />
              إضافة تاجر جديد
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${stat.bgColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث بالاسم أو السجل التجاري..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="الكل">الكل</option>
              <option value="نشط">نشط</option>
              <option value="معطل">معطل</option>
              <option value="في انتظار الموافقة">في انتظار الموافقة</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">عرض</label>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-sm font-medium ${viewMode === "list" ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                قائمة
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm font-medium ${viewMode === "grid" ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                شبكة
              </button>
            </div>
          </div>
          
          <div className="flex items-end">
            <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2">
              <Filter className="h-4 w-4" />
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* Merchants Display */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">قائمة التجار ({filteredMerchants.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاجر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المستندات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإحصائيات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    آخر تسجيل دخول
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMerchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-medium text-lg">
                            {merchant.name.charAt(0)}
                          </div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-bold text-gray-900">{merchant.name}</div>
                          <div className="text-sm text-gray-500">{merchant.email}</div>
                          <div className="text-sm text-gray-500">{merchant.phone}</div>
                          <div className="text-sm text-gray-500">{merchant.location}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            السجل التجاري: {merchant.commercialRecord}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(merchant.status)}`}>
                        {merchant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={async () => {
                            setSelectedMerchant(merchant);
                            try {
                              const docs = await merchantDocumentsService.listDocuments(merchant.id);
                              setSelectedMerchantDocs(docs || []);
                            } catch (e) {
                              console.error(e);
                              setSelectedMerchantDocs([]);
                            }
                            setShowDocumentModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100"
                          title="عرض المستندات"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <span className="text-xs text-gray-500">
                          {selectedMerchant?.id === merchant.id ? selectedMerchantDocs.length : 0}/4
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {merchant.ordersCount || 0} طلب
                      </div>
                      <div className="text-sm text-gray-500">
                        {merchant.totalSpent} ريال
                      </div>
                      {merchant.rating && merchant.rating > 0 && (
                        <div className="text-sm text-gray-500">
                          ⭐ {merchant.rating}/5
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {merchant.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {merchant.status === "في انتظار الموافقة" && (
                          <button
                            onClick={() => approveMerchant(merchant.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                            title="موافقة على التاجر"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleMerchantStatus(merchant.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                        >
                          {merchant.status === "نشط" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteMerchant(merchant.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMerchants.map((merchant) => (
            <div key={merchant.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-medium text-lg">
                  {merchant.name.charAt(0)}
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{merchant.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{merchant.email}</p>
                <p className="text-sm text-gray-500">{merchant.phone}</p>
                <p className="text-sm text-gray-500">{merchant.location}</p>
                <p className="text-xs text-gray-400 mt-1">السجل التجاري: {merchant.commercialRecord}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(merchant.status)}`}>
                    {merchant.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">الطلبات: {merchant.ordersCount || 0}</span>
                  <span className="text-gray-600">{merchant.totalSpent} ريال</span>
                </div>
                
                {merchant.rating && merchant.rating > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">التقييم: ⭐ {merchant.rating}/5</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => {
                      setSelectedMerchant(merchant);
                      setShowDocumentModal(true);
                    }}
                    className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                  >
                    المستندات
                  </button>
                  {merchant.status === "في انتظار الموافقة" ? (
                    <button
                      onClick={() => approveMerchant(merchant.id)}
                      className="text-green-600 hover:text-green-900 text-sm font-medium"
                    >
                      موافقة
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleMerchantStatus(merchant.id)}
                      className={`text-sm font-medium ${merchant.status === "نشط" ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}`}
                    >
                      {merchant.status === "نشط" ? "تعطيل" : "تفعيل"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredMerchants.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تجار</h3>
          <p className="text-gray-600">لم يتم العثور على تجار تطابق معايير البحث</p>
        </div>
      )}

      {/* Add Merchant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-xl rounded-xl bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">إضافة تاجر جديد</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم الشركة/المؤسسة</label>
                  <input
                    type="text"
                    value={newMerchant.name}
                    onChange={(e) => setNewMerchant({...newMerchant, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.name ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="أدخل اسم الشركة"
                  />
                  {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={newMerchant.phone}
                    onChange={(e) => setNewMerchant({...newMerchant, phone: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.phone ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="+966501234567"
                  />
                  {formErrors.phone && <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={newMerchant.email}
                    onChange={(e) => setNewMerchant({...newMerchant, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="info@company.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموقع</label>
                  <input
                    type="text"
                    value={newMerchant.location}
                    onChange={(e) => setNewMerchant({...newMerchant, location: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.location ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="الرياض، جدة، الدمام"
                  />
                  {formErrors.location && <p className="text-xs text-red-600 mt-1">{formErrors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السجل التجاري (صورة أو PDF)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('commercialRecordDoc', file);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الوطني (صورة أو PDF)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('nationalAddressDoc', file);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرقم الضريبي (صورة أو PDF)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('taxNumberDoc', file);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الهوية الوطنية (صورة أو PDF)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('nationalIdDoc', file);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                  <input
                    type="password"
                    value={newMerchant.password}
                    onChange={(e) => setNewMerchant({...newMerchant, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="كلمة المرور"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddMerchant}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-colors disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'جارٍ الإضافة...' : 'إضافة التاجر'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {showDocumentModal && selectedMerchant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[450px] shadow-xl rounded-xl bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">مستندات {selectedMerchant.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedMerchantDocs.length} من 4 مستندات مرفوعة
                  </p>
                </div>
                {selectedMerchantDocs.length > 0 && (
                  <button
                    onClick={() => downloadDocumentsAsZip(selectedMerchant.name, selectedMerchantDocs)}
                    className="flex items-center space-x-2 space-x-reverse px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm rounded-lg hover:shadow-lg transition-colors"
                    title="تحميل جميع المستندات كملف مضغوط"
                  >
                    <Download className="h-4 w-4" />
                    <span>تحميل ZIP</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {selectedMerchantDocs.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">لا توجد مستندات مرفوعة</div>
                )}
                {selectedMerchantDocs.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className={`w-3 h-3 rounded-full ${
                          doc.doc_type === 'commercial_register' ? 'bg-blue-500' :
                          doc.doc_type === 'national_address' ? 'bg-green-500' :
                          doc.doc_type === 'tax_number' ? 'bg-yellow-500' :
                          doc.doc_type === 'national_id' ? 'bg-purple-500' : 'bg-gray-500'
                        }`}></div>
                        <h4 className="font-medium text-gray-900">
                          {doc.doc_type === 'commercial_register' && 'السجل التجاري'}
                          {doc.doc_type === 'national_address' && 'العنوان الوطني'}
                          {doc.doc_type === 'tax_number' && 'الرقم الضريبي'}
                          {doc.doc_type === 'national_id' && 'الهوية الوطنية'}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <a 
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100 transition-colors" 
                          href={doc.file_path || '#'} 
                          target="_blank" 
                          rel="noreferrer"
                          title="عرض المستند"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a 
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100 transition-colors" 
                          href={doc.file_path || '#'} 
                          download
                          title="تحميل المستند"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {doc.file_name || doc.mime_type || 'مستند'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {doc.mime_type?.includes('pdf') ? 'PDF' : 'صورة'}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {showApprovalModal && merchantToApprove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-xl rounded-xl bg-white">
            <div className="mt-3">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  تأكيد الموافقة على التاجر
                </h3>
                <p className="text-sm text-gray-600">
                  هل أنت متأكد من الموافقة على التاجر
                </p>
                <p className="text-lg font-semibold text-purple-600 mt-2">
                  {merchantToApprove.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  سيتم تفعيل التاجر وإمكانية استقبال الطلبات
                </p>
              </div>
              
              <div className="flex justify-center space-x-3 space-x-reverse">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setMerchantToApprove(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmApproval}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-colors"
                >
                  تأكيد الموافقة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 