import type { Metadata } from "next";
import { getBrandingAction } from "@/app/actions";
import { BrandingProvider } from "@/lib/branding-provider";
import "../globals.css";
import { cn } from "@/lib/utils";
import { loadOrgFontConfig } from "@/lib/branding/fonts/dynamic-fonts";
import { Bootstrap } from "./_components/Bootstrap";
import { env } from "@/env";

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
  const stytchPublicToken = env.STYTCH_B2B_PUBLIC_TOKEN!;
  const stytchEnv = env.STYTCH_ENV;
  const cookieDomain = env.HTTP_COOKIE_DOMAIN;
  const useHttpOnly = env.HTTP_ONLY_COOKIES;
  // Load font configuration dynamically for this organization
  const fontConfig = await loadOrgFontConfig(orgId);
  const fontVariables = fontConfig?.variables ?? "";
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `${themeCSS}` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        {/* Only load Google Fonts for this specific organization */}
        {fontConfig?.googleFontsUrl && (
          <link href={fontConfig.googleFontsUrl} rel="stylesheet" as="font" />
        )}
      </head>
      <body className={cn(fontVariables, "antialiased w-full h-full")}>
        <BrandingProvider
          branding={branding ?? {}}
          orgId={orgId}
          hasCustomBranding={hasCustomBranding}
        >
          <Bootstrap
            stytchPublicToken={stytchPublicToken}
            cookieDomain={cookieDomain}
            useHttpOnly={useHttpOnly}
          >
            <div className="p-6 w-full h-full">{children}</div>
          </Bootstrap>
        </BrandingProvider>
      </body>
    </html>
  );
}
