import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Geist, Geist_Mono, Prompt } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";

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
  title: "Bangmod Guesser",
  description: "เกมทายสถานที่ต่าง ๆ ในมหาวิทยาลัย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${prompt.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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
