import Button from "../ui/Button.jsx";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm5.5-2.5L21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M18 9a6 6 0 0 0-12 0c0 7-2.5 8-2.5 8h17S18 16 18 9ZM10 20h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4 6h16v12H4V6Zm1 1 7 6 7-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconButton({ children, label, badge }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative hidden h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-white/10 bg-[#071018] text-slate-200 transition hover:border-cyan-300/30 hover:bg-[#0b1722] hover:text-white md:flex"
    >
      {children}

      {badge && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--app-accent)] px-1 text-[10px] font-black text-[#031012]">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function Topbar({ onMenuClick }) {
  return (
    <header className="dvs-topbar sticky top-0 z-40 border-b border-white/10 px-4 py-3 text-white md:px-6">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Button
            variant="secondary"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="flex h-10 w-10 px-0 lg:hidden"
          >
            <span className="text-xl leading-none">☰</span>
          </Button>

          <label className="relative hidden w-full max-w-xl md:block">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>

            <input
              type="search"
              placeholder="Search clients, projects, tasks..."
              className="h-11 w-full rounded-[var(--radius-lg)] border border-white/10 bg-[#071018] pl-12 pr-16 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/45 focus:bg-[#0b1722]"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-[var(--radius-sm)] border border-white/10 bg-[#020407] px-2 py-1 text-[11px] font-black text-slate-400">
              ⌘ K
            </span>
          </label>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <IconButton label="Theme">
            <SunIcon />
          </IconButton>

          <IconButton label="Notifications" badge="3">
            <BellIcon />
          </IconButton>

          <IconButton label="Messages">
            <MailIcon />
          </IconButton>

          <Button className="hidden sm:inline-flex">+ New Project</Button>
        </div>
      </div>
    </header>
  );
}