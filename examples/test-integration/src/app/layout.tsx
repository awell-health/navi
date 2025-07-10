import './globals.css';

export const metadata = {
  title: 'Navi SDK Test Integration',
  description: 'Testing the customer-facing Navi SDK with a real Next.js application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
} 