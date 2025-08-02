"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogOut, CheckCircle } from 'lucide-react';

export default function LogoutPage() {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // إذا لم يكن المستخدم مسجل دخول، توجيه إلى صفحة تسجيل الدخول
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // تسجيل الخروج فوراً
    logout();
    
    // التوجيه إلى صفحة تسجيل الدخول بعد ثانية
    const timer = setTimeout(() => {
      router.push('/login');
    }, 1000);

    return () => clearTimeout(timer);
  }, [logout, router, isAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">تم تسجيل الخروج بنجاح</h1>
          <p className="text-gray-600 mb-6">شكراً لك على استخدام نظام إدارة المياه</p>
          
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <LogOut className="h-4 w-4" />
            <span className="text-sm">جاري التوجيه إلى صفحة تسجيل الدخول...</span>
          </div>
        </div>
      </div>
    </div>
  );
} 