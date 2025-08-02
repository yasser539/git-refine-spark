"use client";

import { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { 
  ShoppingCart, 
  Search,
  Filter,
  Eye,
  Edit,
  Truck,
  Clock,
  DollarSign,
  User,
  Package,
  Calendar,
  MapPin,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield
} from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  driverName?: string;
  driverPhone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: "جديد" | "قيد التوصيل" | "تم التوصيل" | "ملغي";
  paymentMethod: "نقدي" | "بطاقة" | "محفظة إلكترونية";
  createdAt: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

export default function OrdersManagement() {
  const { permissions } = useAuth();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-12345",
      customerName: "سارة أحمد",
      customerPhone: "+966501112223",
      customerAddress: "شارع الملك فهد، الرياض",
      driverName: "محمد علي",
      driverPhone: "+966501234567",
      items: [
        { name: "مياه طبيعية", quantity: 2, price: 5.00 },
        { name: "مياه معدنية", quantity: 1, price: 7.50 }
      ],
      total: 17.50,
      status: "قيد التوصيل",
      paymentMethod: "بطاقة",
      createdAt: "2024-01-20 14:30",
      estimatedDelivery: "2024-01-20 15:30"
    },
    {
      id: "ORD-12346",
      customerName: "فاطمة محمد",
      customerPhone: "+966502223334",
      customerAddress: "حي النزهة، الرياض",
      items: [
        { name: "مياه فوارة", quantity: 3, price: 8.00 }
      ],
      total: 24.00,
      status: "جديد",
      paymentMethod: "نقدي",
      createdAt: "2024-01-20 14:45"
    },
    {
      id: "ORD-12347",
      customerName: "خالد عبدالله",
      customerPhone: "+966503334445",
      customerAddress: "حي الملقا، الرياض",
      driverName: "أحمد حسن",
      driverPhone: "+966507654321",
      items: [
        { name: "مياه نكهة الليمون", quantity: 1, price: 6.50 },
        { name: "مياه طبيعية", quantity: 2, price: 5.00 }
      ],
      total: 16.50,
      status: "تم التوصيل",
      paymentMethod: "محفظة إلكترونية",
      createdAt: "2024-01-20 13:00",
      estimatedDelivery: "2024-01-20 14:00",
      actualDelivery: "2024-01-20 13:45"
    },
    {
      id: "ORD-12348",
      customerName: "علي محمد",
      customerPhone: "+966504445556",
      customerAddress: "حي العليا، الرياض",
      items: [
        { name: "مياه معدنية", quantity: 2, price: 7.50 },
        { name: "مياه فوارة", quantity: 1, price: 8.00 }
      ],
      total: 23.00,
      status: "ملغي",
      paymentMethod: "بطاقة",
      createdAt: "2024-01-20 12:30"
    },
    {
      id: "ORD-12349",
      customerName: "نور الهدى",
      customerPhone: "+966505556667",
      customerAddress: "حي الورود، الرياض",
      driverName: "علي أحمد",
      driverPhone: "+966509876543",
      items: [
        { name: "مياه طبيعية", quantity: 1, price: 5.00 },
        { name: "مياه نكهة البرتقال", quantity: 2, price: 6.50 }
      ],
      total: 18.00,
      status: "قيد التوصيل",
      paymentMethod: "نقدي",
      createdAt: "2024-01-20 15:00",
      estimatedDelivery: "2024-01-20 16:00"
    },
    {
      id: "ORD-12350",
      customerName: "أحمد محمد",
      customerPhone: "+966506667778",
      customerAddress: "حي الملك عبدالله، الرياض",
      items: [
        { name: "مياه معدنية", quantity: 3, price: 7.50 },
        { name: "مياه فوارة", quantity: 1, price: 8.00 }
      ],
      total: 30.50,
      status: "جديد",
      paymentMethod: "محفظة إلكترونية",
      createdAt: "2024-01-20 15:15"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("الكل");
  const [filterPayment, setFilterPayment] = useState<string>("الكل");

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerPhone.includes(searchTerm);
    const matchesStatus = filterStatus === "الكل" || order.status === filterStatus;
    const matchesPayment = filterPayment === "الكل" || order.paymentMethod === filterPayment;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
  };

  const assignDriver = (orderId: string, driverName: string, driverPhone: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, driverName, driverPhone }
        : order
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "جديد": return "bg-blue-100 text-blue-800";
      case "قيد التوصيل": return "bg-yellow-100 text-yellow-800";
      case "تم التوصيل": return "bg-green-100 text-green-800";
      case "ملغي": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentColor = (method: string) => {
    switch (method) {
      case "نقدي": return "bg-green-100 text-green-800";
      case "بطاقة": return "bg-blue-100 text-blue-800";
      case "محفظة إلكترونية": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const stats = [
    { 
      title: "إجمالي الطلبات", 
      value: orders.length, 
      change: "+12%", 
      icon: ShoppingCart, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      title: "الطلبات الجديدة", 
      value: orders.filter(o => o.status === "جديد").length, 
      change: "+8%", 
      icon: AlertCircle, 
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50"
    },
    { 
      title: "قيد التوصيل", 
      value: orders.filter(o => o.status === "قيد التوصيل").length, 
      change: "+5%", 
      icon: Truck, 
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      title: "تم التوصيل", 
      value: orders.filter(o => o.status === "تم التوصيل").length, 
      change: "+15%", 
      icon: CheckCircle, 
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الطلبات</h1>
            <p className="text-gray-600">إدارة جميع الطلبات والتوصيلات</p>
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            طلب جديد
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
                placeholder="البحث في الطلبات..."
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
              <option value="قيد التوصيل">قيد التوصيل</option>
              <option value="تم التوصيل">تم التوصيل</option>
              <option value="ملغي">ملغي</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="الكل">الكل</option>
              <option value="نقدي">نقدي</option>
              <option value="بطاقة">بطاقة</option>
              <option value="محفظة إلكترونية">محفظة إلكترونية</option>
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

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">قائمة الطلبات ({filteredOrders.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الطلب</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">طريقة الدفع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium ml-3">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                        <div className="text-sm text-gray-500">{order.createdAt}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerPhone}</div>
                      <div className="text-sm text-gray-500">{order.customerAddress}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.total} ريال</div>
                    <div className="text-sm text-gray-500">{order.items.length} منتج</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentColor(order.paymentMethod)}`}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye size={16} />
                      </button>
                      {permissions.canUpdateOrderStatus && (
                        <button className="text-green-600 hover:text-green-900">
                          <Edit size={16} />
                        </button>
                      )}
                      {permissions.canUpdateOrderStatus && (
                        <button className="text-purple-600 hover:text-purple-900">
                          <Truck size={16} />
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

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
          <p className="text-gray-600">لم يتم العثور على طلبات تطابق معايير البحث</p>
        </div>
      )}
    </Layout>
  );
} 