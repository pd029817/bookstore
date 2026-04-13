import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ReviewList } from "../review-list";

// Mock useAuth
const mockUser = { id: "user-001", email: "test@test.com" };
vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(() => ({ user: mockUser, loading: false })),
}));

// Mock useToast
const mockAddToast = vi.fn();
vi.mock("@/components/ui/toast", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  ThumbsUp: (props: any) => <svg data-testid="thumbs-up" {...props} />,
  Star: (props: any) => <svg data-testid="star" {...props} />,
  Loader2: (props: any) => <svg data-testid="loader" {...props} />,
}));

const mockReviews = [
  {
    id: "r1",
    rating: 4,
    content: "좋은 책입니다.",
    likes_count: 2,
    created_at: "2024-06-01T00:00:00.000Z",
    user: { id: "u1", name: "홍*동" },
  },
];

const mockEligibleOrders = [
  { order_id: "o1", order_number: "ORD-20240601-AAA" },
];

describe("ReviewList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("로딩 중 스켈레톤을 표시한다", () => {
    (global.fetch as any).mockReturnValue(new Promise(() => {})); // never resolves
    render(<ReviewList bookId="book-001" />);

    const skeletons = document.querySelectorAll(".animate-pulse-warm");
    expect(skeletons.length).toBe(2);
  });

  it("리뷰가 없으면 빈 상태 메시지를 표시한다", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ reviews: [] }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ orders: mockEligibleOrders }),
      });

    render(<ReviewList bookId="book-001" />);

    await waitFor(() => {
      expect(
        screen.getByText("아직 리뷰가 없습니다. 이 책의 첫 번째 리뷰를 작성해 보세요.")
      ).toBeInTheDocument();
    });
  });

  it("리뷰 목록을 렌더링한다", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ reviews: mockReviews }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ orders: [] }),
      });

    render(<ReviewList bookId="book-001" />);

    await waitFor(() => {
      expect(screen.getByText("좋은 책입니다.")).toBeInTheDocument();
      expect(screen.getByText("홍*동")).toBeInTheDocument();
    });
  });

  it("eligible 주문이 있으면 리뷰 작성 폼을 표시한다", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ reviews: [] }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ orders: mockEligibleOrders }),
      });

    render(<ReviewList bookId="book-001" />);

    await waitFor(() => {
      expect(screen.getByText("리뷰 작성")).toBeInTheDocument();
    });
  });

  it("eligible 주문이 없으면 리뷰 작성 폼을 표시하지 않는다", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ reviews: mockReviews }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ orders: [] }),
      });

    render(<ReviewList bookId="book-001" />);

    await waitFor(() => {
      expect(screen.getByText("좋은 책입니다.")).toBeInTheDocument();
    });
    expect(screen.queryByText("리뷰 작성")).not.toBeInTheDocument();
  });
});
