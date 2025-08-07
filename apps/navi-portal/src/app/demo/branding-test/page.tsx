import "../../globals.css";
import React from "react";
import { BrandingProvider } from "@/lib/branding-provider";
import { BrandingService } from "@/lib/branding/branding-service";
import { generateThemeCSS } from "@/lib/branding/theme/generator";
import { BrandingTestClient } from "./branding-test-client";
import { cn } from "@/lib/utils";
import { getOrgFontSetup } from "@/lib/branding/fonts/runtime-fonts";
import { awellDefaultBranding } from "@/lib/branding/defaults";

interface BrandingTestPageProps {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function BrandingTestPage({
  searchParams,
}: BrandingTestPageProps) {
  const params = await searchParams;

  // Extract org-id from search params (handle both string and array cases)
  const orgId = params["orgId"];

  console.log("🎨 Branding Test Page: Loading branding for org:", orgId);

  // Initialize branding service and fetch branding
  const brandingService = new BrandingService();
  const { branding, hasCustomBranding } = await brandingService.getBrandingInfo(
    orgId
  );

  // Generate theme CSS for this specific branding
  const themeCSS = generateThemeCSS(branding);
  console.log("🎨 Branding Test Page: Theme CSS", themeCSS);
  const setup = await getOrgFontSetup(orgId);
  const fontVariables = setup.classNames;

  return (
    <html lang="en">
      <head>
        {/* Inject custom theme CSS for this page */}
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body className={cn(fontVariables, "antialiased w-full h-full")}>
        <BrandingProvider
          branding={branding}
          orgId={orgId || awellDefaultBranding.orgId}
          hasCustomBranding={hasCustomBranding}
        >
          <BrandingTestClient
            orgId={orgId || awellDefaultBranding.orgId}
            hasCustomBranding={hasCustomBranding}
          />
        </BrandingProvider>
      </body>
    </html>
  );
}

// Force dynamic rendering to ensure fresh branding data
export const dynamic = "force-dynamic";
