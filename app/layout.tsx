import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { GlassBlobBackground } from "@/components/layout/GlassBlobBackground";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: "PastryCalc — přepočty receptur",
  description: "Přepočet surovin podle cílového výstupu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={GeistSans.variable}>
      <body
        className={`${GeistSans.className} min-h-screen font-sans antialiased text-slate-800`}
      >
        <GlassBlobBackground />
        <div
          className="fixed inset-0 -z-10 bg-gradient-to-br from-[#e0f7fa]/90 via-[#ede7f6]/85 to-[#e3f2fd]/90"
          aria-hidden
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
