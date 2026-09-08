import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { SiteShell } from "@/components/SiteShell";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Garden of Words · Student Dashboard",
  description: "A cozy academic command center inspired by Garden of Words.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${quicksand.variable} h-full`}>
      <body className={`${quicksand.className} min-h-full`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
