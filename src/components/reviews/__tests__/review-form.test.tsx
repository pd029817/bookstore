import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReviewForm } from "../review-form";

vi.mock("lucide-react", () => ({
  Star: (props: any) => <svg data-testid="star" {...props} />,
  Loader2: (props: any) => <svg data-testid="loader" {...props} />,
}));

const singleOrder = [{ order_id: "o1", order_number: "ORD-20240601-AAA" }];
const multipleOrders = [
  { order_id: "o1", order_number: "ORD-20240601-AAA" },
  { order_id: "o2", order_number: "ORD-20240602-BBB" },
];

describe("ReviewForm", () => {
  it("리뷰 작성 제목을 표시한다", () => {
    render(
      <ReviewForm bookId="b1" eligibleOrders={singleOrder} onSubmit={vi.fn()} />
    );
    expect(screen.getByText("리뷰 작성")).toBeInTheDocument();
  });

  it("주문이 1개일 때 주문 선택 드롭다운을 표시하지 않는다", () => {
    render(
      <ReviewForm bookId="b1" eligibleOrders={singleOrder} onSubmit={vi.fn()} />
    );
    expect(screen.queryByText("주문 선택")).not.toBeInTheDocument();
  });

  it("주문이 여러 개일 때 주문 선택 드롭다운을 표시한다", () => {
    render(
      <ReviewForm bookId="b1" eligibleOrders={multipleOrders} onSubmit={vi.fn()} />
    );
    expect(screen.getByText("주문 선택")).toBeInTheDocument();
    expect(screen.getByText("주문을 선택해 주세요")).toBeInTheDocument();
  });

  it("별점 안내 텍스트를 표시한다", () => {
    render(
      <ReviewForm bookId="b1" eligibleOrders={singleOrder} onSubmit={vi.fn()} />
    );
    expect(screen.getByText("별점을 클릭하면 바로 등록됩니다")).toBeInTheDocument();
  });

  it("텍스트 없이 별점 클릭 시 onSubmit을 호출한다", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <ReviewForm bookId="b1" eligibleOrders={singleOrder} onSubmit={onSubmit} />
    );

    // 4번째 별 클릭 (4점)
    const stars = screen.getAllByTestId("star");
    fireEvent.click(stars[3].closest("button")!);

    expect(onSubmit).toHaveBeenCalledWith({
      rating: 4,
      content: "",
      orderId: "o1",
    });
  });

  it("텍스트 입력 시 '리뷰 등록' 버튼이 나타난다", () => {
    render(
      <ReviewForm bookId="b1" eligibleOrders={singleOrder} onSubmit={vi.fn()} />
    );

    expect(screen.queryByText("리뷰 등록")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("리뷰를 작성해 주세요 (선택사항)"), {
      target: { value: "좋은 책!" },
    });

    expect(screen.getByText("리뷰 등록")).toBeInTheDocument();
  });
});
