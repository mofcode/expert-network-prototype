import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "G2 Expert Network",
  description: "A community-driven expert network platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
