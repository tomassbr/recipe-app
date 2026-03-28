import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { GlassBlobBackground } from "@/components/features/layout/GlassBlobBackground";
import { Providers } from "@/components/features/layout/Providers";

export const metadata: Metadata = {
  title: "PastryCalc — přepočty receptur",
  description: "Přepočet surovin podle cílového výstupu",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={GeistSans.variable}>
      <body
        className={`${GeistSans.className} min-h-screen font-sans antialiased text-slate-800`}
      >
        <GlassBlobBackground />
        <div
          className="fixed inset-0 -z-10 bg-mesh-gradient"
          aria-hidden
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
