import type { Address } from "@/types/database";

export const addressFixture: Address = {
  id: "addr-001",
  user_id: "user-001",
  recipient_name: "홍길동",
  phone: "010-1234-5678",
  zip_code: "06236",
  address: "서울특별시 강남구 테헤란로 123",
  address_detail: "101동 202호",
  is_default: true,
  created_at: "2024-01-01T00:00:00.000Z",
};

export const addressFixtureSecond: Address = {
  ...addressFixture,
  id: "addr-002",
  recipient_name: "김철수",
  phone: "010-9876-5432",
  zip_code: "04524",
  address: "서울특별시 중구 세종대로 110",
  address_detail: null,
  is_default: false,
};
