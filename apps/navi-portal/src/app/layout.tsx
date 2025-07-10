import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getBrandingAction } from '@/app/actions';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Awell Health Portal",
  description: "Your personalized health care portal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { themeCSS, orgId, hasCustomBranding } = await getBrandingAction();
  
  console.log('🏗️  Layout: Rendering with branding', { orgId, hasCustomBranding });

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
