import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vinyl Shop - ระบบจัดการร้านป้ายไวนิล",
  description: "ระบบจัดการร้านป้ายไวนิล",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
