import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Supabase 서버 클라이언트 모킹
const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({ from: mockFrom }),
}));

import { GET } from "@/app/api/books/route";

function makeQueryBuilder(data: any[], error: any = null) {
  const builder: any = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.or = vi.fn(chain);
  builder.gte = vi.fn(chain);
  builder.lte = vi.fn(chain);
  builder.order = vi.fn(chain);
  builder.limit = vi.fn(chain);
  builder.lt = vi.fn(chain);
  // 최종 await 결과
  builder.then = (resolve: any) => resolve({ data, error });
  return builder;
}

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost:3002/api/books");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

describe("GET /api/books", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("활성 도서 목록을 반환한다", async () => {
    const books = [
      { id: "1", title: "도서1", is_active: true, created_at: "2024-01-01T00:00:00Z" },
      { id: "2", title: "도서2", is_active: true, created_at: "2024-01-02T00:00:00Z" },
    ];
    mockFrom.mockReturnValue(makeQueryBuilder(books));

    const res = await GET(makeRequest());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.books).toHaveLength(2);
    expect(json.nextCursor).toBeNull();
  });

  it("21개 결과가 있으면 nextCursor를 반환한다", async () => {
    const books = Array.from({ length: 21 }, (_, i) => ({
      id: String(i),
      title: `도서${i}`,
      is_active: true,
      created_at: `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
    }));
    mockFrom.mockReturnValue(makeQueryBuilder(books));

    const res = await GET(makeRequest());
    const json = await res.json();

    expect(json.books).toHaveLength(20);
    expect(json.nextCursor).not.toBeNull();
  });

  it("DB 에러 시 500을 반환한다", async () => {
    mockFrom.mockReturnValue(makeQueryBuilder(null, { message: "DB Error" }));

    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
  });

  it("검색 파라미터 q가 있으면 쿼리에 포함된다", async () => {
    const builder = makeQueryBuilder([]);
    mockFrom.mockReturnValue(builder);

    await GET(makeRequest({ q: "파이썬" }));
    expect(builder.or).toHaveBeenCalledWith(
      expect.stringContaining("파이썬")
    );
  });
});
