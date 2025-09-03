"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ProductForContext, InventoryItem } from "@/types";

interface DataContextType {
  products: ProductForContext[];
  inventory: InventoryItem[];
  addProduct: (product: Omit<ProductForContext, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<ProductForContext>) => void;
  deleteProduct: (id: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'totalValue'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  updateStock: (productId: string, newStock: number) => void;
  getProductById: (id: string) => ProductForContext | undefined;
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
  const [products, setProducts] = useState<ProductForContext[]>([
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
      name: "عصير تفاح",
      description: "عصير تفاح طازج 100%",
      price: 5.00,
      originalPrice: 5.50,
      category: "عصائر",
      image: "/images/apple_juice.jpg",
      status: "متوفر",
      rating: 4.5,
      reviews: 95,
      sales: 380,
      createdAt: "2024-01-10"
    },
    {
      id: "3",
      name: "شوكولاتة بالحليب",
      description: "شوكولاتة بالحليب الفاخرة",
      price: 8.00,
      category: "شوكولاتة",
      image: "/images/milk_chocolate.jpg",
      status: "منخفض",
      rating: 4.2,
      reviews: 75,
      sales: 290,
      createdAt: "2024-01-05"
    },
    {
      id: "4",
      name: "قهوة عربية",
      description: "قهوة عربية أصيلة",
      price: 12.00,
      category: "قهوة",
      image: "/images/arabic_coffee.jpg",
      status: "غير متوفر",
      rating: 4.9,
      reviews: 150,
      sales: 520,
      createdAt: "2023-12-28"
    },
    {
      id: "5",
      name: "شاي أخضر",
      description: "شاي أخضر منعش",
      price: 3.50,
      category: "شاي",
      image: "/images/green_tea.jpg",
      status: "متوفر",
      rating: 4.6,
      reviews: 110,
      sales: 410,
      createdAt: "2023-12-20"
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
      productName: "عصير تفاح",
      category: "عصائر",
      currentStock: 80,
      minStock: 30,
      maxStock: 300,
      unit: "عبوة",
      lastUpdated: "2024-01-20 14:30",
      status: "متوفر",
      supplier: "شركة العصائر المتحدة",
      cost: 5.00,
      location: "المستودع الثانوي",
      reorderPoint: 75,
      leadTime: 5,
      lastOrderDate: "2024-01-12",
      nextOrderDate: "2024-01-28",
      totalValue: 400,
      turnoverRate: 70
    },
    {
      id: "3",
      productId: "3",
      productName: "شوكولاتة بالحليب",
      category: "شوكولاتة",
      currentStock: 30,
      minStock: 40,
      maxStock: 200,
      unit: "قطعة",
      lastUpdated: "2024-01-20 14:30",
      status: "منخفض",
      supplier: "شركة الشوكولاتة السويسرية",
      cost: 8.00,
      location: "المستودع الرئيسي",
      reorderPoint: 50,
      leadTime: 7,
      lastOrderDate: "2024-01-08",
      nextOrderDate: "2024-01-22",
      totalValue: 240,
      turnoverRate: 60
    },
    {
      id: "4",
      productId: "4",
      productName: "قهوة عربية",
      category: "قهوة",
      currentStock: 0,
      minStock: 60,
      maxStock: 400,
      unit: "علبة",
      lastUpdated: "2024-01-20 14:30",
      status: "نفذ",
      supplier: "شركة القهوة العربية",
      cost: 12.00,
      location: "المستودع الثانوي",
      reorderPoint: 150,
      leadTime: 10,
      lastOrderDate: "2023-12-25",
      nextOrderDate: "2024-01-25",
      totalValue: 0,
      turnoverRate: 90
    },
    {
      id: "5",
      productId: "5",
      productName: "شاي أخضر",
      category: "شاي",
      currentStock: 120,
      minStock: 40,
      maxStock: 300,
      unit: "كيس",
      lastUpdated: "2024-01-20 14:30",
      status: "متوفر",
      supplier: "شركة الشاي الأخضر",
      cost: 3.50,
      location: "المستودع الرئيسي",
      reorderPoint: 100,
      leadTime: 3,
      lastOrderDate: "2024-01-18",
      nextOrderDate: "2024-01-28",
      totalValue: 420,
      turnoverRate: 75
    }
  ]);

  // Helper functions
  const getProductStatusFromInventory = (currentStock: number, minStock: number): "متوفر" | "غير متوفر" | "منخفض" => {
    if (currentStock === 0) return "غير متوفر";
    if (currentStock <= minStock) return "منخفض";
    return "متوفر";
  };

  const getInventoryStatus = (currentStock: number, minStock: number): "متوفر" | "منخفض" | "نفذ" => {
    if (currentStock === 0) return "نفذ";
    if (currentStock <= minStock) return "منخفض";
    return "متوفر";
  };

  // Functions for managing products and inventory
  const addProduct = (productData: Omit<ProductForContext, 'id' | 'createdAt'>) => {
    const newProduct: ProductForContext = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProducts(prev => [...prev, newProduct]);

    // Auto-create inventory item
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
      cost: newProduct.price * 0.7,
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

  const updateProduct = (id: string, updates: Partial<ProductForContext>) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, ...updates } : product
    ));

    if (updates.name || updates.category) {
      setInventory(prev => prev.map(item => 
        item.productId === id ? {
          ...item,
          productName: updates.name || item.productName,
          category: updates.category || item.category
        } : item
      ));
    }
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    setInventory(prev => prev.filter(item => item.productId !== id));
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastUpdated' | 'totalValue'>) => {
    const newInventoryItem: InventoryItem = {
      ...itemData,
      id: `inv_${itemData.productId}`,
      lastUpdated: new Date().toLocaleString('ar-SA'),
      totalValue: itemData.currentStock * itemData.cost
    };

    setInventory(prev => [...prev, newInventoryItem]);
  };

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

    // Sync product status
    const inventoryItem = inventory.find(item => item.id === id);
    if (inventoryItem) {
      const newProductStatus = getProductStatusFromInventory(
        updates.currentStock ?? inventoryItem.currentStock,
        updates.minStock ?? inventoryItem.minStock
      );
      
      updateProduct(inventoryItem.productId, { status: newProductStatus });
    }
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

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

    const inventoryItem = inventory.find(item => item.productId === productId);
    if (inventoryItem) {
      const newProductStatus = getProductStatusFromInventory(newStock, inventoryItem.minStock);
      updateProduct(productId, { status: newProductStatus });
    }
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  const getInventoryByProductId = (productId: string) => {
    return inventory.find(item => item.productId === productId);
  };

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
