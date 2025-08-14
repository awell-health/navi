import type { Metadata } from "next";
import { getBrandingAction } from "@/app/actions";
import { BrandingProvider } from "@/lib/branding-provider";
import "../globals.css";
import { cn } from "@/lib/utils";
import { loadOrgFontConfig } from "@/lib/branding/fonts/dynamic-fonts";
import Head from "next/head";

export const dynamic = "force-dynamic";

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

  // Load font configuration dynamically for this organization
  const fontConfig = await loadOrgFontConfig(orgId);
  const fontVariables = fontConfig?.variables ?? "";
  return (
    <div>
      <Head>
        <style dangerouslySetInnerHTML={{ __html: `${themeCSS}` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        {/* Only load Google Fonts for this specific organization */}
        {fontConfig?.googleFontsUrl && (
          <link href={fontConfig.googleFontsUrl} rel="stylesheet" as="font" />
        )}
      </Head>
      <div className={cn(fontVariables, "antialiased w-full h-full")}>
        <BrandingProvider
          branding={branding ?? {}}
          orgId={orgId}
          hasCustomBranding={hasCustomBranding}
        >
          <div className="p-6 w-full h-full">{children}</div>
        </BrandingProvider>
      </div>
    </div>
  );
}
