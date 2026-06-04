import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Out of the Box Giving",
  description: "Open a small act of kindness. Leave one for the next stranger.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
