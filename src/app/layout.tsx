import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bright Platform",
  description: "Bright Ecosystem - Intelligent Customer Relationship Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
