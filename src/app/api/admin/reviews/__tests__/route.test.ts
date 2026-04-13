import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockFrom, mockGetUser } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom }),
}));

import { GET, DELETE } from "@/app/api/admin/reviews/route";

const ADMIN_USER = { id: "admin-001", email: "admin@test.com" };
const NORMAL_USER = { id: "user-001", email: "test@test.com" };

function makeQueryBuilder(data: any, error: any = null, count: number | null = null) {
  const builder: any = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.order = vi.fn(chain);
  builder.range = vi.fn(chain);
  builder.delete = vi.fn(chain);
  builder.single = vi.fn().mockResolvedValue({ data, error });
  builder.then = (resolve: any) => resolve({ data, error, count });
  return builder;
}

function makeGetRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3002/api/admin/reviews");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

function makeDeleteRequest(body: object) {
  return new NextRequest("http://localhost:3002/api/admin/reviews", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/admin/reviews", () => {
  beforeEach(() => vi.clearAllMocks());

  it("비인증 요청은 401을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(401);
  });

  it("일반 사용자는 403을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: NORMAL_USER } });
    mockFrom.mockReturnValue(makeQueryBuilder({ role: "customer" }));

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(403);
  });

  it("관리자는 리뷰 목록을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: ADMIN_USER } });

    const reviews = [
      { id: "r1", rating: 4, content: "좋아요", user: { id: "u1", name: "홍길동", email: "a@a.com" }, book: { id: "b1", title: "테스트" } },
      { id: "r2", rating: 5, content: null, user: { id: "u2", name: "김철수", email: "b@b.com" }, book: { id: "b2", title: "테스트2" } },
    ];

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return callCount === 1
        ? makeQueryBuilder({ role: "admin" })
        : makeQueryBuilder(reviews, null, 2);
    });

    const res = await GET(makeGetRequest());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.reviews).toHaveLength(2);
    expect(json.total).toBe(2);
    // 이름이 마스킹되었는지 확인
    expect(json.reviews[0].user.name).not.toBe("홍길동");
  });
});

describe("DELETE /api/admin/reviews", () => {
  beforeEach(() => vi.clearAllMocks());

  it("비인증 요청은 401을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await DELETE(makeDeleteRequest({ reviewId: "r1" }));
    expect(res.status).toBe(401);
  });

  it("일반 사용자는 403을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: NORMAL_USER } });
    mockFrom.mockReturnValue(makeQueryBuilder({ role: "customer" }));

    const res = await DELETE(makeDeleteRequest({ reviewId: "r1" }));
    expect(res.status).toBe(403);
  });

  it("reviewId가 없으면 400을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: ADMIN_USER } });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return makeQueryBuilder({ role: "admin" });
    });

    const res = await DELETE(makeDeleteRequest({}));
    expect(res.status).toBe(400);
  });

  it("관리자는 리뷰를 삭제할 수 있다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: ADMIN_USER } });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return callCount === 1
        ? makeQueryBuilder({ role: "admin" })
        : makeQueryBuilder(null);
    });

    const res = await DELETE(makeDeleteRequest({ reviewId: "r1" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
