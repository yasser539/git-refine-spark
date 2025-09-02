"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Map, 
  BarChart3, 
  MessageSquare, 
  Activity,
  Home,
  Shield,
  UserCheck,
  Building,
  LogOut,
  Bell
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  const menuItems = [
    // القسم الأول: العمليات الأساسية (الأولوية العالية)
    { name: "الرئيسية", icon: Home, href: "/", color: "text-blue-600", priority: 1 },
    { name: "طلبات العملاء", icon: ShoppingCart, href: "/orders/customers", color: "text-violet-600", priority: 1 },
    { name: "طلبات التجار", icon: Building, href: "/orders/merchants", color: "text-purple-600", priority: 1 },
    { name: "الخريطة الحية", icon: Map, href: "/live-map", color: "text-blue-600", priority: 1 },
    { name: "الإعلانات والإشعارات", icon: Bell, href: "/notifications", color: "text-orange-600", priority: 1 },

    
    // القسم الثاني: إدارة المستخدمين (الأولوية المتوسطة)
    { name: "إدارة العملاء", icon: Users, href: "/users", color: "text-indigo-600", priority: 2 },
    { name: "إدارة التجار", icon: Building, href: "/merchants", color: "text-purple-600", priority: 2 },
    { name: "إدارة كباتن التوصيل", icon: UserCheck, href: "/delivery-captains", color: "text-purple-600", priority: 2 },
    
    // القسم الثالث: إدارة المنتجات والمخزون (الأولوية المتوسطة)
    { name: "إدارة عرض المنتجات", icon: Package, href: "/products", color: "text-pink-600", priority: 2 },

    
    // القسم الرابع: المراقبة والتقارير (الأولوية المنخفضة)
    { name: "التقارير", icon: BarChart3, href: "/reports", color: "text-indigo-600", priority: 3 },
    { name: "سجل العمليات", icon: Activity, href: "/audit-log", color: "text-pink-600", priority: 3 },
    
    // القسم الخامس: الدعم والمساعدة (الأولوية المنخفضة)
    { name: "الدعم والشكاوى", icon: MessageSquare, href: "/support", color: "text-purple-600", priority: 3 },
    { name: "الصلاحيات", icon: Shield, href: "/permissions", color: "text-green-600", priority: 3 },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}
      
      {/* Sidebar - Fixed on all screens, below header */}
      <aside className={`fixed top-16 right-0 z-40 w-64 h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-900/95 via-indigo-800/95 to-blue-900/95 backdrop-blur-md shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:shadow-none scrollbar-thin rounded-l-2xl`}>
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
            <nav className="flex-1 px-4 space-y-1" role="navigation" aria-label="Main navigation">
              {menuItems.map((item, index) => {
                const isActive = pathname === item.href;
                const showSeparator = index > 0 && menuItems[index - 1].priority !== item.priority;
                
                return (
                  <div key={item.name}>
                    {showSeparator && (
                      <div className="my-3 mx-2 border-t border-blue-700/50"></div>
                    )}
                    <Link
                      href={item.href}
                      className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
                      data-priority={item.priority}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon className={`ml-3 h-5 w-5 ${isActive ? 'text-white' : 'text-blue-300'}`} />
                      {item.name}
                    </Link>
                  </div>
                );
              })}
            </nav>
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-blue-700">
            <div className="flex items-center p-3 bg-blue-800/50 rounded-xl">
              <Shield className="h-5 w-5 text-blue-300 ml-2" />
              <div className="text-xs">
                <div className="font-medium text-white">نظام آمن</div>
                <div className="text-blue-200">محدث تلقائياً</div>
              </div>
            </div>
            
            {/* Logout Button */}
            <div className="mt-3">
              <button onClick={logout} className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-blue-100 hover:bg-blue-700 hover:text-white transition-all duration-200">
                <LogOut className="ml-3 h-5 w-5" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
} 