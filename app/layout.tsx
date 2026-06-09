import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TruthCI — Public Product Truth Engine",
  description: "Catch product contradictions before your users do."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
