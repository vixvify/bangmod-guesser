import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Geist, Geist_Mono, Prompt } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { config } from "@/shared/config/runtime";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(new URL(config.authUrl).origin),
  title: "Bangmod Guesser",
  description: "เกมทายสถานที่ภายในมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี วิทยาเขตบางมด",
  openGraph: {
    title: "Bangmod Guesser",
    description: "สำรวจและทายสถานที่ภายในมหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี วิทยาเขตบางมด",
    type: "website",
    locale: "th_TH",
    images: [{ url: "/images/kmutt-bangmod-1.jpg", alt: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี วิทยาเขตบางมด" }],
  },
  twitter: { card: "summary_large_image" },
  ...(config.isPreview ? { robots: { index: false, follow: false } } : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} ${prompt.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">ข้ามไปเนื้อหาหลัก</a>
        <AppRouterCacheProvider>
          {children}
          <Toaster
            position="top-center"
            closeButton
            toastOptions={{
              style: {
                background: "var(--color-secondary-light)",
                border: "1px solid var(--color-primary-soft)",
                color: "var(--color-secondary-dark)",
                fontFamily: "var(--font-prompt), sans-serif",
              },
            }}
          />
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
