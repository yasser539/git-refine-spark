"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
  Shield
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
    console.log('Logout button clicked');
    logout();
    console.log('User logged out, redirecting to login');
    setUserMenuOpen(false); // إغلاق القائمة
    setTimeout(() => {
      console.log('Redirecting to login page');
      router.push('/login');
    }, 200);
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
    console.log('Clicking outside, closing dropdowns');
    setNotificationsOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-800 shadow-lg border-b border-gray-700' 
        : 'bg-white shadow-lg border-b border-gray-200'
    }`}>
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section - Menu Button & Logo */}
        <div className="flex items-center">
          <button
            onClick={onMenuToggle}
            className={`p-1.5 rounded-lg transition-colors lg:hidden focus-ring ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
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
                alt="Candy Water Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <div>
              <h1 className={`text-lg font-bold transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                لوحة تحكم Candy Water
              </h1>
              <p className={`text-xs transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                مرحباً بك في النظام الإداري
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Search, Notifications, User Menu */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="البحث..."
              className={`search-input ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500' 
                  : ''
              }`}
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg transition-colors focus-ring ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={`p-1.5 rounded-lg transition-colors relative focus-ring ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className={`absolute left-0 mt-2 w-80 rounded-lg shadow-lg border py-2 z-50 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`px-4 py-2 border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <div className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    الإشعارات
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className={`px-4 py-3 cursor-pointer transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      طلب جديد
                    </div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      تم استلام طلب جديد من العميل أحمد محمد
                    </div>
                    <div className="text-xs text-gray-400 mt-1">منذ 5 دقائق</div>
                  </div>
                  <div className={`px-4 py-3 cursor-pointer transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      تاجر جديد
                    </div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      تم تسجيل تاجر جديد في انتظار الموافقة
                    </div>
                    <div className="text-xs text-gray-400 mt-1">منذ 10 دقائق</div>
                  </div>
                </div>
                <div className={`px-4 py-2 border-t ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <button className={`text-sm transition-colors ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
                  }`}>
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
              className={`flex items-center space-x-2 space-x-reverse p-1.5 rounded-lg transition-colors focus-ring ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.charAt(0) || 'م'}
              </div>
              <div className="hidden md:block text-right">
                <div className={`text-sm font-medium transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.name || 'المستخدم'}
                </div>
                <div className={`text-xs transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {user?.email || 'user@example.com'}
                </div>
              </div>
              <ChevronDown size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>

            {userMenuOpen && (
              <div className={`absolute left-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-50 transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`px-4 py-2 border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <div className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user?.name || 'المستخدم'}
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {user?.email || 'user@example.com'}
                  </div>
                  <div className={`text-xs mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    الدور: {getRoleDisplay(user?.role || '')}
                  </div>
                  <div className={`text-xs mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    الصلاحيات: {Object.values(permissions).filter(Boolean).length}/9
                  </div>
                </div>
                <Link href="/profile" className={`flex items-center px-4 py-2 text-sm transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  <User size={16} className="ml-2" />
                  الملف الشخصي
                </Link>
                <Link href="/settings" className={`flex items-center px-4 py-2 text-sm transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  <Settings size={16} className="ml-2" />
                  الإعدادات
                </Link>
                <Link href="/permissions" className={`flex items-center px-4 py-2 text-sm transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  <Shield size={16} className="ml-2" />
                  الصلاحيات ({Object.values(permissions).filter(Boolean).length}/9)
                </Link>
                <div className={`border-t mt-2 pt-2 ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Logout button clicked, preventing default');
                      handleLogout();
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                      isDarkMode 
                        ? 'text-red-400 hover:bg-red-900/20' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
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