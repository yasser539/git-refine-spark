"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { 
  Menu,
  X,
  Search,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
  Shield,
  Bell
} from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function Header({ onMenuToggle, isMenuOpen, isDarkMode, toggleTheme }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, permissions } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setTimeout(() => {
      router.push('/login');
    }, 150);
  };

  // دالة لعرض الدور بالعربية
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير النظام';
      case 'employee':
        return 'موظف';
      default:
        return 'مستخدم';
    }
  };

  // إغلاق القوائم عند النقر خارجها
  const handleClickOutside = () => {
    setNotificationsOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 backdrop-blur-md bg-card/80 border-b border-border shadow-lg`}>
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section - Menu Button & Logo */}
        <div className="flex items-center">
          <button
            onClick={onMenuToggle}
            className={`p-1.5 rounded-lg transition-colors lg:hidden focus-ring ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700/60' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center mr-4">
            <div className="relative w-8 h-8 mr-3">
              <Image
                src="/icon/iconApp.png"
                alt="مياه كاندي Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <div>
              <h1 className={`text-lg font-bold transition-colors text-foreground`}>
                لوحة تحكم مياه كاندي
              </h1>
              <p className={`text-xs transition-colors text-muted-foreground`}>
                مرحباً بك في النظام الإداري
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Search, Notifications, User Menu */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
            <Input
              type="text"
              placeholder="البحث..."
              className="pr-9 rounded-xl bg-background/80"
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg transition-colors focus-ring text-muted-foreground hover:text-foreground hover:bg-muted`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`p-1.5 rounded-lg transition-colors relative focus-ring text-muted-foreground hover:text-foreground hover:bg-muted`}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className={`absolute left-0 mt-2 w-80 rounded-lg shadow-lg border py-2 z-50 transition-colors bg-card border-border`}>
                <div className={`px-4 py-2 border-b ${
                  'border-border'
                }`}>
                  <div className={`text-sm font-medium text-foreground`}>
                    الإشعارات
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className={`px-4 py-3 cursor-pointer transition-colors hover:bg-muted`}>
                    <div className={`text-sm font-medium text-foreground`}>
                      طلب جديد
                    </div>
                    <div className={`text-xs text-muted-foreground`}>
                      تم استلام طلب جديد من العميل أحمد محمد
                    </div>
                    <div className="text-xs text-gray-400 mt-1">منذ 5 دقائق</div>
                  </div>
                  <div className={`px-4 py-3 cursor-pointer transition-colors hover:bg-muted`}>
                    <div className={`text-sm font-medium text-foreground`}>
                      تاجر جديد
                    </div>
                    <div className={`text-xs text-muted-foreground`}>
                      تم تسجيل تاجر جديد في انتظار الموافقة
                    </div>
                    <div className="text-xs text-gray-400 mt-1">منذ 10 دقائق</div>
                  </div>
                </div>
                <div className={`px-4 py-2 border-t border-border`}>
                  <button className={`text-sm transition-colors text-primary hover:opacity-90`}>
                    عرض جميع الإشعارات
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center space-x-2 space-x-reverse p-1.5 rounded-lg transition-colors focus-ring hover:bg-muted`}
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.charAt(0) || 'م'}
              </div>
              <div className="hidden md:block text-right">
                <div className={`text-sm font-medium transition-colors text-foreground`}>
                  {user?.name || 'المستخدم'}
                </div>
                <div className={`text-xs transition-colors text-muted-foreground`}>
                  {user?.email || 'user@example.com'}
                </div>
              </div>
              <ChevronDown size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>

            {userMenuOpen && (
              <div className={`absolute left-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-50 transition-colors bg-card border-border`}>
                <div className={`px-4 py-2 border-b border-border`}>
                  <div className={`text-sm font-medium text-foreground`}>
                    {user?.name || 'المستخدم'}
                  </div>
                  <div className={`text-xs text-muted-foreground`}>
                    {user?.email || 'user@example.com'}
                  </div>
                  <div className={`text-xs mt-1 text-muted-foreground`}>
                    الدور: {getRoleDisplay(user?.role || '')}
                  </div>
                  <div className={`text-xs mt-1 text-muted-foreground`}>
                    الصلاحيات: {Object.values(permissions).filter(Boolean).length}/9
                  </div>
                </div>
                <Link href="/profile" className={`flex items-center px-4 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted`}>
                  <User size={16} className="ml-2" />
                  الملف الشخصي
                </Link>
                <Link href="/settings" className={`flex items-center px-4 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted`}>
                  <Settings size={16} className="ml-2" />
                  الإعدادات
                </Link>
                <Link href="/permissions" className={`flex items-center px-4 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted`}>
                  <Shield size={16} className="ml-2" />
                  الصلاحيات ({Object.values(permissions).filter(Boolean).length}/9)
                </Link>
                <div className={`border-t mt-2 pt-2 border-border`}>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleLogout();
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20`}
                  >
                    <LogOut size={16} className="ml-2" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(notificationsOpen || userMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleClickOutside}
        />
      )}
    </header>
  );
} 