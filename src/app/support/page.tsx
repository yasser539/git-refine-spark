"use client";

import { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  User,
  Star,
  Search,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Activity,
  Users,
  Package,
  Shield,
  Plus,
  Filter
} from "lucide-react";

interface Complaint {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  subject: string;
  message: string;
  status: "جديد" | "قيد المراجعة" | "تم الحل" | "مغلق";
  priority: "منخفض" | "متوسط" | "عالي" | "عاجل";
  category: "توصيل" | "منتج" | "دفع" | "تطبيق" | "أخرى";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  rating?: number;
}

export default function Support() {
  const { permissions } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: "1",
      customerName: "سارة أحمد",
      customerPhone: "+966501234567",
      customerEmail: "sara@example.com",
      subject: "تأخر في التوصيل",
      message: "طلبتي متأخرة أكثر من ساعة، أريد معرفة السبب",
      status: "قيد المراجعة",
      priority: "عالي",
      category: "توصيل",
      assignedTo: "أحمد محمد",
      createdAt: "2024-01-20 14:30",
      updatedAt: "2024-01-20 15:45"
    },
    {
      id: "2",
      customerName: "محمد علي",
      customerPhone: "+966507654321",
      customerEmail: "mohammed@example.com",
      subject: "مشكلة في الدفع",
      message: "لا يمكنني إتمام عملية الدفع، يظهر خطأ",
      status: "جديد",
      priority: "عاجل",
      category: "دفع",
      createdAt: "2024-01-20 16:20",
      updatedAt: "2024-01-20 16:20"
    },
    {
      id: "3",
      customerName: "فاطمة حسن",
      customerPhone: "+966509876543",
      customerEmail: "fatima@example.com",
      subject: "جودة المنتج",
      message: "المياه التي وصلت لي ليست بنفس الجودة المعتادة",
      status: "تم الحل",
      priority: "متوسط",
      category: "منتج",
      assignedTo: "علي أحمد",
      createdAt: "2024-01-19 10:15",
      updatedAt: "2024-01-20 09:30",
      rating: 4
    },
    {
      id: "4",
      customerName: "خالد عبدالله",
      customerPhone: "+966505556667",
      customerEmail: "khalid@example.com",
      subject: "مشكلة في التطبيق",
      message: "التطبيق لا يعمل بشكل صحيح، يغلق فجأة",
      status: "جديد",
      priority: "عالي",
      category: "تطبيق",
      createdAt: "2024-01-20 17:30",
      updatedAt: "2024-01-20 17:30"
    },
    {
      id: "5",
      customerName: "نور الهدى",
      customerPhone: "+966506667778",
      customerEmail: "noor@example.com",
      subject: "طلب استرداد",
      message: "أريد استرداد المبلغ لطلبي الملغي",
      status: "قيد المراجعة",
      priority: "متوسط",
      category: "دفع",
      assignedTo: "أحمد محمد",
      createdAt: "2024-01-20 12:15",
      updatedAt: "2024-01-20 13:45"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("الكل");
  const [filterPriority, setFilterPriority] = useState<string>("الكل");
  const [filterCategory, setFilterCategory] = useState<string>("الكل");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "الكل" || complaint.status === filterStatus;
    const matchesPriority = filterPriority === "الكل" || complaint.priority === filterPriority;
    const matchesCategory = filterCategory === "الكل" || complaint.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "جديد": return "bg-blue-100 text-blue-800";
      case "قيد المراجعة": return "bg-yellow-100 text-yellow-800";
      case "تم الحل": return "bg-green-100 text-green-800";
      case "مغلق": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "منخفض": return "bg-green-100 text-green-800";
      case "متوسط": return "bg-yellow-100 text-yellow-800";
      case "عالي": return "bg-orange-100 text-orange-800";
      case "عاجل": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "توصيل": return "bg-blue-100 text-blue-800";
      case "منتج": return "bg-green-100 text-green-800";
      case "دفع": return "bg-purple-100 text-purple-800";
      case "تطبيق": return "bg-indigo-100 text-indigo-800";
      case "أخرى": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const updateComplaintStatus = (complaintId: string, newStatus: string) => {
    setComplaints(complaints.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: newStatus as Complaint["status"], updatedAt: new Date().toLocaleString('ar-SA') }
        : complaint
    ));
  };

  const assignComplaint = (complaintId: string, assignedTo: string) => {
    setComplaints(complaints.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, assignedTo, updatedAt: new Date().toLocaleString('ar-SA') }
        : complaint
    ));
  };

  const stats = [
    { 
      title: "إجمالي الشكاوى", 
      value: complaints.length, 
      change: "+5", 
      icon: MessageSquare, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      title: "جديد", 
      value: complaints.filter(c => c.status === "جديد").length, 
      change: "+2", 
      icon: AlertCircle, 
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50"
    },
    { 
      title: "تم الحل", 
      value: complaints.filter(c => c.status === "تم الحل").length, 
      change: "+8", 
      icon: CheckCircle, 
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    { 
      title: "متوسط الرضا", 
      value: "4.2/5", 
      change: "+0.3", 
      icon: Star, 
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الدعم والشكاوى</h1>
            <p className="text-gray-600">إدارة شكاوى العملاء والدعم الفني</p>
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            شكوى جديدة
          </button>
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
                  <span className="text-sm text-gray-500 mr-1">من الأسبوع الماضي</span>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في الشكاوى..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="الكل">الكل</option>
              <option value="جديد">جديد</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="تم الحل">تم الحل</option>
              <option value="مغلق">مغلق</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الأولوية</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="الكل">الكل</option>
              <option value="منخفض">منخفض</option>
              <option value="متوسط">متوسط</option>
              <option value="عالي">عالي</option>
              <option value="عاجل">عاجل</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="الكل">الكل</option>
              <option value="توصيل">توصيل</option>
              <option value="منتج">منتج</option>
              <option value="دفع">دفع</option>
              <option value="تطبيق">تطبيق</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2">
              <Filter className="h-4 w-4" />
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">قائمة الشكاوى ({filteredComplaints.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموضوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الأولوية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الفئة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium ml-3">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{complaint.customerName}</div>
                        <div className="text-sm text-gray-500">{complaint.customerPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{complaint.subject}</div>
                      <div className="text-sm text-gray-500">{complaint.message.substring(0, 50)}...</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(complaint.category)}`}>
                      {complaint.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{complaint.createdAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye size={16} />
                      </button>
                      {permissions.can_process_complaints && (
                        <button className="text-green-600 hover:text-green-900">
                          <Edit size={16} />
                        </button>
                      )}
                      {permissions.can_process_complaints && (
                        <button className="text-purple-600 hover:text-purple-900">
                          <MessageSquare size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredComplaints.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد شكاوى</h3>
          <p className="text-gray-600">لم يتم العثور على شكاوى تطابق معايير البحث</p>
        </div>
      )}

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-xl rounded-xl bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">تفاصيل الشكوى #{selectedComplaint.id}</h3>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">معلومات العميل</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>الاسم:</strong> {selectedComplaint.customerName}</p>
                    <p><strong>الهاتف:</strong> {selectedComplaint.customerPhone}</p>
                    <p><strong>البريد الإلكتروني:</strong> {selectedComplaint.customerEmail}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">معلومات الشكوى</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>الموضوع:</strong> {selectedComplaint.subject}</p>
                    <p><strong>الحالة:</strong> 
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mr-2 ${getStatusColor(selectedComplaint.status)}`}>
                        {selectedComplaint.status}
                      </span>
                    </p>
                    <p><strong>الأولوية:</strong> 
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mr-2 ${getPriorityColor(selectedComplaint.priority)}`}>
                        {selectedComplaint.priority}
                      </span>
                    </p>
                    <p><strong>الفئة:</strong> 
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mr-2 ${getCategoryColor(selectedComplaint.category)}`}>
                        {selectedComplaint.category}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">الرسالة</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{selectedComplaint.message}</p>
                </div>
              </div>
              
              {selectedComplaint.rating && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">تقييم الحل</h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={`rating-star-${selectedComplaint.id || 'unknown'}-${i}`}
                        className={`h-5 w-5 ${i < selectedComplaint.rating! ? 'text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-600 mr-2">{selectedComplaint.rating}/5</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إغلاق
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-colors">
                  الرد على العميل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 