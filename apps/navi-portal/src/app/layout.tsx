import type { Metadata } from "next";
import "./globals.css";

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
  return (
    <html lang="en">
      <body className="antialiased w-full h-full">
        <div className="p-6 w-full h-full">{children}</div>
      </body>
    </html>
  );
}
