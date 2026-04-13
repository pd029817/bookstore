"use client";

import Script from "next/script";
import { Button } from "@/components/ui/button";

interface AddressResult {
  zipCode: string;
  address: string;
}

interface AddressSearchProps {
  onSelect: (result: AddressResult) => void;
}

declare global {
  interface Window {
    daum: any;
  }
}

export function AddressSearch({ onSelect }: AddressSearchProps) {
  function handleSearch() {
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        onSelect({
          zipCode: data.zonecode,
          address: data.roadAddress || data.jibunAddress,
        });
      },
    }).open();
  }

  return (
    <>
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />
      <Button type="button" variant="secondary" className="self-end" onClick={handleSearch}>
        주소 검색
      </Button>
    </>
  );
}
