"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ProtectedRoute from "./ProtectedRoute";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'admin' | 'employee';
  requiredPermission?: keyof ReturnType<typeof useAuth>['permissions'];
}

export default function Layout({ children, requireAuth = true, requiredRole, requiredPermission }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const content = (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900 text-white' 
          : 'bg-gray-50 text-gray-900'
      }`}>
        {/* Header - Fixed at top */}
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          isMenuOpen={sidebarOpen}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />

        {/* Sidebar - Fixed below header */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content - Below header and sidebar */}
        <main className="pt-16 lg:pt-16 lg:mr-64" role="main">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
  );

  // إذا كانت الصفحة تتطلب مصادقة
  if (requireAuth) {
    return (
      <ProtectedRoute requiredRole={requiredRole} requiredPermission={requiredPermission}>
        {content}
      </ProtectedRoute>
    );
  }

  // إذا كانت الصفحة لا تتطلب مصادقة (مثل صفحة تسجيل الدخول)
  return content;
} 