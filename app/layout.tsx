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
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>
        <ProtectedRoute>{children}</ProtectedRoute>
      </body>
    </html>
  );
}
