"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { loadGoogleMapsAPI } from "../../lib/google-maps-loader";
import { 
  Map, 
  Truck, 
  User, 
  Navigation, 
  Clock, 
  Phone,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  TrendingUp,
  MapPin,
  Users,
  Package,
  X,
  Shield
} from "lucide-react";

// تعريف TypeScript لـ Google Maps
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

// Google Maps API Key - استبدل هذا بمفتاحك الحقيقي
// يمكنك الحصول على مفتاح مجاني من: https://console.cloud.google.com/
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

interface Driver {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  status: "متاح" | "في مهمة" | "غير متاح";
  currentOrder?: string;
  rating: number;
  lastUpdate: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  orderId?: string;
  status: "في انتظار" | "قيد التوصيل" | "تم التوصيل";
  address: string;
}

interface Order {
  id: string;
  customerId: string;
  driverId?: string;
  status: "جديد" | "قيد التوصيل" | "تم التوصيل" | "ملغي";
  items: string[];
  total: number;
  createdAt: string;
}

export default function LiveMap() {
  const { permissions } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDrivers, setShowDrivers] = useState(true);
  const [showCustomers, setShowCustomers] = useState(true);
  const [showOrders, setShowOrders] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 24.7136, lng: 46.6753 });
  const [zoom, setZoom] = useState(13);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // جلب البيانات من قاعدة البيانات
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب الموظفين (كباتن التوصيل)
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('role', 'deliverer')
        .eq('status', 'active');

      if (employeesError) throw employeesError;

      // تحويل بيانات الموظفين إلى تنسيق الخريطة
      const driversData: Driver[] = employeesData.map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        phone: emp.phone,
        lat: emp.lat || 24.7136 + (Math.random() - 0.5) * 0.02, // إحداثيات عشوائية إذا لم تكن موجودة
        lng: emp.lng || 46.6753 + (Math.random() - 0.5) * 0.02,
        status: emp.status === 'active' ? 'متاح' : 'غير متاح',
        currentOrder: emp.current_order_id,
        rating: emp.rating || 4.5,
        lastUpdate: new Date(emp.updated_at).toLocaleString('ar-SA')
      }));

      // جلب العملاء
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true);

      if (customersError) throw customersError;

      // تحويل بيانات العملاء إلى تنسيق الخريطة
      const customersMapData: Customer[] = customersData.map((cust: any) => ({
        id: cust.id,
        name: cust.name,
        phone: cust.phone,
        lat: cust.lat || 24.7136 + (Math.random() - 0.5) * 0.02,
        lng: cust.lng || 46.6753 + (Math.random() - 0.5) * 0.02,
        orderId: cust.current_order_id,
        status: cust.order_status || 'في انتظار',
        address: cust.address
      }));

      // جلب الطلبات
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          customers(name, phone),
          employees(name, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (ordersError) throw ordersError;

      // تحويل بيانات الطلبات إلى تنسيق الخريطة
      const ordersMapData: Order[] = ordersData.map((order: any) => ({
        id: order.id,
        customerId: order.customer_id,
        driverId: order.deliverer_id,
        status: order.status === 'pending' ? 'جديد' : 
                order.status === 'delivering' ? 'قيد التوصيل' : 
                order.status === 'delivered' ? 'تم التوصيل' : 'ملغي',
        items: order.items || [],
        total: order.total_amount,
        createdAt: new Date(order.created_at).toLocaleString('ar-SA')
      }));

      setDrivers(driversData);
      setCustomers(customersMapData);
      setOrders(ordersMapData);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('فشل في جلب البيانات من قاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchData();
  }, []);

  // تحديث البيانات كل 30 ثانية
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // تحميل Google Maps SDK
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        await loadGoogleMapsAPI(GOOGLE_MAPS_API_KEY);
        initializeMap();
      } catch (error) {
        console.error('Error loading Google Maps SDK:', error);
        setMapError("فشل في تحميل Google Maps SDK - يرجى التحقق من الاتصال بالإنترنت ومفتاح API");
      }
    };

    loadGoogleMaps();
  }, []);

  // تهيئة الخريطة
  const initializeMap = () => {
    try {
      if (!mapRef.current) {
        setMapError("عنصر الخريطة غير موجود");
        return;
      }

      if (!window.google || !window.google.maps) {
        setMapError("Google Maps SDK غير محمل");
        return;
      }

      // إنشاء الخريطة
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: mapCenter.lat, lng: mapCenter.lng },
        zoom: zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative'
      });

      mapInstanceRef.current = map;
      setIsMapLoaded(true);

      // إضافة markers
      addMarkers();

    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      setMapError("خطأ في تهيئة الخريطة - يرجى التحقق من مفتاح API");
    }
  };

  // إضافة markers للموصلين والعملاء
  const addMarkers = () => {
    if (!mapInstanceRef.current) return;

    // إزالة markers السابقة
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];

    // إضافة markers للموصلين
    if (showDrivers) {
      drivers.forEach(driver => {
        const marker = createDriverMarker(driver);
        markersRef.current.push(marker);
      });
    }

    // إضافة markers للعملاء
    if (showCustomers) {
      customers.forEach(customer => {
        const marker = createCustomerMarker(customer);
        markersRef.current.push(marker);
      });
    }
  };

  // إنشاء marker للموصل
  const createDriverMarker = (driver: Driver) => {
    const icon = {
      url: createDriverIconSVG(driver.status),
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 20)
    };

    const marker = new window.google.maps.Marker({
      position: { lat: driver.lat, lng: driver.lng },
      map: mapInstanceRef.current,
      icon: icon,
      title: driver.name
    });

    marker.addListener('click', () => {
      setSelectedDriver(driver);
      setSelectedCustomer(null);
    });

    return marker;
  };

  // إنشاء marker للعميل
  const createCustomerMarker = (customer: Customer) => {
    const icon = {
      url: createCustomerIconSVG(customer.status),
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 20)
    };

    const marker = new window.google.maps.Marker({
      position: { lat: customer.lat, lng: customer.lng },
      map: mapInstanceRef.current,
      icon: icon,
      title: customer.name
    });

    marker.addListener('click', () => {
      setSelectedCustomer(customer);
      setSelectedDriver(null);
    });

    return marker;
  };

  // إنشاء SVG icon للموصل
  const createDriverIconSVG = (status: string) => {
    const color = status === 'متاح' ? '#10B981' : status === 'في مهمة' ? '#F59E0B' : '#EF4444';
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="20" y="25" text-anchor="middle" fill="white" font-size="16" font-weight="bold">🚚</text>
      </svg>
    `)}`;
  };

  // إنشاء SVG icon للعميل
  const createCustomerIconSVG = (status: string) => {
    const color = status === 'في انتظار' ? '#3B82F6' : status === 'قيد التوصيل' ? '#F59E0B' : '#10B981';
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="20" y="25" text-anchor="middle" fill="white" font-size="16" font-weight="bold">👤</text>
      </svg>
    `)}`;
  };

  // تحديث markers عند تغيير الإعدادات
  useEffect(() => {
    if (isMapLoaded) {
      addMarkers();
    }
  }, [showDrivers, showCustomers, isMapLoaded]);

  const getDriverIcon = (status: string) => {
    switch (status) {
      case "متاح": return "🟢";
      case "في مهمة": return "🟡";
      case "غير متاح": return "🔴";
      default: return "⚪";
    }
  };

  const getCustomerIcon = (status: string) => {
    switch (status) {
      case "في انتظار": return "🔵";
      case "قيد التوصيل": return "🟡";
      case "تم التوصيل": return "🟢";
      default: return "⚪";
    }
  };

  const stats = [
    { 
      title: "الموصلين النشطين", 
      value: drivers.filter(d => d.status === "متاح").length, 
      change: "+2", 
      icon: Truck, 
      color: "bg-gradient-to-br from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    { 
      title: "الطلبات النشطة", 
      value: orders.filter(o => o.status === "قيد التوصيل").length, 
      change: "+5", 
      icon: Package, 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      title: "العملاء في الانتظار", 
      value: customers.filter(c => c.status === "في انتظار").length, 
      change: "+3", 
      icon: Users, 
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50"
    },
    { 
      title: "متوسط وقت التوصيل", 
      value: "25 دقيقة", 
      change: "-5 دقائق", 
      icon: Clock, 
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    },
  ];

  // معالجة أخطاء جلب البيانات
  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Map className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">خطأ في جلب البيانات</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchData} 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </Layout>
    );
  }

  if (mapError) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Map className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">خطأ في تحميل الخريطة</h3>
          <p className="text-gray-600 mb-4">{mapError}</p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">لحل المشكلة:</p>
            <ul className="text-sm text-gray-500 space-y-2 text-right">
              <li>• تأكد من الاتصال بالإنترنت</li>
              <li>• استبدل YOUR_GOOGLE_MAPS_API_KEY بمفتاح API حقيقي</li>
              <li>• يمكنك الحصول على مفتاح مجاني من <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
              <li>• أو اضغط على "استخدام خريطة تجريبية" للاختبار</li>
            </ul>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              إعادة المحاولة
            </button>
            <button 
              onClick={() => {
                // استخدام خريطة تجريبية بدون API key
                setMapError(null);
                setIsMapLoaded(true);
              }} 
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors mr-2"
            >
              استخدام خريطة تجريبية
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isMapLoaded || loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {!isMapLoaded ? "جاري تحميل الخريطة..." : "جاري جلب البيانات..."}
          </h3>
          <p className="text-gray-600 mb-4">يرجى الانتظار</p>
          <div className="text-sm text-gray-500">
            {!isMapLoaded ? (
              <>
                <p>• جاري تحميل Google Maps SDK</p>
                <p>• قد يستغرق الأمر بضع ثوانٍ</p>
              </>
            ) : (
              <>
                <p>• جاري جلب البيانات من قاعدة البيانات</p>
                <p>• جاري تحميل الموصلين والعملاء والطلبات</p>
              </>
            )}
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الخريطة الحية</h1>
            <p className="text-gray-600">متابعة الموصّلين والعملاء في الوقت الفعلي</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'جاري التحديث...' : 'تحديث'}
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2">
              <Map className="h-4 w-4" />
              إعدادات الخريطة
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
                  <span className="text-sm text-gray-500 mr-1">من الساعة الماضية</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">عناصر الخريطة</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showDrivers}
                onChange={(e) => setShowDrivers(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">الموصلين ({drivers.length})</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showCustomers}
                onChange={(e) => setShowCustomers(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">العملاء ({customers.length})</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOrders}
                onChange={(e) => setShowOrders(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">الطلبات ({orders.length})</span>
            </label>
          </div>
        </div>
        
        {/* معلومات إضافية */}
        <div className="text-sm text-gray-600">
          <p>• تم جلب {drivers.length} موصل، {customers.length} عميل، {orders.length} طلب من قاعدة البيانات</p>
          <p>• البيانات محدثة تلقائياً كل 30 ثانية</p>
          <p>• آخر تحديث: {new Date().toLocaleString('ar-SA')}</p>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div 
            ref={mapRef} 
            style={{ width: "100%", height: "600px" }}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Info Windows */}
      {selectedDriver && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">{selectedDriver.name}</h3>
            <button 
              onClick={() => setSelectedDriver(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{selectedDriver.phone}</p>
            <p className="text-sm text-gray-600">
              الحالة: <span className={`font-medium ${selectedDriver.status === 'متاح' ? 'text-green-600' : selectedDriver.status === 'في مهمة' ? 'text-yellow-600' : 'text-red-600'}`}>
                {selectedDriver.status}
              </span>
            </p>
            <p className="text-sm text-gray-600">التقييم: ⭐ {selectedDriver.rating}</p>
            <p className="text-xs text-gray-500">آخر تحديث: {selectedDriver.lastUpdate}</p>
            {selectedDriver.currentOrder && (
              <p className="text-sm text-blue-600">الطلب الحالي: {selectedDriver.currentOrder}</p>
            )}
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">{selectedCustomer.name}</h3>
            <button 
              onClick={() => setSelectedCustomer(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
            <p className="text-sm text-gray-600">
              الحالة: <span className={`font-medium ${selectedCustomer.status === 'في انتظار' ? 'text-blue-600' : selectedCustomer.status === 'قيد التوصيل' ? 'text-yellow-600' : 'text-green-600'}`}>
                {selectedCustomer.status}
              </span>
            </p>
            <p className="text-sm text-gray-600">{selectedCustomer.address}</p>
            {selectedCustomer.orderId && (
              <p className="text-sm text-blue-600">رقم الطلب: {selectedCustomer.orderId}</p>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">دليل الألوان</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">الموصلين</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">متاح</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">في مهمة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">غير متاح</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">العملاء</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">في انتظار</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">قيد التوصيل</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">تم التوصيل</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">معلومات إضافية</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• انقر على أي علامة لعرض التفاصيل</p>
              <p>• يمكنك إخفاء/إظهار العناصر من الأعلى</p>
              <p>• الخريطة محدثة تلقائياً كل 30 ثانية</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 