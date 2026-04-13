// ===== Price Formatting =====

export function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR") + "원";
}

export function formatDiscount(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100);
}

// ===== Personal Data Masking =====

/** 이메일: 앞 3자리 노출 후 @ 앞까지 마스킹 (예: tes***@gmail.com) */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visible = local.slice(0, 3);
  const masked = "*".repeat(Math.max(local.length - 3, 0));
  return `${visible}${masked}@${domain}`;
}

/** 휴대폰 번호: 가운데 4자리 마스킹 (예: 010-****-5678) */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return "***";
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

/** 이름: 첫 글자와 마지막 글자만 노출 (예: 홍*동, 김*) */
export function maskName(name: string): string {
  if (name.length <= 1) return name;
  if (name.length === 2) return `${name[0]}*`;
  return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}`;
}

/** 주소: 시/구까지만 노출 (예: 서울시 강남구 ***) */
export function maskAddress(address: string): string {
  // Match up to 시/구/군 level
  const match = address.match(
    /^(.+?(?:특별시|광역시|시|도)\s*.+?(?:시|구|군))/
  );
  if (match) return `${match[1]} ***`;
  // Fallback: show first 6 chars
  return `${address.slice(0, 6)}***`;
}

/** 카드번호: 앞 4자리 + 뒤 4자리만 노출 (예: 1234-****-****-5678) */
export function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 8) return "****-****-****-****";
  return `${digits.slice(0, 4)}-****-****-${digits.slice(-4)}`;
}

// ===== Date Formatting =====

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ===== Misc =====

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}
