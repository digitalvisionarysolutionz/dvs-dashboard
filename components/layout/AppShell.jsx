"use client";

import { useState } from "react";
import Image from "next/image";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import NavMenu from "./NavMenu.jsx";
import { brandConfig } from "../../lib/brandConfig.js";

function buildBrand(workspace) {
  const organization = workspace?.organization;
  const user = workspace?.user;

  return {
    businessName: organization?.name || brandConfig.businessName,
    shortName: brandConfig.shortName || "DVS",
    tagline: brandConfig.tagline || "Digital Visionary Solutions",
    dashboardName:
      organization?.dashboardName ||
      brandConfig.dashboardName ||
      "Business Command Center",
    planName: organization?.planName || brandConfig.planName || "Enterprise Plan",
    userInitials: user?.initials || brandConfig.userInitials || "DS",

    logo: {
      src: organization?.logoUrl || brandConfig.logo?.src || "",
      alt: `${organization?.name || brandConfig.businessName || "DVS Tech"} logo`,
      showText: brandConfig.logo?.showText ?? true,
    },

    navItems: brandConfig.navItems || [],

    user: {
      fullName: user?.fullName || "D Salzz",
      email: user?.email || "",
      role: workspace?.membership?.role || "owner",
    },
  };
}

export default function AppShell({ children, workspace }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const brand = buildBrand(workspace);

  function openMobileMenu() {
    setIsMobileMenuOpen(true);
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    <div className="dvs-shell-grid h-screen overflow-hidden text-[var(--app-text)]">
      <div className="flex h-screen min-h-0">
        <Sidebar brand={brand} />

        <div className="min-w-0 flex-1 overflow-y-auto">
          <Topbar brand={brand} onMenuClick={openMobileMenu} />

          <main className="px-3 py-3 md:px-4 md:py-3.5">
            <div className="mx-auto w-full max-w-[1500px]">{children}</div>
          </main>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          <aside className="dvs-sidebar-bg relative z-10 min-h-screen w-[84vw] max-w-[320px] border-r border-[#5cf4ec]/15 px-4 py-4 shadow-[22px_0_60px_rgba(0,0,0,0.7)]">
            <div className="relative z-10 mb-7 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {brand.logo?.src ? (
                  <div className="flex h-11 w-11 items-center justify-center">
                    <Image
                      src={brand.logo.src}
                      alt={brand.logo.alt}
                      width={44}
                      height={44}
                      className="h-full w-full object-contain drop-shadow-[0_0_18px_rgba(92,244,236,0.45)]"
                      priority
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[#5cf4ec]/35 bg-[#5cf4ec]/10 text-sm font-black text-cyan-100">
                    {brand.shortName.charAt(0)}
                  </div>
                )}

                {brand.logo?.showText && (
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.32em] text-white">
                      {brand.businessName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {brand.dashboardName}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={closeMobileMenu}
                className="rounded-[var(--radius-sm)] border border-white/10 px-3 py-2 text-sm font-bold text-slate-300 transition hover:border-[#5cf4ec]/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec]"
              >
                ✕
              </button>
            </div>

            <div className="relative z-10">
              <NavMenu onItemClick={closeMobileMenu} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}