import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Order {
  id: string;
  customer: string;
  driver: string;
  amount: string;
  status: "pending" | "in_progress" | "delivered" | "cancelled";
  time: string;
}

const orders: Order[] = [
  {
    id: "#1234",
    customer: "أحمد محمد",
    driver: "سعد علي",
    amount: "125 ريال",
    status: "in_progress",
    time: "منذ 10 دقائق"
  },
  {
    id: "#1235",
    customer: "فاطمة أحمد",
    driver: "محمد سالم",
    amount: "89 ريال",
    status: "delivered",
    time: "منذ 25 دقيقة"
  },
  {
    id: "#1236",
    customer: "عبدالله خالد",
    driver: "غير محدد",
    amount: "156 ريال",
    status: "pending",
    time: "منذ 5 دقائق"
  },
  {
    id: "#1237",
    customer: "نورا سعد",
    driver: "يوسف أحمد",
    amount: "78 ريال",
    status: "cancelled",
    time: "منذ ساعة"
  }
];

const statusVariants = {
  pending: { label: "في الانتظار", variant: "secondary" as const },
  in_progress: { label: "قيد التوصيل", variant: "default" as const },
  delivered: { label: "تم التوصيل", variant: "outline" as const },
  cancelled: { label: "ملغي", variant: "destructive" as const }
};

export function RecentOrders() {
  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">الطلبات الأخيرة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{order.id}</span>
                  <Badge variant={statusVariants[order.status].variant}>
                    {statusVariants[order.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  العميل: {order.customer}
                </p>
                <p className="text-sm text-muted-foreground">
                  الموصل: {order.driver}
                </p>
              </div>
              
              <div className="text-left space-y-1">
                <p className="font-semibold">{order.amount}</p>
                <p className="text-xs text-muted-foreground">{order.time}</p>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}