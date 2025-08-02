"use client";

import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { databaseService, storageService } from "../../lib/database-services";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search,
  Filter,
  MoreVertical,
  PackagePlus,
  TrendingUp,
  TrendingDown,
  Star,
  ShoppingCart,
  DollarSign,
  Image as ImageIcon,
  Download,
  Upload,
  RefreshCw,
  Bell,
  X,
  Grid3X3,
  List,
  SortAsc,
  Calendar,
  Users,
  Zap,
  Shield,
  AlertCircle,
  Loader2
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  merchant_id?: string;
  image_url?: string;
  status: string;
  total_sold: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export default function ProductsManagement() {
  const { permissions } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("الكل");
  const [filterStatus, setFilterStatus] = useState<string>("الكل");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "مياه طبيعية",
    image_url: "",
    status: "active"
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // جلب المنتجات من قاعدة البيانات
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsData = await databaseService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // إضافة منتج جديد
  const handleAddProduct = async () => {
    try {
      setUploadingImage(true);
      
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        image_url: newProduct.image_url || "/icon/iconApp.png",
        status: newProduct.status,
        total_sold: 0,
        rating: 0,
        imageFile: selectedImageFile || undefined
      };

      const newProductData = await databaseService.addProduct(productData);
      
      if (newProductData) {
        setProducts(prev => [...prev, newProductData]);
        setShowAddModal(false);
        setNewProduct({ 
          name: "", 
          description: "", 
          price: "", 
          category: "مياه طبيعية", 
          image_url: "",
          status: "active"
        });
        setImagePreview(null);
        setSelectedImageFile(null);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      // يمكن إضافة إشعار للمستخدم هنا
    } finally {
      setUploadingImage(false);
    }
  };

  // تحديث منتج
  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = await databaseService.updateProduct(id, updates);
      
      if (updatedProduct) {
        setProducts(prev => prev.map(product => 
          product.id === id ? { ...product, ...updates } : product
        ));
        setShowEditModal(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      // يمكن إضافة إشعار للمستخدم هنا
    }
  };

  // حذف منتج
  const handleDeleteProduct = async (id: string) => {
    try {
      const success = await databaseService.deleteProduct(id);
      
      if (success) {
        setProducts(prev => prev.filter(product => product.id !== id));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      // يمكن إضافة إشعار للمستخدم هنا
    }
  };

  // تبديل حالة المنتج
  const toggleProductStatus = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStatus = product.status === "active" ? "inactive" : "active";
    await handleUpdateProduct(productId, { status: newStatus });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة صالح');
        return;
      }
      
      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الملف يجب أن يكون أقل من 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setSelectedImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "الكل" || product.category === filterCategory;
    const matchesStatus = filterStatus === "الكل" || product.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case "name":
        aValue = a.name;
        bValue = b.name;
        break;
      case "price":
        aValue = a.price;
        bValue = b.price;
        break;
      case "rating":
        aValue = a.rating;
        bValue = b.rating;
        break;
      case "total_sold":
        aValue = a.total_sold;
        bValue = b.total_sold;
        break;
      case "created_at":
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "inactive": return "bg-red-100 text-red-800 border-red-200";
      case "draft": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "متوفر";
      case "inactive": return "غير متوفر";
      case "draft": return "مسودة";
      default: return status;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "مياه طبيعية": return "bg-blue-100 text-blue-800 border-blue-200";
      case "مياه معدنية": return "bg-purple-100 text-purple-800 border-purple-200";
      case "مياه فوارة": return "bg-pink-100 text-pink-800 border-pink-200";
      case "مياه منكهة": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const stats = [
    { 
      title: "إجمالي المنتجات", 
      value: products.length, 
      change: "+15%", 
      icon: Package, 
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    { 
      title: "المنتجات المتوفرة", 
      value: products.filter(p => p.status === "active").length, 
      change: "+8%", 
      icon: ShoppingCart, 
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    { 
      title: "إجمالي المبيعات", 
      value: products.reduce((acc, p) => acc + p.total_sold, 0), 
      change: "+12%", 
      icon: TrendingUp, 
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    { 
      title: "متوسط التقييم", 
      value: products.length > 0 ? (products.reduce((acc, p) => acc + p.rating, 0) / products.length).toFixed(1) + "/5" : "0/5", 
      change: "+0.2", 
      icon: Star, 
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600"
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">جاري تحميل المنتجات...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة عرض المنتجات</h1>
            <p className="text-gray-600">إدارة جميع المنتجات وعرضها في النظام</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              تصدير البيانات
            </button>
            <button className="btn-secondary">
              <Upload className="h-4 w-4" />
              استيراد البيانات
            </button>
            <button 
              onClick={fetchProducts}
              className="btn-secondary"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث
            </button>
            <div className="flex items-center gap-3">
              {permissions.can_add_products ? (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  إضافة منتج جديد
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
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
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
            <label className="form-label">البحث في المنتجات</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث بالاسم أو الوصف..."
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
              <option value="active">متوفر</option>
              <option value="inactive">غير متوفر</option>
              <option value="draft">مسودة</option>
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
              <option value="price">السعر</option>
              <option value="rating">التقييم</option>
              <option value="total_sold">المبيعات</option>
              <option value="created_at">تاريخ الإضافة</option>
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
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === "list" 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Products Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card group">
              <div className="product-image-container">
                <img 
                  src={product.image_url || "/icon/iconApp.png"} 
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/icon/iconApp.png";
                  }}
                />
                <div className="product-overlay">
                  <div className="flex items-center gap-2">
                    <span className={`product-status ${getStatusColor(product.status)}`}>
                      {getStatusText(product.status)}
                    </span>
                    <div className="product-actions">
                      {permissions.can_add_products && (
                        <button 
                          className="action-btn action-btn-edit" 
                          title="تعديل"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => toggleProductStatus(product.id)}
                        className="action-btn action-btn-toggle"
                        title={product.status === "active" ? "إيقاف" : "تفعيل"}
                      >
                        {product.status === "active" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      {permissions.can_add_products && (
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="action-btn action-btn-delete"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="product-content">
                <div className="product-header">
                  <h3 className="product-title">{product.name}</h3>
                  <span className={`product-category ${getCategoryColor(product.category)}`}>
                    {product.category}
                  </span>
                </div>
                
                <p className="product-description">{product.description}</p>
                
                <div className="product-stats">
                  <div className="product-price">
                    <span className="price-current">{product.price} ريال</span>
                  </div>
                  
                  <div className="product-rating">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 ml-1" />
                      <span className="rating-text">{product.rating}/5</span>
                    </div>
                  </div>
                </div>
                
                <div className="product-footer">
                  <div className="sales-info">
                    <ShoppingCart className="h-4 w-4 text-gray-400" />
                    <span className="sales-text">{product.total_sold} مبيعات</span>
                  </div>
                  <div className="date-info">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="date-text">{new Date(product.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <div className="table-header">
            <h3 className="text-lg font-bold text-gray-900">قائمة المنتجات ({filteredProducts.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">المنتج</th>
                  <th className="table-head-cell">الفئة</th>
                  <th className="table-head-cell">السعر</th>
                  <th className="table-head-cell">التقييم</th>
                  <th className="table-head-cell">المبيعات</th>
                  <th className="table-head-cell">الحالة</th>
                  <th className="table-head-cell">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="product-thumbnail">
                          <img 
                            src={product.image_url || "/icon/iconApp.png"} 
                            alt={product.name}
                            className="thumbnail-image"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/icon/iconApp.png";
                            }}
                          />
                        </div>
                        <div className="product-info">
                          <div className="product-name">{product.name}</div>
                          <div className="product-description">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`product-category ${getCategoryColor(product.category)}`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="price-display">
                        <span className="price-current">{product.price} ريال</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="rating-display">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 ml-1" />
                          <span className="rating-text">{product.rating}/5</span>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="sales-display">
                        <ShoppingCart className="h-4 w-4 text-gray-400 ml-1" />
                        <span className="sales-text">{product.total_sold}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`product-status ${getStatusColor(product.status)}`}>
                        {getStatusText(product.status)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="action-buttons">
                        {permissions.can_add_products && (
                          <button 
                            className="action-btn action-btn-edit" 
                            title="تعديل"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleProductStatus(product.id)}
                          className="action-btn action-btn-toggle"
                          title={product.status === "active" ? "إيقاف" : "تفعيل"}
                        >
                          {product.status === "active" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        {permissions.can_add_products && (
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="action-btn action-btn-delete"
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
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
      )}

      {filteredProducts.length === 0 && (
        <div className="empty-state">
          <Package className="empty-state-icon" />
          <h3 className="empty-state-title">لا توجد منتجات</h3>
          <p className="empty-state-description">لم يتم العثور على منتجات تطابق معايير البحث</p>
          {permissions.can_add_products ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary mt-4"
            >
              <Plus className="h-4 w-4" />
              إضافة منتج جديد
            </button>
          ) : (
            <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-gray-100 rounded-lg text-gray-500">
              <Shield className="h-4 w-4" />
              <span className="text-sm">لا تملك صلاحية إضافة منتجات</span>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">إضافة منتج جديد</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="modal-close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="space-y-6">
                {/* Image Upload Section */}
                <div>
                  <label className="form-label">صورة المنتج</label>
                  <div className="image-upload-container">
                    {imagePreview ? (
                      <div className="image-preview-container">
                        <img 
                          src={imagePreview} 
                          alt="معاينة الصورة" 
                          className="image-preview"
                        />
                        <button
                          onClick={() => {
                            setImagePreview(null);
                            setNewProduct({...newProduct, image_url: ""});
                          }}
                          className="remove-image-btn"
                          title="إزالة الصورة"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="upload-success">
                          ✓ تم رفع الصورة بنجاح
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <ImageIcon className="upload-icon" />
                        <div className="upload-text">
                          <p className="upload-title">اسحب الصورة هنا أو اضغط للاختيار</p>
                          <p className="upload-subtitle">يدعم: JPG, PNG, GIF (الحد الأقصى: 5MB)</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="product-image"
                        />
                        <label 
                          htmlFor="product-image" 
                          className="upload-button"
                        >
                          <ImageIcon className="h-4 w-4" />
                          اختيار صورة
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">اسم المنتج</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="form-input"
                      placeholder="أدخل اسم المنتج"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">الفئة</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="form-select"
                    >
                      <option value="مياه طبيعية">مياه طبيعية</option>
                      <option value="مياه معدنية">مياه معدنية</option>
                      <option value="مياه فوارة">مياه فوارة</option>
                      <option value="مياه منكهة">مياه منكهة</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="form-label">وصف المنتج</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="form-textarea"
                    rows={3}
                    placeholder="أدخل وصف المنتج"
                  />
                </div>
                
                <div>
                  <label className="form-label">سعر المنتج (ريال)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="form-input"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddProduct}
                className="btn-primary"
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    إضافة المنتج
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">تعديل المنتج</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">اسم المنتج</label>
                    <input
                      type="text"
                      value={selectedProduct.name}
                      onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                      className="form-input"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">الفئة</label>
                    <select
                      value={selectedProduct.category}
                      onChange={(e) => setSelectedProduct({...selectedProduct, category: e.target.value})}
                      className="form-select"
                    >
                      <option value="مياه طبيعية">مياه طبيعية</option>
                      <option value="مياه معدنية">مياه معدنية</option>
                      <option value="مياه فوارة">مياه فوارة</option>
                      <option value="مياه منكهة">مياه منكهة</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="form-label">وصف المنتج</label>
                  <textarea
                    value={selectedProduct.description}
                    onChange={(e) => setSelectedProduct({...selectedProduct, description: e.target.value})}
                    className="form-textarea"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="form-label">سعر المنتج (ريال)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedProduct.price}
                    onChange={(e) => setSelectedProduct({...selectedProduct, price: parseFloat(e.target.value)})}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleUpdateProduct(selectedProduct.id, {
                  name: selectedProduct.name,
                  description: selectedProduct.description,
                  price: selectedProduct.price,
                  category: selectedProduct.category
                })}
                className="btn-primary"
              >
                <Edit className="h-4 w-4" />
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 