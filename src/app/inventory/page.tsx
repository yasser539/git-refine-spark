"use client";

import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { 
  Warehouse, 
  Package, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  RefreshCw,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Truck,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Zap,
  Target,
  ShoppingCart,
  ArrowUpDown,
  Download,
  Upload,
  Shield
} from "lucide-react";

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastUpdated: string;
  status: "متوفر" | "منخفض" | "نفذ";
  supplier: string;
  cost: number;
  location: string;
  reorderPoint: number;
  leadTime: number; // days
  lastOrderDate: string;
  nextOrderDate: string;
  totalValue: number;
  turnoverRate: number; // monthly
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

export default function InventoryManagement() {
  const { inventory, updateInventoryItem, updateStock, getProductById } = useData();
  const { permissions } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("الكل");
  const [filterStatus, setFilterStatus] = useState<string>("الكل");
  const [filterLocation, setFilterLocation] = useState<string>("الكل");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "الكل" || item.category === filterCategory;
    const matchesStatus = filterStatus === "الكل" || item.status === filterStatus;
    const matchesLocation = filterLocation === "الكل" || item.location === filterLocation;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case "name":
        aValue = a.productName;
        bValue = b.productName;
        break;
      case "stock":
        aValue = a.currentStock;
        bValue = b.currentStock;
        break;
      case "value":
        aValue = a.totalValue;
        bValue = b.totalValue;
        break;
      case "turnover":
        aValue = a.turnoverRate;
        bValue = b.turnoverRate;
        break;
      default:
        aValue = a.productName;
        bValue = b.productName;
    }
    
    return aValue > bValue ? 1 : -1;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "متوفر": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "منخفض": return "bg-amber-100 text-amber-800 border-amber-200";
      case "نفذ": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getStockColor = (percentage: number) => {
    if (percentage >= 70) return "bg-emerald-500";
    if (percentage >= 30) return "bg-amber-500";
    return "bg-red-500";
  };

  const handleUpdateStock = (itemId: string, newStock: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      updateStock(item.productId, newStock);
    }
  };

  const addInventoryItem = () => {
    // Implementation for adding new inventory item
    setShowAddModal(false);
  };

  const handleStockAdjustment = (item: InventoryItem, adjustment: number) => {
    const newStock = Math.max(0, item.currentStock + adjustment);
    handleUpdateStock(item.id, newStock);
  };

  const getInventoryStats = () => {
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((acc, item) => acc + item.totalValue, 0);
    const lowStockItems = inventory.filter(item => item.status === "منخفض" || item.status === "نفذ").length;
    const outOfStockItems = inventory.filter(item => item.status === "نفذ").length;
    const averageTurnover = inventory.reduce((acc, item) => acc + item.turnoverRate, 0) / inventory.length;

    return {
      totalItems,
      totalValue: totalValue.toFixed(2),
      lowStockItems,
      outOfStockItems,
      averageTurnover: averageTurnover.toFixed(1)
    };
  };

  const stats = getInventoryStats();

  const inventoryStats = [
    { 
      title: "إجمالي المنتجات", 
      value: stats.totalItems, 
      change: "+2", 
      icon: Package, 
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    { 
      title: "القيمة الإجمالية", 
      value: `${stats.totalValue} ريال`, 
      change: "+12%", 
      icon: DollarSign, 
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    { 
      title: "منتجات منخفضة", 
      value: stats.lowStockItems, 
      change: "-3", 
      icon: AlertTriangle, 
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600"
    },
    { 
      title: "معدل الدوران", 
      value: `${stats.averageTurnover}%`, 
      change: "+5%", 
      icon: TrendingUp, 
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
  ];

  return (
    <Layout>
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المخزون</h1>
            <p className="text-gray-600">إدارة المخزون والمنتجات بشكل متكامل</p>
          </div>
          <div className="flex items-center gap-3">
            {permissions.can_add_products ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4" />
                إضافة منتج للمخزون
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-500">
                <Shield className="h-4 w-4" />
                <span className="text-sm">لا تملك صلاحية إضافة منتجات</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {inventoryStats.map((stat) => (
          <div key={stat.title} className={`stats-card ${stat.bgColor}`}>
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
              <div className={`stats-card-gradient bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Filters and Controls */}
      <div className="filter-container mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="form-label">البحث في المخزون</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث بالاسم أو الفئة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">الفئة</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-select"
            >
              <option value="الكل">جميع الفئات</option>
              <option value="مياه طبيعية">مياه طبيعية</option>
              <option value="مياه معدنية">مياه معدنية</option>
              <option value="مياه فوارة">مياه فوارة</option>
              <option value="مياه منكهة">مياه منكهة</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">الحالة</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
            >
              <option value="الكل">جميع الحالات</option>
              <option value="متوفر">متوفر</option>
              <option value="منخفض">منخفض</option>
              <option value="نفذ">نفذ</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">الموقع</label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="form-select"
            >
              <option value="الكل">جميع المواقع</option>
              <option value="المستودع الرئيسي">المستودع الرئيسي</option>
              <option value="المستودع الفرعي">المستودع الفرعي</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">ترتيب حسب</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
            >
              <option value="name">الاسم</option>
              <option value="stock">المخزون</option>
              <option value="value">القيمة</option>
              <option value="turnover">معدل الدوران</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">عرض</label>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === "grid" 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                شبكة
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === "list" 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                قائمة
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Inventory Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInventory.map((item) => {
            const product = getProductById(item.productId);
            const stockPercentage = getStockPercentage(item.currentStock, item.maxStock);
            
            return (
              <div key={item.id} className="inventory-card">
                <div className="inventory-header">
                  <div className="product-info">
                    <img 
                      src={product?.image || "/icon/iconApp.png"} 
                      alt={item.productName}
                      className="product-thumbnail"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/icon/iconApp.png";
                      }}
                    />
                    <div>
                      <h3 className="product-name">{item.productName}</h3>
                      <span className={`product-category ${getStatusColor(item.status)}`}>
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="stock-indicator">
                    <div className={`stock-bar ${getStockColor(stockPercentage)}`} 
                         style={{ width: `${stockPercentage}%` }}></div>
                    <span className="stock-percentage">{stockPercentage}%</span>
                  </div>
                </div>
                
                <div className="inventory-stats">
                  <div className="stat-row">
                    <span className="stat-label">المخزون الحالي</span>
                    <span className="stat-value">{item.currentStock} {item.unit}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">القيمة الإجمالية</span>
                    <span className="stat-value">{item.totalValue} ريال</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">معدل الدوران</span>
                    <span className="stat-value">{item.turnoverRate}%</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">نقطة إعادة الطلب</span>
                    <span className="stat-value">{item.reorderPoint} {item.unit}</span>
                  </div>
                </div>
                
                <div className="inventory-footer">
                  <div className="location-info">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="location-text">{item.location}</span>
                  </div>
                  <div className="action-buttons">
                    {permissions.can_add_products && (
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowStockModal(true);
                        }}
                        className="action-btn action-btn-edit"
                        title="تعديل المخزون"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    {permissions.can_add_products && (
                      <button
                        onClick={() => handleStockAdjustment(item, 10)}
                        className="action-btn action-btn-success"
                        title="إضافة 10 وحدات"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                    {permissions.can_add_products && (
                      <button
                        onClick={() => handleStockAdjustment(item, -5)}
                        className="action-btn action-btn-warning"
                        title="خصم 5 وحدات"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-container">
          <div className="table-header">
            <h3 className="text-lg font-bold text-gray-900">قائمة المخزون ({filteredInventory.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">المنتج</th>
                  <th className="table-head-cell">المخزون</th>
                  <th className="table-head-cell">القيمة</th>
                  <th className="table-head-cell">الحالة</th>
                  <th className="table-head-cell">الموقع</th>
                  <th className="table-head-cell">آخر تحديث</th>
                  <th className="table-head-cell">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="table-body">
                        {filteredInventory.map((item) => {
          const product = getProductById(item.productId);
          const stockPercentage = getStockPercentage(item.currentStock, item.maxStock);
                  
                  return (
                    <tr key={item.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="product-thumbnail">
                            <img 
                              src={product?.image || "/icon/iconApp.png"} 
                              alt={item.productName}
                              className="thumbnail-image"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/icon/iconApp.png";
                              }}
                            />
                          </div>
                          <div className="product-info">
                            <div className="product-name">{item.productName}</div>
                            <div className="product-category">{item.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="stock-display">
                          <div className="flex items-center justify-between mb-1">
                            <span className="stock-amount">{item.currentStock} {item.unit}</span>
                            <span className="stock-percentage">{stockPercentage}%</span>
                          </div>
                          <div className="stock-progress">
                            <div 
                              className={`stock-progress-bar ${getStockColor(stockPercentage)}`}
                              style={{ width: `${stockPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="value-display">
                          <span className="value-amount">{item.totalValue} ريال</span>
                          <span className="value-per-unit">{item.cost} ريال/وحدة</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`inventory-status ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="location-display">
                          <MapPin className="h-4 w-4 text-gray-400 ml-1" />
                          <span className="location-text">{item.location}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="date-display">
                          <Clock className="h-4 w-4 text-gray-400 ml-1" />
                          <span className="date-text">{item.lastUpdated}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          {permissions.can_add_products && (
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowStockModal(true);
                              }}
                              className="action-btn action-btn-edit"
                              title="تعديل المخزون"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {permissions.can_add_products && (
                            <button
                              onClick={() => handleStockAdjustment(item, 10)}
                              className="action-btn action-btn-success"
                              title="إضافة 10 وحدات"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          )}
                          {permissions.can_add_products && (
                            <button
                              onClick={() => handleStockAdjustment(item, -5)}
                              className="action-btn action-btn-warning"
                              title="خصم 5 وحدات"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredInventory.length === 0 && (
        <div className="empty-state">
          <Warehouse className="empty-state-icon" />
          <h3 className="empty-state-title">لا توجد منتجات في المخزون</h3>
          <p className="empty-state-description">لم يتم العثور على منتجات تطابق معايير البحث</p>
          {permissions.canAddProducts ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary mt-4"
            >
              <Plus className="h-4 w-4" />
              إضافة منتج للمخزون
            </button>
          ) : (
            <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-gray-100 rounded-lg text-gray-500">
              <Shield className="h-4 w-4" />
              <span className="text-sm">لا تملك صلاحية إضافة منتجات</span>
            </div>
          )}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">تعديل مخزون {selectedItem.productName}</h3>
              <button
                onClick={() => setShowStockModal(false)}
                className="modal-close"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="space-y-6">
                <div className="current-stock-info">
                  <h4 className="text-lg font-semibold mb-4">المخزون الحالي</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="stat-card">
                      <span className="stat-label">المخزون الحالي</span>
                      <span className="stat-value">{selectedItem.currentStock} {selectedItem.unit}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">القيمة الإجمالية</span>
                      <span className="stat-value">{selectedItem.totalValue} ريال</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">نقطة إعادة الطلب</span>
                      <span className="stat-value">{selectedItem.reorderPoint} {selectedItem.unit}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">الحد الأقصى</span>
                      <span className="stat-value">{selectedItem.maxStock} {selectedItem.unit}</span>
                    </div>
                  </div>
                </div>
                
                <div className="stock-adjustment">
                  <h4 className="text-lg font-semibold mb-4">تعديل المخزون</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleStockAdjustment(selectedItem, 10)}
                      className="adjustment-btn adjustment-btn-add"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة 10 وحدات
                    </button>
                    <button
                      onClick={() => handleStockAdjustment(selectedItem, 50)}
                      className="adjustment-btn adjustment-btn-add"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة 50 وحدة
                    </button>
                    <button
                      onClick={() => handleStockAdjustment(selectedItem, 100)}
                      className="adjustment-btn adjustment-btn-add"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة 100 وحدة
                    </button>
                    <button
                      onClick={() => handleStockAdjustment(selectedItem, -5)}
                      className="adjustment-btn adjustment-btn-remove"
                    >
                      <Minus className="h-4 w-4" />
                      خصم 5 وحدات
                    </button>
                    <button
                      onClick={() => handleStockAdjustment(selectedItem, -10)}
                      className="adjustment-btn adjustment-btn-remove"
                    >
                      <Minus className="h-4 w-4" />
                      خصم 10 وحدات
                    </button>
                    <button
                      onClick={() => updateStock(selectedItem.id, 0)}
                      className="adjustment-btn adjustment-btn-clear"
                    >
                      <XCircle className="h-4 w-4" />
                      تفريغ المخزون
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowStockModal(false)}
                className="btn-secondary"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 