import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { GlassBlobBackground } from "@/components/features/layout/GlassBlobBackground";
import { Providers } from "@/components/features/layout/Providers";

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
          className="fixed inset-0 -z-10 bg-mesh-gradient"
          aria-hidden
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
