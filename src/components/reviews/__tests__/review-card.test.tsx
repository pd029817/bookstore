import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReviewCard } from "../review-card";

vi.mock("lucide-react", () => ({
  ThumbsUp: (props: any) => <svg data-testid="thumbs-up" {...props} />,
  Star: (props: any) => <svg data-testid="star" {...props} />,
}));

const reviewWithContent = {
  id: "review-001",
  rating: 4,
  content: "정말 좋은 책입니다.",
  likes_count: 3,
  created_at: "2024-06-01T00:00:00.000Z",
  user: { id: "user-001", name: "홍*동" },
};

const reviewNoContent = {
  id: "review-002",
  rating: 5,
  content: null,
  likes_count: 0,
  created_at: "2024-06-02T00:00:00.000Z",
  user: null,
};

describe("ReviewCard", () => {
  it("리뷰 내용과 작성자 이름을 표시한다", () => {
    render(<ReviewCard review={reviewWithContent} />);

    expect(screen.getByText("정말 좋은 책입니다.")).toBeInTheDocument();
    expect(screen.getByText("홍*동")).toBeInTheDocument();
  });

  it("좋아요 수가 있으면 숫자를 표시한다", () => {
    render(<ReviewCard review={reviewWithContent} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("좋아요 수가 0이면 '도움이 됐어요' 텍스트를 표시한다", () => {
    render(<ReviewCard review={reviewNoContent} />);

    expect(screen.getByText("도움이 됐어요")).toBeInTheDocument();
  });

  it("user가 null이면 '익명'을 표시한다", () => {
    render(<ReviewCard review={reviewNoContent} />);

    expect(screen.getByText("익명")).toBeInTheDocument();
  });

  it("content가 null이면 본문을 렌더링하지 않는다", () => {
    render(<ReviewCard review={reviewNoContent} />);

    expect(screen.queryByText("정말 좋은 책입니다.")).not.toBeInTheDocument();
  });

  it("좋아요 버튼 클릭 시 onLike를 호출한다", () => {
    const onLike = vi.fn();
    render(<ReviewCard review={reviewWithContent} onLike={onLike} />);

    fireEvent.click(screen.getByTestId("thumbs-up").closest("button")!);
    expect(onLike).toHaveBeenCalledWith("review-001");
  });
});
