"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import NavMenu from "./NavMenu.jsx";

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19 12a7.5 7.5 0 0 0-.1-1.1l2-1.5-2-3.4-2.4 1a7.4 7.4 0 0 0-1.9-1.1L14.3 3h-4.6l-.3 2.9A7.4 7.4 0 0 0 7.5 7l-2.4-1-2 3.4 2 1.5A7.5 7.5 0 0 0 5 12c0 .4 0 .8.1 1.1l-2 1.5 2 3.4 2.4-1c.6.5 1.2.8 1.9 1.1l.3 2.9h4.6l.3-2.9c.7-.3 1.3-.6 1.9-1.1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1.1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c.7-4 3-6 7-6s6.3 2 7 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Sidebar({ brand }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  function toggleProfileMenu() {
    setIsProfileMenuOpen((current) => !current);
  }

  function closeProfileMenu() {
    setIsProfileMenuOpen(false);
  }

  return (
    <aside className="dvs-sidebar-bg hidden h-screen w-[258px] shrink-0 overflow-hidden border-r border-[#5cf4ec]/15 px-3.5 py-3.5 text-white lg:block">
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="mb-4 flex shrink-0 items-center gap-2.5 px-1">
          {brand.logo?.src ? (
            <div className="flex h-11 w-11 items-center justify-center">
              <Image
                src={brand.logo.src}
                alt={brand.logo.alt}
                width={44}
                height={44}
                className="h-full w-full object-contain drop-shadow-[0_0_20px_rgba(92,244,236,0.48)]"
                priority
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[#5cf4ec]/35 bg-[#5cf4ec]/10 text-sm font-black text-cyan-100">
              {brand.shortName.charAt(0)}
            </div>
          )}

          {brand.logo?.showText && (
            <div className="min-w-0">
              <p className="truncate text-[12px] font-black uppercase tracking-[0.32em] text-white">
                {brand.businessName}
              </p>
              <p className="mt-1 truncate text-[7px] font-black uppercase tracking-[0.2em] text-cyan-100/80">
                Digital Visionary Solutions
              </p>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
          <NavMenu />
        </div>

        <div className="relative mt-3 shrink-0">
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 z-30 mb-2.5 rounded-[var(--radius-lg)] border border-[#5cf4ec]/15 bg-[#071018] p-1.5 shadow-[0_22px_70px_rgba(0,0,0,0.72)]">
              <Link
                href="/settings"
                onClick={closeProfileMenu}
                className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-[12px] font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <UserIcon />
                Manage Account
              </Link>

              <Link
                href="/settings"
                onClick={closeProfileMenu}
                className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-[12px] font-bold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <SettingsIcon />
                Settings
              </Link>

              <form action="/logout" method="post">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-[12px] font-bold text-red-200 transition hover:bg-red-400/10"
                >
                  <LogoutIcon />
                  Log Out
                </button>
              </form>
            </div>
          )}

          <button
            type="button"
            onClick={toggleProfileMenu}
            className="flex w-full items-center gap-2.5 rounded-[var(--radius-lg)] border border-white/10 bg-[#050b12] p-2.5 text-left shadow-[0_0_24px_rgba(92,244,236,0.07)] transition hover:border-[#5cf4ec]/25 hover:bg-[#071018]"
            aria-expanded={isProfileMenuOpen}
            aria-label="Open profile menu"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#5cf4ec]/20 bg-white/[0.07] text-[12px] font-black text-white">
              {brand.userInitials}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-[#061019] bg-green-400" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-black text-white">
                {brand.user.fullName}
              </p>
              <p className="truncate text-[11px] capitalize text-slate-400">
                {brand.user.role}
              </p>
            </div>

            <span
              className={`text-slate-400 transition ${
                isProfileMenuOpen ? "rotate-180" : ""
              }`}
            >
              ⌄
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}