import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getBrandingAction } from "@/app/actions";
import { BrandingProvider } from "@/lib/branding-provider";
import "../globals.css";
import { cn } from "@/lib/utils";
import { orgFontMap } from "@/lib/branding/fonts/generated/dynamic-fonts";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Navi | Powered by Awell",
  description: "Your personalized health care portal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { themeCSS, orgId, hasCustomBranding, branding } =
    await getBrandingAction();
  const fontVariables =
    orgFontMap[orgId as keyof typeof orgFontMap]?.variables ?? "";
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `${themeCSS}` }} />
      </head>
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} antialiased w-full h-full`,
          fontVariables
        )}
      >
        <BrandingProvider
          branding={branding ?? {}}
          orgId={orgId}
          hasCustomBranding={hasCustomBranding}
        >
          <div className="p-6 w-full h-full">{children}</div>
        </BrandingProvider>
      </body>
    </html>
  );
}
