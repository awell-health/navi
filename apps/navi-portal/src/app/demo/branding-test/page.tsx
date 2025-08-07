import React from "react";
import Head from "next/head";
import { BrandingProvider } from "@/lib/branding-provider";
import { BrandingService } from "@/lib/branding/branding-service";
import { generateThemeCSS } from "@/lib/branding/theme/generator";
import { renderGoogleFontLinks } from "@/app/embed/[session_id]/fonts";
import { awellDefaultBranding } from "@/lib/branding/defaults";
import { BrandingTestClient } from "./branding-test-client";

interface BrandingTestPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BrandingTestPage({
  searchParams,
}: BrandingTestPageProps) {
  const params = await searchParams;

  // Extract org-id from search params (handle both string and array cases)
  const orgIdParam = params["org-id"];
  const orgId = Array.isArray(orgIdParam) ? orgIdParam[0] : orgIdParam;

  console.log("🎨 Branding Test Page: Loading branding for org:", orgId);

  // Initialize branding service and fetch branding
  const brandingService = new BrandingService();
  const { branding, hasCustomBranding } = await brandingService.getBrandingInfo(
    orgId || awellDefaultBranding.orgId
  );

  // Generate theme CSS for this specific branding
  const themeCSS = generateThemeCSS(branding);

  // Generate Google Fonts links for this specific branding
  const googleFontLinks = renderGoogleFontLinks(branding);

  console.log("🎨 Branding Test Page: Applied branding", {
    orgId: orgId || awellDefaultBranding.orgId,
    hasCustomBranding,
    hasGoogleFonts: googleFontLinks.length > 0,
  });

  return (
    <>
      <Head>
        {/* Inject Google Fonts links into document head */}
        {googleFontLinks && (
          <div dangerouslySetInnerHTML={{ __html: googleFontLinks }} />
        )}

        {/* Inject custom theme CSS for this page */}
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </Head>

      {/* Wrap in BrandingProvider with custom branding */}
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
    </>
  );
}

// Force dynamic rendering to ensure fresh branding data
export const dynamic = "force-dynamic";
