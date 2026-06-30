import Button from "../../components/ui/Button.jsx";
import AccentLine from "../../components/ui/AccentLine.jsx";
import { brandConfig } from "../../lib/brandConfig.js";
import { login } from "./actions.js";

function getErrorMessage(searchParams) {
  const rawError = searchParams?.error;

  if (!rawError) {
    return "";
  }

  try {
    return decodeURIComponent(rawError);
  } catch {
    return String(rawError);
  }
}

export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = getErrorMessage(resolvedSearchParams);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-5 py-10 text-[var(--app-text)]">
      <section className="w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--app-border)] bg-[var(--app-panel)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-8">
          <div className="inline-flex flex-col">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[var(--app-accent)]">
              {brandConfig.businessName}
            </p>
            <AccentLine />
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight">Sign in</h1>

          <p className="mt-3 text-sm leading-6 text-[var(--app-text-muted)]">
            Access the {brandConfig.dashboardName} for your workspace.
          </p>
        </div>

        <form action={login} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-widest text-[var(--app-text-soft)]"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              required
              className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--app-border)] bg-black/30 px-4 py-3 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-soft)] focus:border-[var(--app-border-strong)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-widest text-[var(--app-text-soft)]"
            >
              Password
            </label>

            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                required
                className="w-full rounded-[var(--radius-md)] border border-[var(--app-border)] bg-black/30 px-4 py-3 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-soft)] focus:border-[var(--app-border-strong)]"
                placeholder="••••••••"
              />
            </div>

            <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--app-text-muted)]">
              <input
                id="show-password"
                type="checkbox"
                className="h-4 w-4 accent-[var(--app-accent)]"
              />
              Show password
            </label>
          </div>

          {errorMessage && (
            <div className="rounded-[var(--radius-md)] border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">
              {errorMessage}
            </div>
          )}

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-xs leading-5 text-[var(--app-text-soft)]">
          Protected by Supabase Auth, Row Level Security, and organization-based
          access rules.
        </p>
      </section>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              function attachPasswordToggle() {
                var checkbox = document.getElementById("show-password");
                var password = document.getElementById("password");

                if (!checkbox || !password) return;

                checkbox.addEventListener("change", function () {
                  password.type = checkbox.checked ? "text" : "password";
                });
              }

              if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", attachPasswordToggle);
              } else {
                attachPasswordToggle();
              }
            })();
          `,
        }}
      />
    </main>
  );
}