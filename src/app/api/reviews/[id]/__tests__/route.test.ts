import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockFrom, mockGetUser } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom }),
}));

import { PATCH, DELETE } from "@/app/api/reviews/[id]/route";

const AUTHED_USER = { id: "user-001", email: "test@test.com" };
const PARAMS = Promise.resolve({ id: "review-001" });

function makeQueryBuilder(data: any, error: any = null) {
  const builder: any = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.update = vi.fn(chain);
  builder.delete = vi.fn(chain);
  builder.single = vi.fn().mockResolvedValue({ data, error });
  builder.then = (resolve: any) => resolve({ data, error });
  return builder;
}

function makeRequest(method: string, body?: object) {
  return new Request("http://localhost:3002/api/reviews/review-001", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("PATCH /api/reviews/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("비인증 요청은 401을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await PATCH(makeRequest("PATCH", { rating: 5 }), { params: PARAMS });
    expect(res.status).toBe(401);
  });

  it("리뷰를 수정한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });
    const updated = { id: "review-001", rating: 5, content: "수정된 리뷰" };
    mockFrom.mockReturnValue(makeQueryBuilder(updated));

    const res = await PATCH(makeRequest("PATCH", { rating: 5, content: "수정된 리뷰" }), { params: PARAMS });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.review.rating).toBe(5);
  });

  it("DB 에러 시 500을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });
    mockFrom.mockReturnValue(makeQueryBuilder(null, { message: "DB Error" }));

    const res = await PATCH(makeRequest("PATCH", { rating: 3 }), { params: PARAMS });
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/reviews/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("비인증 요청은 401을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await DELETE(makeRequest("DELETE"), { params: PARAMS });
    expect(res.status).toBe(401);
  });

  it("리뷰를 삭제한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });
    mockFrom.mockReturnValue(makeQueryBuilder(null));

    const res = await DELETE(makeRequest("DELETE"), { params: PARAMS });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("DB 에러 시 500을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });
    mockFrom.mockReturnValue(makeQueryBuilder(null, { message: "DB Error" }));

    const res = await DELETE(makeRequest("DELETE"), { params: PARAMS });
    expect(res.status).toBe(500);
  });
});
