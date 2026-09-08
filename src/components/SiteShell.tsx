"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AcademicProvider } from "@/lib/data/AcademicProvider";
import { Navigation } from "@/components/Navigation";
// doodles removed per design request

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pageName =
    pathname === "/"
      ? "home page"
      : pathname.replace("/", "").split("/")[0] + " page";

  return (
    <AcademicProvider>
      <div className="shell">
        <div className="page-frame">
          <div className="page-inner">
            <p className="crumb">{`garden of words ${pageName}`}</p>
            <Navigation pathname={pathname} />
            <div className="hero-banner">
              <div className="hero-copy">
                <p className="hand-kicker">a little academic garden</p>
                <h1 className="display-title">DASH BOARD</h1>
              </div>
            </div>
            {children}
            <p className="footer-note">stay soft, stay organized, water your deadlines.</p>
          </div>
        </div>
      </div>
    </AcademicProvider>
  );
}
