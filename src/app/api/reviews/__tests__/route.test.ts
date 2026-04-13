import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockFrom, mockGetUser } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom }),
}));

import { GET, POST } from "@/app/api/reviews/route";

const AUTHED_USER = { id: "user-001", email: "test@test.com" };

function makeQueryBuilder(data: any, error: any = null) {
  const builder: any = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.order = vi.fn(chain);
  builder.insert = vi.fn(chain);
  builder.single = vi.fn().mockResolvedValue({ data, error });
  builder.then = (resolve: any) => resolve({ data, error });
  return builder;
}

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3002/api/reviews");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

function makePostRequest(body: object) {
  return new NextRequest("http://localhost:3002/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/reviews", () => {
  beforeEach(() => vi.clearAllMocks());

  it("bookId가 없으면 400을 반환한다", async () => {
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(400);
  });

  it("리뷰 목록을 반환하고 이름을 마스킹한다", async () => {
    const reviews = [
      { id: "r1", rating: 4, content: "좋아요", user: { id: "u1", name: "홍길동" } },
      { id: "r2", rating: 5, content: null, user: { id: "u2", name: "김철수" } },
    ];
    mockFrom.mockReturnValue(makeQueryBuilder(reviews));

    const res = await GET(makeGetRequest({ bookId: "book-001" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.reviews).toHaveLength(2);
    // 이름이 마스킹되었는지 확인
    expect(json.reviews[0].user.name).not.toBe("홍길동");
    expect(json.reviews[1].user.name).not.toBe("김철수");
  });

  it("DB 에러 시 500을 반환한다", async () => {
    mockFrom.mockReturnValue(makeQueryBuilder(null, { message: "DB Error" }));

    const res = await GET(makeGetRequest({ bookId: "book-001" }));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/reviews", () => {
  beforeEach(() => vi.clearAllMocks());

  it("비인증 요청은 401을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makePostRequest({ book_id: "b1", order_id: "o1", rating: 4 }));
    expect(res.status).toBe(401);
  });

  it("필수 항목 누락 시 400을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });

    const res = await POST(makePostRequest({ book_id: "b1" }));
    expect(res.status).toBe(400);
  });

  it("평점 범위 초과 시 400을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });

    const res = await POST(makePostRequest({ book_id: "b1", order_id: "o1", rating: 6 }));
    expect(res.status).toBe(400);
  });

  it("배송완료 주문이 아니면 403을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });
    // order_items 조회 — 상태가 preparing
    const orderItemBuilder = makeQueryBuilder({
      id: "oi-1",
      order: { id: "o1", user_id: "user-001", status: "preparing" },
    });
    mockFrom.mockReturnValue(orderItemBuilder);

    const res = await POST(
      makePostRequest({ book_id: "b1", order_id: "o1", rating: 4, content: "좋아요" })
    );
    expect(res.status).toBe(403);
  });

  it("유효한 주문이 있으면 리뷰를 생성한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });

    const orderItemBuilder = makeQueryBuilder({
      id: "oi-1",
      order: { id: "o1", user_id: "user-001", status: "delivered" },
    });
    const reviewBuilder = makeQueryBuilder({
      id: "r1",
      rating: 4,
      content: "좋아요",
      user: { id: "user-001", name: "테스트" },
    });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      // 첫 번째 호출: order_items 조회, 두 번째: reviews insert
      return callCount === 1 ? orderItemBuilder : reviewBuilder;
    });

    const res = await POST(
      makePostRequest({ book_id: "b1", order_id: "o1", rating: 4, content: "좋아요" })
    );
    expect(res.status).toBe(201);
  });

  it("중복 리뷰는 409를 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });

    const orderItemBuilder = makeQueryBuilder({
      id: "oi-1",
      order: { id: "o1", user_id: "user-001", status: "delivered" },
    });
    const duplicateBuilder = makeQueryBuilder(null, { code: "23505", message: "duplicate" });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? orderItemBuilder : duplicateBuilder;
    });

    const res = await POST(
      makePostRequest({ book_id: "b1", order_id: "o1", rating: 4 })
    );
    expect(res.status).toBe(409);
  });
});
