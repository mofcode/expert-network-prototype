import type { Metadata } from "next";
import "./globals.css";
import ProtectedRoute from "@/components/ProtectedRoute";

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
      <body>
        <ProtectedRoute>{children}</ProtectedRoute>
      </body>
    </html>
  );
}
