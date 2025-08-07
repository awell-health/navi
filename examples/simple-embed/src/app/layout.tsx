import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Navi Simple Embed",
  description: "Simple full-screen Navi embed example",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script>window.__NAVI_DISABLE_PRELOAD = true</script>
      </head>
      <body style={{ margin: 0, padding: 0, height: "100vh" }}>{children}</body>
    </html>
  );
}
