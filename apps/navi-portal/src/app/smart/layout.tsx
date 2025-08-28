import { generateThemeCSS } from "@/lib/branding";
import { getBrandingByOrgId } from "@/lib/branding/branding-service";
import "../globals.css";
import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";

export const runtime = "nodejs";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgBranding = await getBrandingByOrgId("default");
  const css = generateThemeCSS(orgBranding);
  return (
    <html>
      <head>
        {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      </head>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen">
            <LoaderCircle className="animate-spin" />
          </div>
        }
      >
        <body className="max-w-[550px] mx-auto">{children}</body>
      </Suspense>
    </html>
  );
}
