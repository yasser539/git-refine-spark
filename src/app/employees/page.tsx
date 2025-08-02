"use client";

import { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
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
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Activity,
  Shield
} from "lucide-react";

export default function DeliveryCaptainsPage() {
  const { permissions } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const employees = [
    {
      id: 1,
      name: "أحمد محمد علي",
      email: "ahmed@candywater.com",
      phone: "+966501234567",
      position: "كابتن توصيل",
      department: "التوصيل",
      status: "نشط",
      joinDate: "2023-01-15",
      avatar: "أ",
      location: "الرياض",
      performance: 95,
      tasks: 12,
      completed: 10
    },
    {
      id: 2,
      name: "سارة أحمد حسن",
      email: "sara@candywater.com",
      phone: "+966502345678",
      position: "كابتن توصيل",
      department: "التوصيل",
      status: "نشط",
      joinDate: "2023-03-20",
      avatar: "س",
      location: "جدة",
      performance: 88,
      tasks: 8,
      completed: 7
    },
    {
      id: 3,
      name: "محمد عبدالله",
      email: "mohammed@candywater.com",
      phone: "+966503456789",
      position: "كابتن توصيل",
      department: "التوصيل",
      status: "نشط",
      joinDate: "2023-02-10",
      avatar: "م",
      location: "الدمام",
      performance: 92,
      tasks: 15,
      completed: 14
    },
    {
      id: 4,
      name: "فاطمة الزهراء",
      email: "fatima@candywater.com",
      phone: "+966504567890",
      position: "كابتن توصيل",
      department: "التوصيل",
      status: "إجازة",
      joinDate: "2023-01-05",
      avatar: "ف",
      location: "الرياض",
      performance: 87,
      tasks: 6,
      completed: 5
    },
    {
      id: 5,
      name: "علي حسن محمد",
      email: "ali@candywater.com",
      phone: "+966505678901",
      position: "كابتن توصيل",
      department: "التوصيل",
      status: "نشط",
      joinDate: "2023-04-12",
      avatar: "ع",
      location: "جدة",
      performance: 90,
      tasks: 10,
      completed: 9
    },
    {
      id: 6,
      name: "نور الهدى",
      email: "noor@candywater.com",
      phone: "+966506789012",
      position: "كابتن توصيل",
      department: "التوصيل",
      status: "نشط",
      joinDate: "2023-05-18",
      avatar: "ن",
      location: "الدمام",
      performance: 85,
      tasks: 9,
      completed: 8
    }
  ];

  const stats = [
    { 
      title: "إجمالي كباتن التوصيل", 
      value: employees.length, 
      change: "+3", 
      icon: Users, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      title: "كباتن التوصيل النشطين", 
      value: employees.filter(e => e.status === "نشط").length, 
      change: "+2", 
      icon: UserCheck, 
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    { 
      title: "في إجازة", 
      value: employees.filter(e => e.status === "إجازة").length, 
      change: "0", 
      icon: UserX, 
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50"
    },
    { 
      title: "متوسط الأداء", 
      value: Math.round(employees.reduce((acc, emp) => acc + emp.performance, 0) / employees.length) + "%", 
      change: "+5%", 
      icon: TrendingUp, 
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
  ];

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2">
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
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في كباتن التوصيل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} />
              تصفية
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "grid" 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              عرض شبكي
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "list" 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              عرض قائمة
            </button>
          </div>
        </div>
      </div>

      {/* Employees Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {employee.avatar}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      employee.status === "نشط" 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {employee.status}
                    </span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{employee.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{employee.position}</p>
                  <p className="text-xs text-gray-500">{employee.department}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail size={14} className="ml-2" />
                    {employee.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone size={14} className="ml-2" />
                    {employee.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={14} className="ml-2" />
                    {employee.location}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">الأداء</span>
                    <span className="font-medium text-gray-900">{employee.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" 
                      style={{ width: `${employee.performance}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">كابتن التوصيل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المنصب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الأداء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium ml-3">
                          {employee.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        employee.status === "نشط" 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">{employee.performance}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" 
                            style={{ width: `${employee.performance}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
} 