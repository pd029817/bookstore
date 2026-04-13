"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, Package, Users, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

interface Stats {
  totalOrders: number;
  totalUsers: number;
  totalBooks: number;
  totalRevenue: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  paid: "결제완료",
  preparing: "배송준비",
  shipping: "배송중",
  delivered: "배송완료",
  cancelled: "취소됨",
  refunded: "환불됨",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-heading text-charcoal">대시보드</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-sand bg-beige rounded-sm p-6 animate-pulse-warm">
              <div className="h-8 bg-sand rounded-sm w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-heading text-charcoal">대시보드</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="총 매출"
          value={formatPrice(stats?.totalRevenue || 0)}
          color="terracotta"
        />
        <StatCard
          icon={Package}
          label="총 주문"
          value={`${stats?.totalOrders || 0}건`}
          color="olive"
        />
        <StatCard
          icon={Users}
          label="총 회원"
          value={`${stats?.totalUsers || 0}명`}
          color="warm-brown"
        />
        <StatCard
          icon={BookOpen}
          label="등록 도서"
          value={`${stats?.totalBooks || 0}권`}
          color="charcoal"
        />
      </div>

      {/* Recent Orders */}
      <div className="border border-sand bg-beige rounded-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading text-charcoal">최근 주문</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-terracotta hover:underline"
          >
            전체 보기
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand text-warm-brown text-left">
                <th className="pb-2 font-medium">주문번호</th>
                <th className="pb-2 font-medium">상태</th>
                <th className="pb-2 font-medium">금액</th>
                <th className="pb-2 font-medium">일시</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-sand/50">
                  <td className="py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-terracotta hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="py-3">
                    <Badge variant="sand">
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-charcoal">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="py-3 text-warm-brown">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="border border-sand bg-beige rounded-sm p-6">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 text-${color}`} />
        <span className="text-sm text-warm-brown">{label}</span>
      </div>
      <p className="text-2xl font-heading text-charcoal">{value}</p>
    </div>
  );
}
