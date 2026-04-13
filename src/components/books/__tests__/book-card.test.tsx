import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookCard } from "@/components/books/book-card";
import { bookFixture, bookFixtureNoDiscount, bookFixtureNoImage } from "@/test/fixtures/books";

// next/image 모킹 (jsdom은 실제 이미지 로드 불가)
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

// next/link 모킹
vi.mock("next/link", () => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

describe("BookCard", () => {
  it("제목과 저자를 렌더링한다", () => {
    render(<BookCard book={bookFixture} />);
    expect(screen.getByText(bookFixture.title)).toBeInTheDocument();
    expect(screen.getByText(bookFixture.author)).toBeInTheDocument();
  });

  it("할인가가 있으면 할인 배지와 할인가를 표시한다", () => {
    render(<BookCard book={bookFixture} />);
    expect(screen.getByText(/OFF/)).toBeInTheDocument();
    expect(screen.getByText("18,000원")).toBeInTheDocument();
  });

  it("할인가가 없으면 원가를 표시한다", () => {
    render(<BookCard book={bookFixtureNoDiscount} />);
    expect(screen.queryByText(/OFF/)).not.toBeInTheDocument();
    expect(screen.getByText("20,000원")).toBeInTheDocument();
  });

  it("이미지가 없으면 제목 텍스트를 대신 표시한다", () => {
    render(<BookCard book={bookFixtureNoImage} />);
    expect(screen.getAllByText(bookFixtureNoImage.title).length).toBeGreaterThan(0);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("장바구니 버튼 클릭 시 onAddToCart가 호출된다", () => {
    const onAddToCart = vi.fn();
    render(<BookCard book={bookFixture} onAddToCart={onAddToCart} />);
    fireEvent.click(screen.getByLabelText("장바구니에 담기"));
    expect(onAddToCart).toHaveBeenCalledWith(bookFixture);
  });

  it("도서 링크가 /books/:id로 연결된다", () => {
    render(<BookCard book={bookFixture} />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link.getAttribute("href")).toBe(`/books/${bookFixture.id}`);
    });
  });
});
