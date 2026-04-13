import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AIBookStore — 당신만의 서점",
    template: "%s | AIBookStore",
  },
  description:
    "독립 서점의 따뜻한 감성으로 만나는 온라인 책방. 소설, 비소설, 자기계발 등 다양한 책을 만나보세요.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "AIBookStore",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
