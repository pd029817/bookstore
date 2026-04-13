import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddressSearch } from "@/components/ui/address-search";

// next/script 모킹
vi.mock("next/script", () => ({
  default: ({ onLoad }: any) => {
    // 스크립트 로드 시뮬레이션
    if (onLoad) onLoad();
    return null;
  },
}));

describe("AddressSearch", () => {
  beforeEach(() => {
    // daum.Postcode 모킹 (new 키워드로 생성되므로 생성자 함수 사용)
    (window as any).daum = {
      Postcode: function ({ oncomplete }: any) {
        this.open = () => {
          oncomplete({
            zonecode: "06236",
            roadAddress: "서울특별시 강남구 테헤란로 123",
            jibunAddress: "서울특별시 강남구 역삼동 123",
          });
        };
      },
    };
    vi.spyOn((window as any).daum, "Postcode");
  });

  it("주소 검색 버튼이 렌더링된다", () => {
    render(<AddressSearch onSelect={vi.fn()} />);
    expect(screen.getByText("주소 검색")).toBeInTheDocument();
  });

  it("버튼 클릭 시 daum.Postcode가 열린다", () => {
    render(<AddressSearch onSelect={vi.fn()} />);
    fireEvent.click(screen.getByText("주소 검색"));
    expect((window as any).daum.Postcode).toHaveBeenCalled();
  });

  it("주소 선택 시 onSelect가 zipCode와 address로 호출된다", () => {
    const onSelect = vi.fn();
    render(<AddressSearch onSelect={onSelect} />);
    fireEvent.click(screen.getByText("주소 검색"));

    expect(onSelect).toHaveBeenCalledWith({
      zipCode: "06236",
      address: "서울특별시 강남구 테헤란로 123",
    });
  });

  it("roadAddress 없으면 jibunAddress를 사용한다", () => {
    (window as any).daum.Postcode = function ({ oncomplete }: any) {
      this.open = () => {
        oncomplete({ zonecode: "06236", roadAddress: "", jibunAddress: "지번주소" });
      };
    };
    const onSelect = vi.fn();
    render(<AddressSearch onSelect={onSelect} />);
    fireEvent.click(screen.getByText("주소 검색"));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ address: "지번주소" })
    );
  });
});
