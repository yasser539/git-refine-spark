"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  status: "متوفر" | "غير متوفر" | "منخفض";
  rating: number;
  reviews: number;
  sales: number;
  createdAt: string;
}

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
  leadTime: number;
  lastOrderDate: string;
  nextOrderDate: string;
  totalValue: number;
  turnoverRate: number;
}

interface DataContextType {
  products: Product[];
  inventory: InventoryItem[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'totalValue'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  updateStock: (productId: string, newStock: number) => void;
  getProductById: (id: string) => Product | undefined;
  getInventoryByProductId: (productId: string) => InventoryItem | undefined;
  syncProductWithInventory: (productId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "مياه طبيعية",
      description: "مياه طبيعية نقية من الينابيع الجبلية",
      price: 2.50,
      originalPrice: 3.00,
      category: "مياه طبيعية",
      image: "/icon/iconApp.png",
      status: "متوفر",
      rating: 4.8,
      reviews: 124,
      sales: 450,
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "مياه معدنية",
      description: "مياه معدنية غنية بالمعادن الطبيعية",
      price: 3.20,
      category: "مياه معدنية",
      image: "/icon/iconApp.png",
      status: "متوفر",
      rating: 4.6,
      reviews: 98,
      sales: 320,
      createdAt: "2024-01-10"
    },
    {
      id: "3",
      name: "مياه فوارة",
      description: "مياه فوارة منعشة بنكهة الليمون",
      price: 4.00,
      category: "مياه فوارة",
      image: "/icon/iconApp.png",
      status: "منخفض",
      rating: 4.4,
      reviews: 67,
      sales: 180,
      createdAt: "2024-01-05"
    },
    {
      id: "4",
      name: "مياه نكهة الليمون",
      description: "مياه منكهة بنكهة الليمون الطبيعية",
      price: 3.80,
      category: "مياه منكهة",
      image: "/icon/iconApp.png",
      status: "متوفر",
      rating: 4.7,
      reviews: 89,
      sales: 280,
      createdAt: "2024-01-08"
    },
    {
      id: "5",
      name: "مياه نكهة البرتقال",
      description: "مياه منكهة بنكهة البرتقال الطبيعية",
      price: 3.80,
      category: "مياه منكهة",
      image: "/icon/iconApp.png",
      status: "متوفر",
      rating: 4.5,
      reviews: 76,
      sales: 220,
      createdAt: "2024-01-12"
    },
    {
      id: "6",
      name: "مياه نكهة النعناع",
      description: "مياه منكهة بنكهة النعناع المنعشة",
      price: 3.80,
      category: "مياه منكهة",
      image: "/icon/iconApp.png",
      status: "منخفض",
      rating: 4.3,
      reviews: 45,
      sales: 150,
      createdAt: "2024-01-18"
    }
  ]);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: "1",
      productId: "1",
      productName: "مياه طبيعية",
      category: "مياه طبيعية",
      currentStock: 150,
      minStock: 50,
      maxStock: 500,
      unit: "زجاجة",
      lastUpdated: "2024-01-20 14:30",
      status: "متوفر",
      supplier: "شركة المياه الوطنية",
      cost: 2.50,
      location: "المستودع الرئيسي",
      reorderPoint: 100,
      leadTime: 3,
      lastOrderDate: "2024-01-15",
      nextOrderDate: "2024-01-25",
      totalValue: 375,
      turnoverRate: 85
    },
    {
      id: "2",
      productId: "2",
      productName: "مياه معدنية",
      category: "مياه معدنية",
      currentStock: 89,
      minStock: 30,
      maxStock: 300,
      unit: "زجاجة",
      lastUpdated: "2024-01-20 13:45",
      status: "متوفر",
      supplier: "شركة المياه المعدنية",
      cost: 3.20,
      location: "المستودع الرئيسي",
      reorderPoint: 80,
      leadTime: 2,
      lastOrderDate: "2024-01-18",
      nextOrderDate: "2024-01-22",
      totalValue: 284.8,
      turnoverRate: 92
    },
    {
      id: "3",
      productId: "3",
      productName: "مياه فوارة",
      category: "مياه فوارة",
      currentStock: 0,
      minStock: 20,
      maxStock: 200,
      unit: "زجاجة",
      lastUpdated: "2024-01-20 12:15",
      status: "نفذ",
      supplier: "شركة المياه الغازية",
      cost: 4.00,
      location: "المستودع الفرعي",
      reorderPoint: 40,
      leadTime: 5,
      lastOrderDate: "2024-01-10",
      nextOrderDate: "2024-01-25",
      totalValue: 0,
      turnoverRate: 78
    },
    {
      id: "4",
      productId: "4",
      productName: "مياه نكهة الليمون",
      category: "مياه منكهة",
      currentStock: 15,
      minStock: 25,
      maxStock: 150,
      unit: "زجاجة",
      lastUpdated: "2024-01-20 11:30",
      status: "منخفض",
      supplier: "شركة النكهات الطبيعية",
      cost: 3.80,
      location: "المستودع الرئيسي",
      reorderPoint: 30,
      leadTime: 4,
      lastOrderDate: "2024-01-12",
      nextOrderDate: "2024-01-24",
      totalValue: 57,
      turnoverRate: 65
    },
    {
      id: "5",
      productId: "5",
      productName: "مياه نكهة البرتقال",
      category: "مياه منكهة",
      currentStock: 45,
      minStock: 20,
      maxStock: 120,
      unit: "زجاجة",
      lastUpdated: "2024-01-20 10:15",
      status: "متوفر",
      supplier: "شركة النكهات الطبيعية",
      cost: 3.80,
      location: "المستودع الفرعي",
      reorderPoint: 25,
      leadTime: 3,
      lastOrderDate: "2024-01-16",
      nextOrderDate: "2024-01-23",
      totalValue: 171,
      turnoverRate: 88
    },
    {
      id: "6",
      productId: "6",
      productName: "مياه نكهة النعناع",
      category: "مياه منكهة",
      currentStock: 8,
      minStock: 15,
      maxStock: 100,
      unit: "زجاجة",
      lastUpdated: "2024-01-20 09:45",
      status: "منخفض",
      supplier: "شركة النكهات الطبيعية",
      cost: 3.80,
      location: "المستودع الفرعي",
      reorderPoint: 20,
      leadTime: 4,
      lastOrderDate: "2024-01-14",
      nextOrderDate: "2024-01-24",
      totalValue: 30.4,
      turnoverRate: 72
    }
  ]);

  // Helper function to determine product status based on inventory
  const getProductStatusFromInventory = (currentStock: number, minStock: number): "متوفر" | "غير متوفر" | "منخفض" => {
    if (currentStock === 0) return "غير متوفر";
    if (currentStock <= minStock) return "منخفض";
    return "متوفر";
  };

  // Helper function to determine inventory status
  const getInventoryStatus = (currentStock: number, minStock: number): "متوفر" | "منخفض" | "نفذ" => {
    if (currentStock === 0) return "نفذ";
    if (currentStock <= minStock) return "منخفض";
    return "متوفر";
  };

  // Add product and automatically create inventory item
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProducts(prev => [...prev, newProduct]);

    // Automatically create inventory item for the new product
    const newInventoryItem: InventoryItem = {
      id: `inv_${newProduct.id}`,
      productId: newProduct.id,
      productName: newProduct.name,
      category: newProduct.category,
      currentStock: 0,
      minStock: 20,
      maxStock: 200,
      unit: "زجاجة",
      lastUpdated: new Date().toLocaleString('ar-SA'),
      status: "نفذ",
      supplier: "مورد افتراضي",
      cost: newProduct.price * 0.7, // 70% of selling price as cost
      location: "المستودع الرئيسي",
      reorderPoint: 30,
      leadTime: 3,
      lastOrderDate: new Date().toISOString().split('T')[0],
      nextOrderDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalValue: 0,
      turnoverRate: 0
    };

    setInventory(prev => [...prev, newInventoryItem]);
  };

  // Update product and sync with inventory
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, ...updates } : product
    ));

    // Update corresponding inventory item
    const product = products.find(p => p.id === id);
    if (product) {
      setInventory(prev => prev.map(item => 
        item.productId === id ? {
          ...item,
          productName: updates.name || item.productName,
          category: updates.category || item.category
        } : item
      ));
    }
  };

  // Delete product and automatically delete inventory item
  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    setInventory(prev => prev.filter(item => item.productId !== id));
  };

  // Add inventory item
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastUpdated' | 'totalValue'>) => {
    const newInventoryItem: InventoryItem = {
      ...itemData,
      id: `inv_${itemData.productId}`,
      lastUpdated: new Date().toLocaleString('ar-SA'),
      totalValue: itemData.currentStock * itemData.cost
    };

    setInventory(prev => [...prev, newInventoryItem]);
  };

  // Update inventory item and sync with product status
  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        const newStatus = getInventoryStatus(updatedItem.currentStock, updatedItem.minStock);
        const newTotalValue = updatedItem.currentStock * updatedItem.cost;
        
        return {
          ...updatedItem,
          status: newStatus,
          totalValue: newTotalValue,
          lastUpdated: new Date().toLocaleString('ar-SA')
        };
      }
      return item;
    }));

    // Sync product status based on inventory
    const inventoryItem = inventory.find(item => item.id === id);
    if (inventoryItem) {
      const newProductStatus = getProductStatusFromInventory(
        updates.currentStock ?? inventoryItem.currentStock,
        updates.minStock ?? inventoryItem.minStock
      );
      
      updateProduct(inventoryItem.productId, { status: newProductStatus });
    }
  };

  // Delete inventory item
  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  // Update stock and sync with product status
  const updateStock = (productId: string, newStock: number) => {
    setInventory(prev => prev.map(item => {
      if (item.productId === productId) {
        const newStatus = getInventoryStatus(newStock, item.minStock);
        const newTotalValue = newStock * item.cost;
        
        return {
          ...item,
          currentStock: newStock,
          status: newStatus,
          totalValue: newTotalValue,
          lastUpdated: new Date().toLocaleString('ar-SA')
        };
      }
      return item;
    }));

    // Sync product status
    const inventoryItem = inventory.find(item => item.productId === productId);
    if (inventoryItem) {
      const newProductStatus = getProductStatusFromInventory(newStock, inventoryItem.minStock);
      updateProduct(productId, { status: newProductStatus });
    }
  };

  // Get product by ID
  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  // Get inventory item by product ID
  const getInventoryByProductId = (productId: string) => {
    return inventory.find(item => item.productId === productId);
  };

  // Sync product with inventory
  const syncProductWithInventory = (productId: string) => {
    const inventoryItem = getInventoryByProductId(productId);
    const product = getProductById(productId);
    
    if (inventoryItem && product) {
      const newProductStatus = getProductStatusFromInventory(
        inventoryItem.currentStock,
        inventoryItem.minStock
      );
      
      updateProduct(productId, { status: newProductStatus });
    }
  };

  // Auto-sync product status when inventory changes
  useEffect(() => {
    products.forEach(product => {
      const inventoryItem = getInventoryByProductId(product.id);
      if (inventoryItem) {
        const newStatus = getProductStatusFromInventory(
          inventoryItem.currentStock,
          inventoryItem.minStock
        );
        
        if (newStatus !== product.status) {
          updateProduct(product.id, { status: newStatus });
        }
      }
    });
  }, [inventory]);

  const value: DataContextType = {
    products,
    inventory,
    addProduct,
    updateProduct,
    deleteProduct,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStock,
    getProductById,
    getInventoryByProductId,
    syncProductWithInventory
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}; 