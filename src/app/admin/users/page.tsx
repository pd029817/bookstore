"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDate, maskEmail, maskPhone, maskName } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading text-charcoal">회원 관리</h1>

      <div className="border border-sand bg-beige rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand text-warm-brown text-left bg-cream">
                <th className="px-4 py-3 font-medium">이름</th>
                <th className="px-4 py-3 font-medium">이메일</th>
                <th className="px-4 py-3 font-medium">연락처</th>
                <th className="px-4 py-3 font-medium">역할</th>
                <th className="px-4 py-3 font-medium">가입일</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-warm-brown">
                    불러오는 중...
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-sand/50">
                    <td className="px-4 py-3 text-charcoal">{maskName(user.name)}</td>
                    <td className="px-4 py-3 text-warm-brown">{maskEmail(user.email)}</td>
                    <td className="px-4 py-3 text-warm-brown">
                      {user.phone ? maskPhone(user.phone) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={user.role === "admin" ? "terracotta" : "sand"}
                      >
                        {user.role === "admin" ? "관리자" : "고객"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-warm-brown text-xs">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
