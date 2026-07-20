"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function calculatePosition() {
    if (!buttonRef.current || typeof window === "undefined") {
      return;
    }

    const padding = 12;
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const safeWidth = Math.min(width, viewportWidth - padding * 2);
    const safeHeight = Math.min(estimatedHeight, viewportHeight - padding * 2);

    const spaceBelow = viewportHeight - buttonRect.bottom;
    const openUp = spaceBelow < safeHeight + 24;

    const preferredTop = openUp
      ? buttonRect.top - safeHeight - 8
      : buttonRect.bottom + 8;

    const preferredLeft = buttonRect.right - safeWidth;

    setMenuPosition({
      top: clamp(preferredTop, padding, viewportHeight - safeHeight - padding),
      left: clamp(preferredLeft, padding, viewportWidth - safeWidth - padding),
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

    calculatePosition();

    function closeMenu() {
      setOpen(false);
    }

    function repositionMenu() {
      calculatePosition();
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

    window.addEventListener("resize", repositionMenu);
    window.addEventListener("scroll", closeMenu, true);
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", repositionMenu);
      window.removeEventListener("scroll", closeMenu, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, width, estimatedHeight]);

  const menu =
    open && mounted
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[9999] rounded-[var(--radius-md)] border border-white/10 bg-[#071018]/98 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.78),0_0_24px_rgba(92,244,236,0.08)] backdrop-blur-xl"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              width: `${Math.min(width, window.innerWidth - 24)}px`,
            }}
          >
            {children}
          </div>,
          document.body
        )
      : null;

  return (
    <>
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
      </div>

      {menu}
    </>
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
    success:
      "text-[#5cf4ec] hover:bg-[#5cf4ec]/10 hover:text-white focus-visible:bg-[#5cf4ec]/10 focus-visible:text-white",
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