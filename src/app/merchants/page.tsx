"use client";

import { useState } from "react";
import Layout from "../components/Layout";
import { 
  Building, 
  Plus, 
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
  const [merchants, setMerchants] = useState<Merchant[]>([
    {
      id: "1",
      name: "شركة المياه الوطنية",
      phone: "+966507654321",
      email: "info@nationalwater.com",
      status: "نشط",
      createdAt: "2024-01-10",
      lastLogin: "2024-01-19",
      ordersCount: 45,
      rating: 4.9,
      location: "الرياض",
      totalSpent: 8500,
      commercialRecord: "4030000001",
      nationalAddress: "الرياض، حي النزهة، شارع الملك فهد",
      taxNumber: "300000000",
      nationalId: "1012345678",
      documents: {
        commercialRecordDoc: "/documents/commercial-record-1.pdf",
        nationalAddressDoc: "/documents/national-address-1.pdf",
        taxNumberDoc: "/documents/tax-number-1.pdf",
        nationalIdDoc: "/documents/national-id-1.jpg"
      }
    },
    {
      id: "2",
      name: "مؤسسة المياه الجديدة",
      phone: "+966501112223",
      email: "contact@newwater.com",
      status: "في انتظار الموافقة",
      createdAt: "2024-01-01",
      lastLogin: "2024-01-15",
      ordersCount: 0,
      rating: 0,
      location: "جدة",
      totalSpent: 0,
      commercialRecord: "4030000002",
      nationalAddress: "جدة، حي الكورنيش، شارع التحلية",
      taxNumber: "300000001",
      nationalId: "2012345678",
      documents: {
        commercialRecordDoc: "/documents/commercial-record-2.pdf",
        nationalAddressDoc: "/documents/national-address-2.pdf",
        taxNumberDoc: "/documents/tax-number-2.pdf",
        nationalIdDoc: "/documents/national-id-2.jpg"
      }
    },
    {
      id: "3",
      name: "شركة المياه المتميزة",
      phone: "+966503334445",
      email: "info@premiumwater.com",
      status: "نشط",
      createdAt: "2024-01-18",
      lastLogin: "2024-01-21",
      ordersCount: 28,
      rating: 4.7,
      location: "الدمام",
      totalSpent: 4200,
      commercialRecord: "4030000003",
      nationalAddress: "الدمام، حي الشاطئ، شارع الملك خالد",
      taxNumber: "300000002",
      nationalId: "3012345678",
      documents: {
        commercialRecordDoc: "/documents/commercial-record-3.pdf",
        nationalAddressDoc: "/documents/national-address-3.pdf",
        taxNumberDoc: "/documents/tax-number-3.pdf",
        nationalIdDoc: "/documents/national-id-3.jpg"
      }
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
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

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.phone.includes(searchTerm) ||
                         merchant.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.commercialRecord.includes(searchTerm);
    const matchesStatus = filterStatus === "الكل" || merchant.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddMerchant = () => {
    const merchant: Merchant = {
      id: Date.now().toString(),
      name: newMerchant.name,
      phone: newMerchant.phone,
      email: newMerchant.email,
      status: "في انتظار الموافقة",
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: "-",
      ordersCount: 0,
      rating: 0,
      location: newMerchant.location,
      totalSpent: 0,
      commercialRecord: newMerchant.commercialRecord,
      nationalAddress: newMerchant.nationalAddress,
      taxNumber: newMerchant.taxNumber,
      nationalId: newMerchant.nationalId,
      documents: {}
    };
    
    setMerchants([...merchants, merchant]);
    setShowAddModal(false);
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
  };

  const toggleMerchantStatus = (merchantId: string) => {
    setMerchants(merchants.map(merchant => 
      merchant.id === merchantId 
        ? { ...merchant, status: merchant.status === "نشط" ? "معطل" : "نشط" }
        : merchant
    ));
  };

  const approveMerchant = (merchantId: string) => {
    setMerchants(merchants.map(merchant => 
      merchant.id === merchantId 
        ? { ...merchant, status: "نشط" }
        : merchant
    ));
  };

  const deleteMerchant = (merchantId: string) => {
    setMerchants(merchants.filter(merchant => merchant.id !== merchantId));
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
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
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
                          onClick={() => {
                            setSelectedMerchant(merchant);
                            setShowDocumentModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-100"
                          title="عرض المستندات"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <span className="text-xs text-gray-500">
                          {Object.keys(merchant.documents).length}/4
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="أدخل اسم الشركة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={newMerchant.phone}
                    onChange={(e) => setNewMerchant({...newMerchant, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+966501234567"
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="الرياض، جدة، الدمام"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السجل التجاري</label>
                  <input
                    type="text"
                    value={newMerchant.commercialRecord}
                    onChange={(e) => setNewMerchant({...newMerchant, commercialRecord: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="4030000001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الوطني</label>
                  <input
                    type="text"
                    value={newMerchant.nationalAddress}
                    onChange={(e) => setNewMerchant({...newMerchant, nationalAddress: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="الرياض، حي النزهة، شارع الملك فهد"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرقم الضريبي</label>
                  <input
                    type="text"
                    value={newMerchant.taxNumber}
                    onChange={(e) => setNewMerchant({...newMerchant, taxNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="300000000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الهوية الوطنية</label>
                  <input
                    type="text"
                    value={newMerchant.nationalId}
                    onChange={(e) => setNewMerchant({...newMerchant, nationalId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="1012345678"
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
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-colors"
                >
                  إضافة التاجر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {showDocumentModal && selectedMerchant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-xl rounded-xl bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">مستندات {selectedMerchant.name}</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">السجل التجاري</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{selectedMerchant.commercialRecord}</span>
                    <button className="text-purple-600 hover:text-purple-900">
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">العنوان الوطني</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{selectedMerchant.nationalAddress}</span>
                    <button className="text-purple-600 hover:text-purple-900">
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">الرقم الضريبي</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{selectedMerchant.taxNumber}</span>
                    <button className="text-purple-600 hover:text-purple-900">
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">الهوية الوطنية</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{selectedMerchant.nationalId}</span>
                    <button className="text-purple-600 hover:text-purple-900">
                      <FileImage className="h-4 w-4" />
                    </button>
                  </div>
                </div>
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
    </Layout>
  );
} 