import type { Metadata } from "next";
import { Tajawal, Aref_Ruqaa } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { ToastProvider } from "@/components/ToastProvider";
import Header from "@/components/Header";
import SocialLinks from "@/components/SocialLinks";
import AnimatedBackground from "@/components/AnimatedBackground";
import LoadingScreen from "@/components/LoadingScreen";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-body",
  display: "swap",
});

const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YAQEEN",
  description: "سوق إلكتروني — YAQEEN",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${arefRuqaa.variable}`}>
      <body className="flex min-h-screen flex-col font-body text-black">
        <LoadingScreen />
        <AnimatedBackground />
        <ToastProvider>
          <CartProvider>
            <Header />
            <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">{children}</main>
            <footer className="py-8 text-center text-xs text-neutral-500">
              <SocialLinks />
              <div className="mt-4">تابعونا</div>
            </footer>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
