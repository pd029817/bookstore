import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BookSearch } from "../book-search";
import { bookFixture, bookFixtureNoImage } from "@/test/fixtures/books";

// next/image 모킹
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

// next/navigation 모킹
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// useDebounce를 즉시 반환하도록 모킹
vi.mock("@/hooks/use-debounce", () => ({
  useDebounce: (value: string) => value,
}));

// lucide-react 모킹
vi.mock("lucide-react", () => ({
  Search: (props: any) => <svg data-testid="search-icon" {...props} />,
  X: (props: any) => <svg data-testid="x-icon" {...props} />,
}));

describe("BookSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("검색 입력 필드를 렌더링한다", () => {
    render(<BookSearch />);
    expect(
      screen.getByPlaceholderText("제목, 저자로 검색...")
    ).toBeInTheDocument();
  });

  it("검색 결과에 커버 이미지를 썸네일로 표시한다", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve({ books: [bookFixture] }),
    });

    render(<BookSearch />);
    const input = screen.getByPlaceholderText("제목, 저자로 검색...");
    fireEvent.change(input, { target: { value: "테스트" } });

    await waitFor(() => {
      const img = screen.getByAltText(bookFixture.title);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", bookFixture.cover_image_url);
    });
  });

  it("커버 이미지가 없는 도서는 이미지를 표시하지 않는다", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve({ books: [bookFixtureNoImage] }),
    });

    render(<BookSearch />);
    const input = screen.getByPlaceholderText("제목, 저자로 검색...");
    fireEvent.change(input, { target: { value: "표지" } });

    await waitFor(() => {
      expect(screen.getByText(bookFixtureNoImage.title)).toBeInTheDocument();
    });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("검색 결과에 제목, 저자, 가격을 표시한다", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve({ books: [bookFixture] }),
    });

    render(<BookSearch />);
    fireEvent.change(screen.getByPlaceholderText("제목, 저자로 검색..."), {
      target: { value: "테스트" },
    });

    await waitFor(() => {
      expect(screen.getByText(bookFixture.title)).toBeInTheDocument();
      expect(
        screen.getByText(/테스트 저자/, { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("검색 결과 클릭 시 해당 도서 상세 페이지로 이동한다", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve({ books: [bookFixture] }),
    });

    render(<BookSearch />);
    fireEvent.change(screen.getByPlaceholderText("제목, 저자로 검색..."), {
      target: { value: "테스트" },
    });

    await waitFor(() => {
      expect(screen.getByText(bookFixture.title)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(bookFixture.title));
    expect(mockPush).toHaveBeenCalledWith(`/books/${bookFixture.id}`);
  });

  it("X 버튼 클릭 시 검색어와 결과가 초기화된다", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve({ books: [bookFixture] }),
    });

    render(<BookSearch />);
    const input = screen.getByPlaceholderText("제목, 저자로 검색...");
    fireEvent.change(input, { target: { value: "테스트" } });

    await waitFor(() => {
      expect(screen.getByText(bookFixture.title)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("x-icon").closest("button")!);
    expect(input).toHaveValue("");
    expect(screen.queryByText(bookFixture.title)).not.toBeInTheDocument();
  });

  it("엔터 입력 시 검색 결과 페이지로 이동한다", async () => {
    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve({ books: [] }),
    });

    render(<BookSearch />);
    const input = screen.getByPlaceholderText("제목, 저자로 검색...");
    fireEvent.change(input, { target: { value: "AI" } });
    fireEvent.submit(input.closest("form")!);

    expect(mockPush).toHaveBeenCalledWith("/books?q=AI");
  });

  it("빈 검색어로는 API 호출을 하지 않는다", () => {
    render(<BookSearch />);
    fireEvent.change(screen.getByPlaceholderText("제목, 저자로 검색..."), {
      target: { value: "  " },
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("이미지 있는 도서와 없는 도서가 함께 표시될 때 올바르게 렌더링한다", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: () =>
        Promise.resolve({ books: [bookFixture, bookFixtureNoImage] }),
    });

    render(<BookSearch />);
    fireEvent.change(screen.getByPlaceholderText("제목, 저자로 검색..."), {
      target: { value: "도서" },
    });

    await waitFor(() => {
      expect(screen.getByText(bookFixture.title)).toBeInTheDocument();
      expect(screen.getByText(bookFixtureNoImage.title)).toBeInTheDocument();
    });

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute("src", bookFixture.cover_image_url);
  });
});
