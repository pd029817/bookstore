"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressSearch } from "@/components/ui/address-search";
import { useToast } from "@/components/ui/toast";
import type { Address } from "@/types/database";

interface AddressForm {
  recipient_name: string;
  phone: string;
  zip_code: string;
  address: string;
  address_detail: string;
  is_default: boolean;
}

const emptyForm: AddressForm = {
  recipient_name: "",
  phone: "",
  zip_code: "",
  address: "",
  address_detail: "",
  is_default: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    setLoading(true);
    const res = await fetch("/api/addresses");
    if (res.status === 401) { router.push("/auth/login"); return; }
    const data = await res.json();
    setAddresses(data.addresses || []);
    setLoading(false);
  }

  function openAdd() {
    setEditId(null);
    setForm({ ...emptyForm, is_default: addresses.length === 0 });
    setShowForm(true);
  }

  function openEdit(addr: Address) {
    setEditId(addr.id);
    setForm({
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      zip_code: addr.zip_code,
      address: addr.address,
      address_detail: addr.address_detail || "",
      is_default: addr.is_default,
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.recipient_name || !form.phone || !form.zip_code || !form.address) {
      addToast("필수 항목을 모두 입력해주세요.", "error");
      return;
    }
    setSaving(true);
    const url = editId ? `/api/addresses/${editId}` : "/api/addresses";
    const method = editId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      addToast(editId ? "배송지가 수정되었습니다." : "배송지가 추가되었습니다.", "success");
      setShowForm(false);
      fetchAddresses();
    } else {
      addToast("저장에 실패했습니다.", "error");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("배송지를 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast("배송지가 삭제되었습니다.", "success");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } else {
      addToast("삭제에 실패했습니다.", "error");
    }
  }

  async function handleSetDefault(id: string) {
    const addr = addresses.find((a) => a.id === id)!;
    const res = await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...addr, is_default: true }),
    });
    if (res.ok) {
      addToast("기본 배송지로 설정되었습니다.", "success");
      fetchAddresses();
    }
  }

  return (
    <div className="max-w-[680px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-terracotta" />
          <h1 className="text-2xl font-heading text-charcoal">배송지 관리</h1>
        </div>
        {!showForm && (
          <Button onClick={openAdd} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1" /> 배송지 추가
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-terracotta/30 bg-beige rounded-sm p-6 mb-6">
          <h2 className="text-lg font-heading text-charcoal mb-4">
            {editId ? "배송지 수정" : "새 배송지 추가"}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="recipient_name"
                label="수령인"
                value={form.recipient_name}
                onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                placeholder="홍길동"
                required
              />
              <Input
                id="phone"
                label="연락처"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="010-1234-5678"
                required
              />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  id="zip_code"
                  label="우편번호"
                  value={form.zip_code}
                  readOnly
                  placeholder="주소 검색"
                  required
                />
              </div>
              <AddressSearch
                onSelect={({ zipCode, address }) =>
                  setForm({ ...form, zip_code: zipCode, address })
                }
              />
            </div>
            <Input
              id="address"
              label="주소"
              value={form.address}
              readOnly
              placeholder="주소 검색 후 자동 입력"
              required
            />
            <Input
              id="address_detail"
              label="상세 주소"
              value={form.address_detail}
              onChange={(e) => setForm({ ...form, address_detail: e.target.value })}
              placeholder="아파트 동/호수"
            />
            <label className="flex items-center gap-2 text-sm text-warm-brown cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                className="accent-terracotta"
              />
              기본 배송지로 설정
            </label>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} variant="primary" size="md" loading={saving}>
              저장
            </Button>
            <Button onClick={() => setShowForm(false)} variant="secondary" size="md">
              취소
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="border border-sand bg-beige rounded-sm p-5 animate-pulse-warm">
              <div className="h-4 bg-sand rounded w-1/3 mb-2" />
              <div className="h-3 bg-sand rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 text-warm-brown">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-sand" />
          <p className="mb-1">등록된 배송지가 없어요.</p>
          <p className="text-sm text-warm-brown/60">배송지를 추가해보세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="border border-sand bg-beige rounded-sm p-5 flex justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-charcoal text-sm">{addr.recipient_name}</span>
                  <span className="text-warm-brown/60 text-sm">{addr.phone}</span>
                  {addr.is_default && (
                    <span className="text-xs bg-terracotta/10 text-terracotta px-2 py-0.5 rounded-sm">
                      기본
                    </span>
                  )}
                </div>
                <p className="text-sm text-warm-brown truncate">
                  [{addr.zip_code}] {addr.address} {addr.address_detail}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="p-1.5 text-warm-brown/50 hover:text-terracotta transition-colors"
                    title="기본 배송지로 설정"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => openEdit(addr)}
                  className="p-1.5 text-warm-brown/50 hover:text-charcoal transition-colors"
                  title="수정"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="p-1.5 text-warm-brown/50 hover:text-terracotta transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
