import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockFrom, mockGetUser } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom }),
}));

import { GET } from "@/app/api/reviews/eligible/route";

const AUTHED_USER = { id: "user-001", email: "test@test.com" };

function makeQueryBuilder(data: any, error: any = null) {
  const builder: any = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.then = (resolve: any) => resolve({ data, error });
  return builder;
}

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3002/api/reviews/eligible");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe("GET /api/reviews/eligible", () => {
  beforeEach(() => vi.clearAllMocks());

  it("비인증 사용자는 빈 목록을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await GET(makeRequest({ bookId: "book-001" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.orders).toEqual([]);
  });

  it("bookId가 없으면 400을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });

    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it("배송완료된 주문 중 리뷰 미작성 주문만 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });

    const orderItems = [
      { order_id: "o1", order: { id: "o1", order_number: "ORD-20240601-AAA", user_id: "user-001", status: "delivered" } },
      { order_id: "o2", order: { id: "o2", order_number: "ORD-20240602-BBB", user_id: "user-001", status: "delivered" } },
      { order_id: "o3", order: { id: "o3", order_number: "ORD-20240603-CCC", user_id: "user-001", status: "preparing" } },
    ];
    const existingReviews = [{ order_id: "o1" }];

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return callCount === 1
        ? makeQueryBuilder(orderItems)
        : makeQueryBuilder(existingReviews);
    });

    const res = await GET(makeRequest({ bookId: "book-001" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    // o1은 이미 리뷰 있음, o3은 preparing → o2만 eligible
    expect(json.orders).toHaveLength(1);
    expect(json.orders[0].order_id).toBe("o2");
    expect(json.orders[0].order_number).toBe("ORD-20240602-BBB");
  });

  it("해당 도서 주문이 없으면 빈 목록을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });
    mockFrom.mockReturnValue(makeQueryBuilder([]));

    const res = await GET(makeRequest({ bookId: "book-001" }));
    const json = await res.json();

    expect(json.orders).toEqual([]);
  });
});
