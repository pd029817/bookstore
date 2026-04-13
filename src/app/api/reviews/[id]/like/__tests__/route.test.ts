import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockFrom, mockGetUser } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetUser: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({ auth: { getUser: mockGetUser }, from: mockFrom }),
}));

import { POST } from "@/app/api/reviews/[id]/like/route";

const AUTHED_USER = { id: "user-001", email: "test@test.com" };
const PARAMS = Promise.resolve({ id: "review-001" });

function makeQueryBuilder(data: any, error: any = null) {
  const builder: any = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.insert = vi.fn(chain);
  builder.delete = vi.fn(chain);
  builder.single = vi.fn().mockResolvedValue({ data, error });
  builder.then = (resolve: any) => resolve({ data, error });
  return builder;
}

function makeRequest() {
  return new Request("http://localhost:3002/api/reviews/review-001/like", {
    method: "POST",
  });
}

describe("POST /api/reviews/[id]/like", () => {
  beforeEach(() => vi.clearAllMocks());

  it("비인증 요청은 401을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest(), { params: PARAMS });
    expect(res.status).toBe(401);
  });

  it("이미 좋아요한 경우 취소한다 (unlike)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });

    // 첫 번째 from: review_likes 조회 (기존 좋아요 존재)
    const selectBuilder = makeQueryBuilder({ id: "like-001" });
    // 두 번째 from: review_likes 삭제
    const deleteBuilder = makeQueryBuilder(null);

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? selectBuilder : deleteBuilder;
    });

    const res = await POST(makeRequest(), { params: PARAMS });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.liked).toBe(false);
  });

  it("좋아요가 없으면 새로 추가한다 (like)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });

    // 첫 번째 from: review_likes 조회 (없음)
    const selectBuilder = makeQueryBuilder(null);
    // 두 번째 from: review_likes insert
    const insertBuilder = makeQueryBuilder(null);

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? selectBuilder : insertBuilder;
    });

    const res = await POST(makeRequest(), { params: PARAMS });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.liked).toBe(true);
  });

  it("좋아요 추가 중 에러 시 500을 반환한다", async () => {
    mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER } });

    const selectBuilder = makeQueryBuilder(null);
    const errorBuilder = makeQueryBuilder(null, { message: "DB Error" });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? selectBuilder : errorBuilder;
    });

    const res = await POST(makeRequest(), { params: PARAMS });
    expect(res.status).toBe(500);
  });
});
