import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { ApiStatus } from "@/components/ApiStatus";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verchool B2B",
  description: "B2B Marketplace - Buy and Sell Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${manrope.variable} antialiased bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display relative min-h-screen selection:bg-primary selection:text-black`}
        suppressHydrationWarning
      >
        <div className="fixed inset-0 noise-bg pointer-events-none z-50 mix-blend-overlay opacity-20"></div>
        <Providers>
          <ApiStatus />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
