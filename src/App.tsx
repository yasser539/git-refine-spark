import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Dashboard from '@/pages/Dashboard'
import OrdersPage from '@/pages/Orders'
import DeliveryPage from '@/pages/Delivery'
import NotificationsPage from '@/pages/Notifications'
import CustomersPage from '@/pages/Customers'
import MerchantsPage from '@/pages/Merchants'
import ProductsPage from '@/pages/Products'
import ReportsPage from '@/pages/Reports'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background" dir="rtl">
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="delivery" element={<DeliveryPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="merchants" element={<MerchantsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App