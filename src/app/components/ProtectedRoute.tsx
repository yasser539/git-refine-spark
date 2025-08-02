"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'employee';
  requiredPermission?: keyof ReturnType<typeof useAuth>['permissions'];
}

export default function ProtectedRoute({ children, requiredRole, requiredPermission }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      setTimeout(() => {
        console.log('Executing redirect to login');
        router.push('/login');
      }, 200);
    }
  }, [isAuthenticated, isLoading, router]);

  // التحقق من الصلاحيات
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // التحقق من الدور المطلوب
      if (requiredRole && user.role !== requiredRole) {
        console.log(`User role ${user.role} does not match required role ${requiredRole}`);
        router.push('/');
        return;
      }

      // التحقق من الصلاحية المطلوبة
      if (requiredPermission && !hasPermission(requiredPermission)) {
        console.log(`User does not have permission: ${requiredPermission}`);
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, requiredPermission, hasPermission, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">جاري التحقق من الصلاحيات...</h3>
          <p className="text-gray-600">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // سيتم التوجيه إلى صفحة تسجيل الدخول
  }

  return <>{children}</>;
} 