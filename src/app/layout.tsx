import type { Metadata } from 'next';
import './globals.css'; // Make sure to import your global styles

export const metadata: Metadata = {
  title: 'Hospi - Hospital Management',
  description: 'Welcome to Hospi!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}