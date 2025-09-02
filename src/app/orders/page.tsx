"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  Shield,
  Check,
  X,
  UserCheck,
  Users,
  ArrowRight,
  UserPlus,
  Phone,
  Mail
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { deliveryCaptainsService } from "@/lib/supabase-services";
import { databaseService } from "@/lib/database-services";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  source?: 'customer' | 'merchant';
  driverName?: string;
  driverPhone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: "قيد المراجعة" | "تم الموافقة وجاري البحث عن موصل" | "قيد الانتظار" | "في الطريق إليك" | "تم التوصيل" | "ملغي";
  paymentMethod: "نقدي" | "بطاقة" | "محفظة إلكترونية";
  createdAt: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  assignedDriverId?: string;
  isVisibleToDrivers: boolean;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: "متاح" | "مشغول" | "غير متاح";
  rating: number;
  totalDeliveries: number;
  currentLocation?: string;
  position?: 'كابتن توصيل' | 'مندوب';
}

export default function OrdersManagement() {
  const pathname = usePathname();
  const isMerchants = pathname?.includes("/orders/merchants");
  const isCustomers = pathname?.includes("/orders/customers");
  const { permissions, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([
    // أمثلة لطلبات التجار لعرض فصل القوائم
    {
      id: "M-ORD-5001",
      customerName: "متجر الندى",
      customerPhone: "+966555001001",
      customerAddress: "سجل تجاري: 123456789 | جدة",
      source: 'merchant',
      items: [
        { name: "توريد كراتين مياه 200 مل", quantity: 20, price: 10.0 },
        { name: "توريد كراتين مياه 600 مل", quantity: 10, price: 14.0 }
      ],
      total: 340.0,
      status: "قيد المراجعة",
      paymentMethod: "محفظة إلكترونية",
      createdAt: "2024-01-20 12:00",
      isVisibleToDrivers: false
    },
    {
      id: "M-ORD-5002",
      customerName: "متجر الصفوة",
      customerPhone: "+966555002002",
      customerAddress: "سجل تجاري: 987654321 | الرياض",
      source: 'merchant',
      items: [
        { name: "توريد كراتين مياه 330 مل", quantity: 15, price: 11.5 }
      ],
      total: 172.5,
      status: "تم الموافقة وجاري البحث عن موصل",
      paymentMethod: "بطاقة",
      createdAt: "2024-01-20 12:15",
      isVisibleToDrivers: true
    },
    {
      id: "ORD-12345",
      customerName: "سارة أحمد",
      customerPhone: "+966501112223",
      customerAddress: "شارع الملك فهد، الرياض",
      source: 'customer',
      driverName: "محمد علي",
      driverPhone: "+966501234567",
      items: [
        { name: "مياه طبيعية", quantity: 2, price: 5.00 },
        { name: "مياه معدنية", quantity: 1, price: 7.50 }
      ],
      total: 17.50,
      status: "قيد الانتظار",
      paymentMethod: "بطاقة",
      createdAt: "2024-01-20 14:30",
      estimatedDelivery: "2024-01-20 15:30",
      assignedDriverId: "driver-001",
      isVisibleToDrivers: false
    },
    {
      id: "ORD-12346",
      customerName: "فاطمة محمد",
      customerPhone: "+966502223334",
      customerAddress: "حي النزهة، الرياض",
      source: 'customer',
      items: [
        { name: "مياه فوارة", quantity: 3, price: 8.00 }
      ],
      total: 24.00,
      status: "قيد المراجعة",
      paymentMethod: "نقدي",
      createdAt: "2024-01-20 14:45",
      isVisibleToDrivers: false
    },
    {
      id: "ORD-12347",
      customerName: "خالد عبدالله",
      customerPhone: "+966503334445",
      customerAddress: "حي الملقا، الرياض",
      source: 'customer',
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
      actualDelivery: "2024-01-20 13:45",
      assignedDriverId: "driver-002",
      isVisibleToDrivers: false
    },
    {
      id: "ORD-12348",
      customerName: "علي محمد",
      customerPhone: "+966504445556",
      customerAddress: "حي العليا، الرياض",
      source: 'customer',
      items: [
        { name: "مياه معدنية", quantity: 2, price: 7.50 },
        { name: "مياه فوارة", quantity: 1, price: 8.00 }
      ],
      total: 23.00,
      status: "تم الموافقة وجاري البحث عن موصل",
      paymentMethod: "بطاقة",
      createdAt: "2024-01-20 12:30",
      isVisibleToDrivers: true
    },
    {
      id: "ORD-12349",
      customerName: "نور الهدى",
      customerPhone: "+966505556667",
      customerAddress: "حي الورود، الرياض",
      source: 'customer',
      driverName: "علي أحمد",
      driverPhone: "+966509876543",
      items: [
        { name: "مياه طبيعية", quantity: 1, price: 5.00 },
        { name: "مياه نكهة البرتقال", quantity: 2, price: 6.50 }
      ],
      total: 18.00,
      status: "في الطريق إليك",
      paymentMethod: "نقدي",
      createdAt: "2024-01-20 15:00",
      estimatedDelivery: "2024-01-20 16:00",
      assignedDriverId: "driver-003",
      isVisibleToDrivers: false
    },
    {
      id: "ORD-12350",
      customerName: "أحمد محمد",
      customerPhone: "+966506667778",
      customerAddress: "حي الملك عبدالله، الرياض",
      source: 'customer',
      items: [
        { name: "مياه معدنية", quantity: 3, price: 7.50 },
        { name: "مياه فوارة", quantity: 1, price: 8.00 }
      ],
      total: 30.50,
      status: "قيد المراجعة",
      paymentMethod: "محفظة إلكترونية",
      createdAt: "2024-01-20 15:15",
      isVisibleToDrivers: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("الكل");
  const [filterPayment, setFilterPayment] = useState<string>("الكل");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignDriverModal, setShowAssignDriverModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);

  // جلب قائمة الكوادر المناسبة: كباتن للعملاء أو مندوبين للتجار
  useEffect(() => {
    let isMounted = true;

    const mapCaptainToDriver = (captain: any): Driver => ({
      id: captain.id,
      name: captain.name,
      phone: captain.phone ?? "",
      email: captain.email ?? "",
      status: captain.status === "نشط" ? "متاح" : captain.status === "إجازة" ? "مشغول" : "غير متاح",
      rating: Number(captain.rating ?? 0),
      totalDeliveries: Number(captain.total_deliveries ?? 0),
      currentLocation: captain.city || captain.region || captain.location || "",
      position: captain.position as ('كابتن توصيل' | 'مندوب')
    });

    const mapEmployeeDelivererToDriver = (emp: any): Driver => ({
      id: emp.id,
      name: emp.name,
      phone: emp.phone ?? "",
      email: emp.email ?? "",
      status: emp.status === "active" ? "متاح" : "غير متاح",
      rating: Number(emp.rating ?? 0),
      totalDeliveries: Number(emp.total_deliveries ?? 0),
      currentLocation: emp.city || emp.region || emp.location || "",
      position: 'كابتن توصيل'
    });

    (async () => {
      try {
        // المحاولة الأولى: جدول delivery_captains
        const captains = await deliveryCaptainsService.getAllDeliveryCaptains();
        if (isMounted && Array.isArray(captains) && captains.length > 0) {
          const mapped = captains.map(mapCaptainToDriver);
          const filteredByRole = isMerchants
            ? mapped.filter(d => d.position === 'مندوب')
            : mapped.filter(d => d.position === 'كابتن توصيل');
          setAvailableDrivers(filteredByRole);
          return;
        }

        // المحاولة الثانية: جدول employees بدور deliverer
        const employees = await databaseService.getDeliveryCaptains();
        if (isMounted && Array.isArray(employees) && employees.length > 0) {
          // موظفو deliverer يُعتبرون كباتن توصيل فقط (لصفحة العملاء)
          const mapped = employees.map(mapEmployeeDelivererToDriver);
          const filtered = isMerchants ? [] : mapped;
          setAvailableDrivers(filtered);
          return;
        }
      } catch (error) {
        console.error('Failed to load delivery captains:', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOrders = orders
    // فلترة حسب نوع الصفحة: التجار أو العملاء
    .filter(order => (isMerchants ? order.source === 'merchant' : isCustomers ? order.source === 'customer' : true))
    .filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerPhone.includes(searchTerm);
    const matchesStatus = filterStatus === "الكل" || order.status === filterStatus;
    const matchesPayment = filterPayment === "الكل" || order.paymentMethod === filterPayment;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // تحديث حالة الطلب (للمدير فقط)
  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        let isVisibleToDrivers = order.isVisibleToDrivers;
        
        // تحديث الرؤية للموصّلين حسب الحالة
        if (newStatus === "تم الموافقة وجاري البحث عن موصل") {
          isVisibleToDrivers = true;
        } else if (newStatus === "قيد الانتظار" || newStatus === "في الطريق إليك" || newStatus === "تم التوصيل") {
          isVisibleToDrivers = false;
        }
        
        return { 
          ...order, 
          status: newStatus,
          isVisibleToDrivers
        };
      }
      return order;
    }));
  };

  // إسناد موصل للطلب
  const assignDriver = (orderId: string, driver: Driver) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            driverName: driver.name, 
            driverPhone: driver.phone, 
            assignedDriverId: driver.id,
            status: "قيد الانتظار",
            isVisibleToDrivers: false
          }
        : order
    ));
    
    setShowAssignDriverModal(false);
    setSelectedOrder(null);
    setSelectedDriver(null);
  };

  // فتح تفاصيل الطلب للمدير
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  // الموافقة على الطلب
  const approveOrder = (orderId: string) => {
    updateOrderStatus(orderId, "تم الموافقة وجاري البحث عن موصل");
    setShowOrderDetailsModal(false);
  };

  // إرجاع الطلب للمراجعة
  const rejectOrder = (orderId: string) => {
    updateOrderStatus(orderId, "قيد المراجعة");
    setShowOrderDetailsModal(false);
  };

  // إلغاء الطلب
  const cancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, "ملغي");
    setShowOrderDetailsModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "قيد المراجعة": return "bg-gray-100 text-gray-800";
      case "تم الموافقة وجاري البحث عن موصل": return "bg-blue-100 text-blue-800";
      case "قيد الانتظار": return "bg-yellow-100 text-yellow-800";
      case "في الطريق إليك": return "bg-orange-100 text-orange-800";
      case "تم التوصيل": return "bg-green-100 text-green-800";
      case "ملغي": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "قيد المراجعة": return <AlertCircle className="h-4 w-4" />;
      case "تم الموافقة وجاري البحث عن موصل": return <Users className="h-4 w-4" />;
      case "قيد الانتظار": return <Clock className="h-4 w-4" />;
      case "في الطريق إليك": return <Truck className="h-4 w-4" />;
      case "تم التوصيل": return <CheckCircle className="h-4 w-4" />;
      case "ملغي": return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
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

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case "متاح": return "bg-green-100 text-green-800";
      case "مشغول": return "bg-yellow-100 text-yellow-800";
      case "غير متاح": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const canUpdateStatus = (order: Order) => {
    // المدير يمكنه تحديث الحالات في المرحلة الأولى والثانية فقط
    return order.status === "قيد المراجعة" || order.status === "تم الموافقة وجاري البحث عن موصل";
  };

  const canAssignDriver = (order: Order) => {
    // المدير يمكنه إسناد موصل للطلبات المتاحة فقط
    return order.status === "تم الموافقة وجاري البحث عن موصل" && !order.assignedDriverId;
  };

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case "قيد المراجعة":
        return [
          { value: "تم الموافقة وجاري البحث عن موصل", label: isMerchants ? "موافقة وإتاحة للمندوبين" : "موافقة وإتاحة للموصّلين", icon: <Users className="h-4 w-4" /> },
          { value: "ملغي", label: "إلغاء الطلب", icon: <XCircle className="h-4 w-4" /> }
        ];
      case "تم الموافقة وجاري البحث عن موصل":
        return [
          { value: "قيد المراجعة", label: "إعادة للمراجعة", icon: <AlertCircle className="h-4 w-4" /> },
          { value: "ملغي", label: "إلغاء الطلب", icon: <XCircle className="h-4 w-4" /> }
        ];
      default:
        return [];
    }
  };

  const stats = [
    { 
      title: isMerchants ? "إجمالي طلبات التجار" : isCustomers ? "إجمالي طلبات العملاء" : "إجمالي الطلبات", 
      value: filteredOrders.length, 
      change: "+12%", 
      icon: ShoppingCart, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      title: "قيد المراجعة", 
      value: orders.filter(o => o.status === "قيد المراجعة").length, 
      change: "+8%", 
      icon: AlertCircle, 
      color: "bg-gradient-to-br from-gray-500 to-gray-600",
      bgColor: "bg-gray-50"
    },
    { 
      title: isMerchants ? "متاحة للمندوبين" : "متاحة للموصّلين", 
      value: orders.filter(o => o.status === "تم الموافقة وجاري البحث عن موصل").length, 
      change: "+5%", 
      icon: Users, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      title: "قيد التوصيل", 
      value: orders.filter(o => o.status === "قيد الانتظار" || o.status === "في الطريق إليك").length, 
      change: "+15%", 
      icon: Truck, 
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    },
    { 
      title: "تم التوصيل", 
      value: orders.filter(o => o.status === "تم التوصيل").length, 
      change: "+20%", 
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isMerchants ? "طلبات التجار" : isCustomers ? "طلبات العملاء" : "إدارة الطلبات"}
            </h1>
            <p className="text-gray-600">
              {isMerchants ? "إدارة طلبات أصحاب المتاجر وكباتن التوصيل" : isCustomers ? "إدارة طلبات العملاء العاديين" : "إدارة جميع الطلبات وحالات التوصيل"}
            </p>
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            طلب جديد
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 ${stat.bgColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
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
                placeholder={isMerchants ? "بحث في طلبات التجار..." : isCustomers ? "بحث في طلبات العملاء..." : "البحث في الطلبات..."}
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
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="تم الموافقة وجاري البحث عن موصل">متاحة للموصّلين</option>
              <option value="قيد الانتظار">قيد الانتظار</option>
              <option value="في الطريق إليك">في الطريق إليك</option>
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموصل</th>
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
                    {order.driverName ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.driverName}</div>
                        <div className="text-sm text-gray-500">{order.driverPhone}</div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <UserCheck className="h-3 w-3 ml-1" />
                          مسند
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">لم يتم الإسناد</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.total} ريال</div>
                    <div className="text-sm text-gray-500">{order.items.length} منتج</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="mr-1">{order.status}</span>
                      </span>
                      {order.isVisibleToDrivers && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mr-2">
                          <Users className="h-3 w-3 ml-1" />
                          مرئي للموصّلين
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentColor(order.paymentMethod)}`}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => openOrderDetails(order)}
                        title="عرض تفاصيل الطلب"
                      >
                        <Eye size={16} />
                      </button>
                      {permissions.can_update_order_status && canUpdateStatus(order) && (
                        <button 
                          className="text-green-600 hover:text-green-900"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowStatusModal(true);
                          }}
                          title="تعديل حالة الطلب"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {permissions.can_modify_employees && canAssignDriver(order) && (
                        <button 
                          className="text-purple-600 hover:text-purple-900"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowAssignDriverModal(true);
                          }}
                          title="إسناد موصل"
                        >
                          <UserCheck size={16} />
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

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">تحديث حالة الطلب</h3>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">الطلب: {selectedOrder.id}</p>
              <p className="text-sm text-gray-600 mb-4">العميل: {selectedOrder.customerName}</p>
              <p className="text-sm text-gray-600 mb-4">الحالة الحالية: 
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)} mr-2`}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="mr-1">{selectedOrder.status}</span>
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-3">اختر الحالة الجديدة:</p>
              {getNextStatusOptions(selectedOrder.status).map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, option.value as Order["status"]);
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                  }}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    {option.icon}
                    <span className="mr-2">{option.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignDriverModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">إسناد موصل للطلب</h3>
              <button
                onClick={() => {
                  setShowAssignDriverModal(false);
                  setSelectedOrder(null);
                  setSelectedDriver(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">تفاصيل الطلب</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">رقم الطلب:</span>
                    <span className="font-medium mr-2">{selectedOrder.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">العميل:</span>
                    <span className="font-medium mr-2">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">العنوان:</span>
                    <span className="font-medium mr-2">{selectedOrder.customerAddress}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">المبلغ:</span>
                    <span className="font-medium mr-2">{selectedOrder.total} ريال</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 mb-3">اختر الموصّل المناسب:</h4>
              
              {availableDrivers
                .filter(driver => driver.status === "متاح")
                .map((driver) => (
                  <div
                    key={driver.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedDriver?.id === driver.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDriver(driver)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-medium ml-3">
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-4">
                            <span className="flex items-center">
                              <Phone className="h-4 w-4 ml-1" />
                              {driver.phone}
                            </span>
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 ml-1" />
                              {driver.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getDriverStatusColor(driver.status)}`}>
                            {driver.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            تقييم: {driver.rating} ⭐
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {driver.totalDeliveries} توصيل
                        </div>
                        <div className="text-sm text-gray-500">
                          {driver.currentLocation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowAssignDriverModal(false);
                  setSelectedOrder(null);
                  setSelectedDriver(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (selectedDriver && selectedOrder) {
                    assignDriver(selectedOrder.id, selectedDriver);
                  }
                }}
                disabled={!selectedDriver}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إسناد الموصّل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تفاصيل الطلب المحسنة للمدير */}
      {showOrderDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">تفاصيل الطلب - {selectedOrder.id}</h3>
                  <p className="text-gray-600">مراجعة شاملة للطلب واتخاذ الإجراء المناسب</p>
                </div>
                <button
                  onClick={() => {
                    setShowOrderDetailsModal(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* معلومات الطلب الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                    <User className="h-5 w-5 ml-2" />
                    معلومات العميل
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الاسم:</span>
                      <span className="font-medium">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الهاتف:</span>
                      <span className="font-medium">{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">العنوان:</span>
                      <span className="font-medium text-right">{selectedOrder.customerAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3 flex items-center">
                    <ShoppingCart className="h-5 w-5 ml-2" />
                    تفاصيل الطلب
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الطلب:</span>
                      <span className="font-medium">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">التاريخ:</span>
                      <span className="font-medium">{selectedOrder.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">طريقة الدفع:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${getPaymentColor(selectedOrder.paymentMethod)}`}>
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحالة الحالية:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* المنتجات المطلوبة */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Package className="h-5 w-5 ml-2" />
                  المنتجات المطلوبة
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={`${selectedOrder.id}-item-${index}`} className="flex justify-between items-center bg-white rounded-lg p-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                          <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">الكمية: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{item.price} ريال</div>
                        <div className="text-sm text-gray-500">المجموع: {item.price * item.quantity} ريال</div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">المجموع الكلي:</span>
                      <span className="text-lg font-bold text-blue-600">{selectedOrder.total} ريال</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* معلومات الموصل (إذا كان مسند) */}
              {selectedOrder.driverName && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-purple-900 mb-3 flex items-center">
                    <UserCheck className="h-5 w-5 ml-2" />
                    معلومات الموصل المسند
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">الاسم:</span>
                      <span className="font-medium mr-2">{selectedOrder.driverName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">الهاتف:</span>
                      <span className="font-medium mr-2">{selectedOrder.driverPhone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* أزرار التحكم للمدير */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">إجراءات المدير</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* زر الموافقة */}
                  {selectedOrder.status === "قيد المراجعة" && (
                    <button
                      onClick={() => approveOrder(selectedOrder.id)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check className="h-5 w-5" />
                      موافقة وإتاحة للموصّلين
                    </button>
                  )}

                  {/* زر الإرجاع للمراجعة */}
                  {selectedOrder.status === "تم الموافقة وجاري البحث عن موصل" && (
                    <button
                      onClick={() => rejectOrder(selectedOrder.id)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      <AlertCircle className="h-5 w-5" />
                      إعادة للمراجعة
                    </button>
                  )}

                  {/* زر إلغاء الطلب */}
                  {(selectedOrder.status === "قيد المراجعة" || selectedOrder.status === "تم الموافقة وجاري البحث عن موصل") && (
                    <button
                      onClick={() => cancelOrder(selectedOrder.id)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <XCircle className="h-5 w-5" />
                      إلغاء الطلب
                    </button>
                  )}

                  {/* زر إسناد موصل */}
                  {selectedOrder.status === "تم الموافقة وجاري البحث عن موصل" && !selectedOrder.assignedDriverId && (
                    <button
                      onClick={() => {
                        setShowOrderDetailsModal(false);
                        setShowAssignDriverModal(true);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <UserPlus className="h-5 w-5" />
                      إسناد موصل
                    </button>
                  )}

                  {/* زر إغلاق */}
                  <button
                    onClick={() => {
                      setShowOrderDetailsModal(false);
                      setSelectedOrder(null);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-5 w-5" />
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 