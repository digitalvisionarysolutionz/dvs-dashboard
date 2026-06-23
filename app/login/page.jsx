"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client.js";
import Button from "../../components/ui/Button.jsx";
import AccentLine from "../../components/ui/AccentLine.jsx";
import { brandConfig } from "../../lib/brandConfig.js";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
  console.error("Login error:", error);

  setErrorMessage(
    error.message || "Login failed. Check your Supabase URL, anon key, and internet connection."
  );

  setIsLoading(false);
  return;
}

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-5 py-10 text-[var(--app-text)]">
      <section className="w-full max-w-md border border-[var(--app-border)] bg-[var(--app-panel)] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-8">
          <div className="inline-flex flex-col">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[var(--app-accent)]">
              {brandConfig.businessName}
            </p>
            <AccentLine />
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight">
            Sign in
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--app-text-muted)]">
            Access the {brandConfig.dashboardName} for your workspace.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-widest text-[var(--app-text-soft)]"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full border border-[var(--app-border)] bg-black/30 px-4 py-3 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-soft)] focus:border-[var(--app-border-strong)]"
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

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full border border-[var(--app-border)] bg-black/30 px-4 py-3 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[var(--app-text-soft)] focus:border-[var(--app-border-strong)]"
              placeholder="••••••••"
            />
          </div>

          {errorMessage && (
            <div className="border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200">
              {errorMessage}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-xs leading-5 text-[var(--app-text-soft)]">
          Protected by Supabase Auth, Row Level Security, and organization-based
          access rules.
        </p>
      </section>
    </main>
  );
}