import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { addressFixture, addressFixtureSecond } from "@/test/fixtures/addresses";

const { mockFrom, mockGetUser } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom }),
}));

import { GET, POST } from "@/app/api/addresses/route";

const AUTHED_USER = { id: "user-001", email: "test@test.com" };

function makeQueryBuilder(data: any, error: any = null) {
  const builder: any = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.is = vi.fn(chain);
  builder.order = vi.fn(chain);
  builder.insert = vi.fn(chain);
  builder.update = vi.fn(chain);
  builder.single = vi.fn().mockResolvedValue({ data, error });
  builder.then = (resolve: any) => resolve({ data, error });
  return builder;
}

function makePostRequest(body: object) {
  return new NextRequest("http://localhost:3002/api/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/addresses", () => {
  beforeEach(() => vi.clearAllMocks());

  it("인증된 사용자의 배송지 목록을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });
    mockFrom.mockReturnValue(makeQueryBuilder([addressFixture, addressFixtureSecond]));

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.addresses).toHaveLength(2);
  });

  it("비인증 요청은 401을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe("POST /api/addresses", () => {
  beforeEach(() => vi.clearAllMocks());

  it("필수 항목이 있으면 배송지를 생성한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });
    const builder = makeQueryBuilder(addressFixture);
    mockFrom.mockReturnValue(builder);

    const body = {
      recipient_name: "홍길동",
      phone: "010-1234-5678",
      zip_code: "06236",
      address: "서울특별시 강남구 테헤란로 123",
      is_default: false,
    };
    const res = await POST(makePostRequest(body));
    expect(res.status).toBe(201);
  });

  it("필수 항목 누락 시 400을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });

    const res = await POST(makePostRequest({ recipient_name: "홍길동" }));
    expect(res.status).toBe(400);
  });
});
