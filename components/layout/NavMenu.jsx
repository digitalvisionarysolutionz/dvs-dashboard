"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brandConfig } from "../../lib/brandConfig.js";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M3.5 7.5h6l1.6 2h9.4v9h-17v-11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm6.5 1a3 3 0 1 0 0-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3.5 20c.5-3.5 2.4-5.5 5.5-5.5s5 2 5.5 5.5M14 15c2.8.2 4.5 1.9 5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M4 6h16v12H4V6Zm0 4h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M7 3.5h7l3 3V20.5H7V3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 11h6M9 15h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M5 5.5h14v15H5v-15Zm0 4h14M8 3.5v4M16 3.5v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="M5 19V5M5 19h15M9 16v-5M13 16V8M17 16v-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LightningIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path
        d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GenericIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M6 6h12v12H6V6Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

const icons = {
  Dashboard: DashboardIcon,
  CRM: UsersIcon,
  Clients: UsersIcon,
  Projects: FolderIcon,
  Payments: CardIcon,
  Invoices: FileIcon,
  Automations: LightningIcon,
  Forms: FileIcon,
  Content: FileIcon,
  Calendar: CalendarIcon,
  Analytics: ChartIcon,
  Reports: ChartIcon,
};

const defaultHrefByLabel = {
  Dashboard: "/",
  CRM: "/crm",
  Clients: "/clients",
  Projects: "/projects",
  Payments: "/payments",
  Invoices: "/payments",
  Automations: "/automations",
  Forms: "/forms",
  Content: "/content",
  Calendar: "/calendar",
  Analytics: "/analytics",
  Reports: "/analytics",
};

function normalizeNavItem(item) {
  if (typeof item === "string") {
    return {
      label: item,
      href:
        defaultHrefByLabel[item] ||
        `/${item.toLowerCase().replaceAll(" ", "-")}`,
    };
  }

  return {
    label: item.label || item.name || "Item",
    href: item.href || defaultHrefByLabel[item.label] || "/",
  };
}

export default function NavMenu({ onItemClick }) {
  const pathname = usePathname();

  const navItems = (brandConfig.navItems || [])
    .map(normalizeNavItem)
    .filter((item) => item.label !== "Settings");

  return (
    <nav className="relative z-10 space-y-0.5" aria-label="Main navigation">
      {navItems.map((item) => {
        const Icon = icons[item.label] || GenericIcon;

        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={`${item.label}-${item.href}`}
            href={item.href}
            onClick={onItemClick}
            className={`group flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-1.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)] ${
              isActive
                ? "border-[var(--app-border-strong)] bg-[var(--app-accent-soft)] text-white shadow-[0_0_26px_rgba(92,244,236,0.18)]"
                : "border-transparent text-slate-300/85 hover:border-cyan-300/20 hover:bg-white/[0.045] hover:text-white"
            }`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] transition ${
                isActive
                  ? "bg-[var(--app-accent)] text-[#031012]"
                  : "bg-white/[0.035] text-slate-400 group-hover:text-[var(--app-accent)]"
              }`}
              aria-hidden="true"
            >
              <Icon />
            </span>

            <span className="flex-1">{item.label}</span>

            {isActive && (
              <span className="h-2 w-2 rounded-full bg-[var(--app-accent)] shadow-[0_0_14px_rgba(92,244,236,0.95)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}