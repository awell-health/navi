import type { Metadata } from "next";
import { generateThemeCSS } from "@/lib/branding";
import { getBrandingByOrgId } from "@/lib/branding/branding-service";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import React, { Suspense } from "react";
import { LoaderCircle } from "lucide-react";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Navi | Powered by Awell",
  description: "Your personalized health care portal",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultBranding = await getBrandingByOrgId("default");
  
  // Override with Lato font from Google Fonts
  const orgBranding = {
    ...defaultBranding,
    fontFamilyBody: {
      fontFamily: "Lato, system-ui, sans-serif",
      weight: ["300", "400", "700", "900"],
      style: ["normal", "italic"],
    },
    fontFamilyHeading: {
      fontFamily: "Lato, system-ui, sans-serif", 
      weight: ["300", "400", "700", "900"],
      style: ["normal", "italic"],
    },
  };
  
  const css = generateThemeCSS(orgBranding);
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap" 
          rel="stylesheet" 
        />
        {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      </head>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen">
            <LoaderCircle className="animate-spin" />
          </div>
        }
      >
        <body>
          {children}
          <Toaster theme="light" richColors closeButton position="top-center" />
        </body>
      </Suspense>
    </html>
  );
}
