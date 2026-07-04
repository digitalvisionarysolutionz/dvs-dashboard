"use client";

import { useEffect, useRef, useState } from "react";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

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
  const menuRef = useRef(null);

  function calculatePosition() {
    if (!buttonRef.current || typeof window === "undefined") {
      return;
    }

    const padding = 12;
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - buttonRect.bottom;
    const openUp = spaceBelow < estimatedHeight + 24;

    const preferredTop = openUp
      ? buttonRect.top - estimatedHeight - 8
      : buttonRect.bottom + 8;

    const preferredLeft = buttonRect.right - width;

    setMenuPosition({
      top: clamp(preferredTop, padding, viewportHeight - estimatedHeight - padding),
      left: clamp(preferredLeft, padding, viewportWidth - width - padding),
    });
  }

  function toggleMenu(event) {
    event.stopPropagation();

    if (!open) {
      calculatePosition();
    }

    setOpen((current) => !current);
  }

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function closeMenu() {
      setOpen(false);
    }

    function handlePointerDown(event) {
      if (
        buttonRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }

      closeMenu();
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggleMenu}
        className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-[var(--radius-md)] border border-white/10 bg-[#071018] text-slate-300 transition hover:border-[#5cf4ec]/35 hover:bg-[#0a141d] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5cf4ec] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020407]"
      >
        {button}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-[90] rounded-[var(--radius-md)] border border-white/10 bg-[#071018]/98 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.68),0_0_24px_rgba(92,244,236,0.06)] backdrop-blur-xl"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: `${width}px`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function SmartMenuItem({
  children,
  type = "button",
  tone = "default",
  onClick,
  className = "",
  ...props
}) {
  const tones = {
    default:
      "text-slate-300 hover:bg-white/[0.06] hover:text-white focus-visible:bg-white/[0.06] focus-visible:text-white",
    danger:
      "text-red-200 hover:bg-red-400/10 hover:text-red-100 focus-visible:bg-red-400/10 focus-visible:text-red-100",
  };

  return (
    <button
      type={type}
      role="menuitem"
      onClick={onClick}
      className={`block min-h-9 w-full touch-manipulation rounded-[var(--radius-sm)] px-3 py-2 text-left text-xs font-black transition focus-visible:outline-none ${
        tones[tone] || tones.default
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}