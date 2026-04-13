"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function AdminBookEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const isNew = id === "new";

  const [form, setForm] = useState({
    title: "",
    author: "",
    publisher: "",
    published_date: "",
    isbn: "",
    description: "",
    price: 0,
    discount_price: "",
    stock: 0,
    cover_image_url: "",
    category_id: "",
    page_count: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/admin/books/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.book) {
          setForm({
            ...data.book,
            discount_price: data.book.discount_price?.toString() || "",
            page_count: data.book.page_count?.toString() || "",
            published_date: data.book.published_date || "",
            cover_image_url: data.book.cover_image_url || "",
            category_id: data.book.category_id || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function updateField(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      price: Number(form.price),
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      stock: Number(form.stock),
      page_count: form.page_count ? Number(form.page_count) : null,
      category_id: form.category_id || null,
      cover_image_url: form.cover_image_url || null,
      published_date: form.published_date || null,
    };

    const url = isNew ? "/api/admin/books" : `/api/admin/books/${id}`;
    const method = isNew ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      addToast(isNew ? "도서가 등록되었습니다." : "도서가 수정되었습니다.", "success");
      router.push("/admin/books");
    } else {
      const data = await res.json();
      addToast(data.error || "저장에 실패했습니다.", "error");
    }

    setSaving(false);
  }

  if (loading) {
    return <div className="animate-pulse-warm h-8 bg-sand rounded-sm w-1/3" />;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-heading text-charcoal mb-8">
        {isNew ? "도서 등록" : "도서 수정"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="title"
          label="제목"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          required
        />
        <Input
          id="author"
          label="저자"
          value={form.author}
          onChange={(e) => updateField("author", e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="publisher"
            label="출판사"
            value={form.publisher}
            onChange={(e) => updateField("publisher", e.target.value)}
          />
          <Input
            id="published_date"
            label="출판일"
            type="date"
            value={form.published_date}
            onChange={(e) => updateField("published_date", e.target.value)}
          />
        </div>
        <Input
          id="isbn"
          label="ISBN"
          value={form.isbn}
          onChange={(e) => updateField("isbn", e.target.value)}
        />
        <div>
          <label htmlFor="description" className="block text-sm text-warm-brown mb-1">
            설명
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-sand bg-cream rounded-sm text-charcoal text-sm resize-none focus:outline-none focus:border-terracotta transition-colors"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input
            id="price"
            label="정가 (원)"
            type="number"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            required
          />
          <Input
            id="discount_price"
            label="할인가 (원)"
            type="number"
            value={form.discount_price}
            onChange={(e) => updateField("discount_price", e.target.value)}
          />
          <Input
            id="stock"
            label="재고"
            type="number"
            value={form.stock}
            onChange={(e) => updateField("stock", e.target.value)}
            required
          />
        </div>
        <Input
          id="page_count"
          label="페이지 수"
          type="number"
          value={form.page_count}
          onChange={(e) => updateField("page_count", e.target.value)}
        />
        <Input
          id="cover_image_url"
          label="표지 이미지 URL"
          value={form.cover_image_url}
          onChange={(e) => updateField("cover_image_url", e.target.value)}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => updateField("is_active", e.target.checked)}
            className="accent-terracotta"
          />
          <label htmlFor="is_active" className="text-sm text-warm-brown">
            활성 상태
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" loading={saving}>
            {isNew ? "등록" : "저장"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/books")}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
