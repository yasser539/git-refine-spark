import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { notificationsService, adsService } from '@/lib/supabase-services'
import { useToast } from '@/hooks/use-toast'
import type { Notification, Ad } from '@/types'
import {
  Plus,
  Bell,
  Image,
  Trash2,
  Calendar,
  Users,
  Upload,
  X
} from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [showAdDialog, setShowAdDialog] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const { toast } = useToast()

  // Notification form
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    target_role: 'all'
  })

  // Ad form
  const [adForm, setAdForm] = useState({
    title: '',
    click_url: '',
    image: null as File | null,
    imagePreview: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [notificationsData, adsData] = await Promise.all([
        notificationsService.getAllNotifications(),
        adsService.getAllAds()
      ])
      setNotifications(notificationsData)
      setAds(adsData)
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل البيانات',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNotification = async () => {
    try {
      if (!notificationForm.message.trim()) {
        toast({
          title: 'خطأ',
          description: 'يرجى إدخال نص الإشعار',
          variant: 'destructive'
        })
        return
      }

      await notificationsService.createNotification(notificationForm)
      setShowNotificationDialog(false)
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        target_role: 'all'
      })
      await loadData()
      
      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء الإشعار'
      })
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في إنشاء الإشعار',
        variant: 'destructive'
      })
    }
  }

  const handleCreateAd = async () => {
    try {
      if (!adForm.image) {
        toast({
          title: 'خطأ',
          description: 'يرجى اختيار صورة للإعلان',
          variant: 'destructive'
        })
        return
      }

      setUploadingImage(true)
      const { url, path } = await adsService.uploadAdImage(adForm.image)
      
      await adsService.createAd({
        title: adForm.title,
        click_url: adForm.click_url,
        image_url: url,
        storage_path: path,
        storage_bucket: 'ads'
      })

      setShowAdDialog(false)
      setAdForm({
        title: '',
        click_url: '',
        image: null,
        imagePreview: ''
      })
      await loadData()

      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء الإعلان'
      })
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في إنشاء الإعلان',
        variant: 'destructive'
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationsService.deleteNotification(id)
      await loadData()
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف الإشعار'
      })
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في حذف الإشعار',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteAd = async (id: string) => {
    try {
      await adsService.deleteAd(id)
      await loadData()
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف الإعلان'
      })
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في حذف الإعلان',
        variant: 'destructive'
      })
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAdForm(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onload = () => {
        setAdForm(prev => ({ ...prev, imagePreview: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const typeLabels = {
    info: 'معلومات',
    warning: 'تحذير',
    success: 'نجاح',
    error: 'خطأ'
  }

  const roleLabels = {
    all: 'الجميع',
    admin: 'المسؤولون',
    employee: 'الموظفون',
    delivery_captain: 'السائقون',
    customer: 'العملاء',
    merchant: 'التجار'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">الإشعارات والإعلانات</h1>
        <p className="text-muted-foreground mt-2">
          إدارة الإشعارات النصية والإعلانات المصورة
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            الإشعارات ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="ads" className="gap-2">
            <Image className="h-4 w-4" />
            الإعلانات ({ads.length})
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">إدارة الإشعارات</h2>
              <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    إشعار جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنشاء إشعار جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">العنوان (اختياري)</label>
                      <Input
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="عنوان الإشعار"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">نص الإشعار</label>
                      <Textarea
                        value={notificationForm.message}
                        onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="اكتب نص الإشعار هنا..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">نوع الإشعار</label>
                      <Select
                        value={notificationForm.type}
                        onValueChange={(value: any) => setNotificationForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(typeLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">الفئة المستهدفة</label>
                      <Select
                        value={notificationForm.target_role}
                        onValueChange={(value) => setNotificationForm(prev => ({ ...prev, target_role: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleCreateNotification} className="flex-1">
                        إنشاء الإشعار
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowNotificationDialog(false)}
                        className="flex-1"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                    </CardContent>
                  </Card>
                ))
              ) : notifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد إشعارات</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notification) => (
                  <Card key={notification.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {notification.title && (
                            <h3 className="font-semibold mb-1">{notification.title}</h3>
                          )}
                          <p className="text-gray-700 mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {roleLabels[notification.target_role as keyof typeof roleLabels]}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(notification.created_at).toLocaleDateString('ar-SA')}
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs ${
                              notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              notification.type === 'success' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {typeLabels[notification.type]}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Ads Tab */}
        <TabsContent value="ads">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">إدارة الإعلانات</h2>
              <Dialog open={showAdDialog} onOpenChange={setShowAdDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    إعلان جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنشاء إعلان جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">عنوان الإعلان (اختياري)</label>
                      <Input
                        value={adForm.title}
                        onChange={(e) => setAdForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="عنوان الإعلان"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">رابط عند النقر (اختياري)</label>
                      <Input
                        value={adForm.click_url}
                        onChange={(e) => setAdForm(prev => ({ ...prev, click_url: e.target.value }))}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">صورة الإعلان</label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="ad-image"
                        />
                        <label
                          htmlFor="ad-image"
                          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                        >
                          {adForm.imagePreview ? (
                            <div className="relative w-full h-full">
                              <img
                                src={adForm.imagePreview}
                                alt="معاينة"
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setAdForm(prev => ({ ...prev, image: null, imagePreview: '' }))
                                }}
                                className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">انقر لرفع الصورة</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleCreateAd} 
                        className="flex-1"
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? 'جاري الرفع...' : 'إنشاء الإعلان'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAdDialog(false)}
                        className="flex-1"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="h-48 bg-muted rounded animate-pulse mb-4" />
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))
              ) : ads.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">لا توجد إعلانات</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                ads.map((ad) => (
                  <Card key={ad.id}>
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <img
                          src={ad.image_url}
                          alt={ad.title || 'إعلان'}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAd(ad.id)}
                          className="absolute top-2 left-2 bg-red-500 text-white hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {ad.title && (
                        <h3 className="font-semibold mb-2">{ad.title}</h3>
                      )}
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(ad.created_at).toLocaleDateString('ar-SA')}
                        </div>
                        {ad.click_url && (
                          <p className="text-blue-600 text-xs truncate">
                            {ad.click_url}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}