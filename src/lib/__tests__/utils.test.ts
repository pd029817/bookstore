import { describe, it, expect } from "vitest";
import {
  maskEmail,
  maskPhone,
  maskName,
  maskAddress,
  maskCardNumber,
  formatPrice,
  formatDiscount,
  generateOrderNumber,
} from "@/lib/utils";

// ===== 개인정보 마스킹 =====

describe("maskEmail", () => {
  it("앞 3자리 이후 @ 앞을 마스킹한다", () => {
    expect(maskEmail("sokim9141@gmail.com")).toBe("sok******@gmail.com");
  });

  it("로컬 파트가 3자 이하면 마스킹 없이 반환한다", () => {
    expect(maskEmail("ab@test.com")).toBe("ab@test.com");
  });

  it("@ 없는 입력은 ***을 반환한다", () => {
    expect(maskEmail("invalid")).toBe("***");
  });

  it("정확히 3자 로컬 파트는 마스킹이 붙지 않는다", () => {
    expect(maskEmail("abc@test.com")).toBe("abc@test.com");
  });
});

describe("maskPhone", () => {
  it("가운데 4자리를 ****로 마스킹한다", () => {
    expect(maskPhone("01012345678")).toBe("010-****-5678");
    expect(maskPhone("010-1234-5678")).toBe("010-****-5678");
  });

  it("10자리 미만 입력은 ***를 반환한다", () => {
    expect(maskPhone("0101234")).toBe("***");
  });

  it("하이픈 포함 번호도 정상 처리한다", () => {
    expect(maskPhone("010-9876-5432")).toBe("010-****-5432");
  });
});

describe("maskName", () => {
  it("3자 이름은 가운데를 *로 마스킹한다", () => {
    expect(maskName("홍길동")).toBe("홍*동");
  });

  it("2자 이름은 뒤를 *로 마스킹한다", () => {
    expect(maskName("김민")).toBe("김*");
  });

  it("1자 이름은 그대로 반환한다", () => {
    expect(maskName("이")).toBe("이");
  });

  it("4자 이름은 가운데 2자를 마스킹한다", () => {
    expect(maskName("남궁민수")).toBe("남**수");
  });
});

describe("maskAddress", () => {
  it("시/구 이하를 ***로 마스킹한다", () => {
    const result = maskAddress("서울특별시 강남구 테헤란로 123");
    expect(result).toContain("강남구");
    expect(result).toContain("***");
    expect(result).not.toContain("테헤란로");
  });

  it("매칭 실패 시 앞 6자만 노출한다", () => {
    const result = maskAddress("abcdefghij");
    expect(result).toBe("abcdef***");
  });
});

describe("maskCardNumber", () => {
  it("앞 4자리와 뒤 4자리만 노출한다", () => {
    expect(maskCardNumber("1234567890123456")).toBe("1234-****-****-3456");
  });

  it("8자리 미만은 ****-****-****-**** 반환한다", () => {
    expect(maskCardNumber("1234")).toBe("****-****-****-****");
  });
});

// ===== 가격 포맷 =====

describe("formatPrice", () => {
  it("숫자에 원 단위를 붙인다", () => {
    expect(formatPrice(10000)).toBe("10,000원");
    expect(formatPrice(0)).toBe("0원");
    expect(formatPrice(1234567)).toBe("1,234,567원");
  });
});

describe("formatDiscount", () => {
  it("할인율을 반올림해 반환한다", () => {
    expect(formatDiscount(10000, 9000)).toBe(10);
    expect(formatDiscount(30000, 27000)).toBe(10);
    expect(formatDiscount(10000, 8000)).toBe(20);
  });

  it("33% 할인 반올림", () => {
    expect(formatDiscount(30000, 20100)).toBe(33);
  });
});

// ===== 주문번호 =====

describe("generateOrderNumber", () => {
  it("ORD-YYYYMMDD-XXXXX 형식이다", () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber).toMatch(/^ORD-\d{8}-[A-Z0-9]{5}$/);
  });

  it("호출마다 고유한 값을 반환한다", () => {
    const a = generateOrderNumber();
    const b = generateOrderNumber();
    expect(a).not.toBe(b);
  });
});
