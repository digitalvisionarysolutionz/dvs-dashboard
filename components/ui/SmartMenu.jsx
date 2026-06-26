"use client";

import { useEffect, useRef, useState } from "react";

export default function SmartMenu({
  label = "Open actions",
  button,
  children,
  width = 160,
  estimatedHeight = 132,
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const buttonRef = useRef(null);

  function toggleMenu() {
    if (!buttonRef.current) {
      setOpen((current) => !current);
      return;
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const shouldOpenUp = spaceBelow < estimatedHeight + 24;

    setMenuPosition({
      top: shouldOpenUp
        ? buttonRect.top - estimatedHeight - 8
        : buttonRect.bottom + 8,
      left: Math.max(12, buttonRect.right - width),
    });

    setOpen((current) => !current);
  }

  useEffect(() => {
    function closeMenu() {
      setOpen(false);
    }

    if (!open) {
      return undefined;
    }

    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        onClick={toggleMenu}
        className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--app-border)] bg-[#071018] text-[var(--app-text-muted)] transition hover:border-[var(--app-border-strong)] hover:text-white"
      >
        {button}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close actions"
            className="fixed inset-0 z-[80] cursor-default bg-transparent"
            onClick={() => setOpen(false)}
          />

          <div
            className="fixed z-[90] rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[#071018] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.65)]"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              width: `${width}px`,
            }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

export function SmartMenuItem({
  children,
  type = "button",
  tone = "default",
  onClick,
  ...props
}) {
  const tones = {
    default:
      "text-slate-300 hover:bg-white/[0.06] hover:text-white",
    danger:
      "text-red-200 hover:bg-red-400/10",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm font-bold ${tones[tone] || tones.default}`}
      {...props}
    >
      {children}
    </button>
  );
}