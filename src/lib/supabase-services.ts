import { supabase } from './supabase'
import type {
  User,
  Order,
  Customer,
  Merchant,
  DeliveryCaptain,
  Notification,
  Ad,
  OrderFilters,
  DashboardStats,
  OrderStatusHistory,
  Product,
  Inventory
} from '@/types'

// Auth Service
export const authService = {
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Auth error:', error)
      return null
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return true
    } catch (error) {
      console.error('Sign out error:', error)
      return false
    }
  }
}

// Orders Service
export const ordersService = {
  async getAllOrders(filters?: OrderFilters) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          merchant:merchants(*),
          delivery_captain:delivery_captains(*)
        `)
        .order('created_at', { ascending: false })

      if (filters?.status?.length) {
        query = query.in('status', filters.status)
      }
      
      if (filters?.approval_status?.length) {
        query = query.in('approval_status', filters.approval_status)
      }
      
      if (filters?.payment_method?.length) {
        query = query.in('payment_method', filters.payment_method)
      }
      
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      if (filters?.customer_search) {
        query = query.ilike('customer.name', `%${filters.customer_search}%`)
      }

      if (filters?.order_number) {
        query = query.ilike('order_number', `%${filters.order_number}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Order[]
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  },

  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  },

  async assignDeliveryCaptain(orderId: string, captainId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          delivery_captain_id: captainId,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error assigning delivery captain:', error)
      throw error
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get order counts by status
      const { data: orders } = await supabase
        .from('orders')
        .select('status, total_amount, created_at')

      // Get delivery captains count
      const { count: driversCount } = await supabase
        .from('delivery_captains')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Get customers count
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      const today = new Date().toISOString().split('T')[0]
      const todayOrders = orders?.filter(order => 
        order.created_at.startsWith(today)
      ) || []

      const stats: DashboardStats = {
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
        activeDeliveries: orders?.filter(o => o.status === 'on_the_way').length || 0,
        completedToday: todayOrders.filter(o => o.status === 'delivered').length,
        totalRevenue: orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
        activeDrivers: driversCount || 0,
        totalCustomers: customersCount || 0,
        averageDeliveryTime: 35 // This would need proper calculation
      }

      return stats
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalOrders: 0,
        pendingOrders: 0,
        activeDeliveries: 0,
        completedToday: 0,
        totalRevenue: 0,
        activeDrivers: 0,
        totalCustomers: 0,
        averageDeliveryTime: 0
      }
    }
  }
}

// Delivery Captains Service
export const deliveryCaptainsService = {
  async getAllDeliveryCaptains() {
    try {
      const { data, error } = await supabase
        .from('delivery_captains')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data as DeliveryCaptain[]
    } catch (error) {
      console.error('Error fetching delivery captains:', error)
      return []
    }
  },

  async createDeliveryCaptain(captainData: Partial<DeliveryCaptain>) {
    try {
      const { data, error } = await supabase
        .from('delivery_captains')
        .insert([captainData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating delivery captain:', error)
      throw error
    }
  },

  async updateDeliveryCaptain(captainId: string, updates: Partial<DeliveryCaptain>) {
    try {
      const { data, error } = await supabase
        .from('delivery_captains')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', captainId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating delivery captain:', error)
      throw error
    }
  }
}

// Customers Service
export const customersService = {
  async getAllCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      return data as Customer[]
    } catch (error) {
      console.error('Error fetching customers:', error)
      return []
    }
  },

  async createCustomer(customerData: Partial<Customer>) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }
}

// Merchants Service
export const merchantsService = {
  async getAllMerchants() {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      return data as Merchant[]
    } catch (error) {
      console.error('Error fetching merchants:', error)
      return []
    }
  },

  async createMerchant(merchantData: Partial<Merchant>) {
    try {
      const { data, error } = await supabase
        .from('merchants')
        .insert([merchantData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating merchant:', error)
      throw error
    }
  }
}

// Notifications Service
export const notificationsService = {
  async getAllNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Notification[]
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  },

  async createNotification(notificationData: {
    message: string
    type?: 'info' | 'warning' | 'success' | 'error'
    target_role?: string
    title?: string
  }) {
    try {
      const notification = {
        message: notificationData.message,
        type: notificationData.type || 'info',
        target_role: notificationData.target_role || 'all',
        title: notificationData.title,
        is_read: false,
        is_active: true
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  },

  async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }
}

// Ads Service
export const adsService = {
  async getAllAds() {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      return data as Ad[]
    } catch (error) {
      console.error('Error fetching ads:', error)
      return []
    }
  },

  async createAd(adData: {
    image_url: string
    storage_bucket?: string
    storage_path?: string
    title?: string
    click_url?: string
  }) {
    try {
      const ad = {
        ...adData,
        display_order: 0,
        is_active: true
      }

      const { data, error } = await supabase
        .from('ads')
        .insert([ad])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating ad:', error)
      throw error
    }
  },

  async deleteAd(adId: string) {
    try {
      // Get ad data first to delete image from storage
      const { data: ad } = await supabase
        .from('ads')
        .select('storage_path')
        .eq('id', adId)
        .single()

      // Delete ad record
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId)

      if (error) throw error

      // Delete image from storage if exists
      if (ad?.storage_path) {
        await supabase.storage
          .from('ads')
          .remove([ad.storage_path])
      }

      return true
    } catch (error) {
      console.error('Error deleting ad:', error)
      throw error
    }
  },

  async uploadAdImage(file: File): Promise<{ url: string; path: string }> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `ad-${Date.now()}.${fileExt}`
      const filePath = `ads/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('ads')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('ads')
        .getPublicUrl(filePath)

      return { url: publicUrl, path: filePath }
    } catch (error) {
      console.error('Error uploading ad image:', error)
      throw error
    }
  }
}