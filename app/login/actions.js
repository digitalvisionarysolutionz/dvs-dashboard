"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server.js";

function buildLoginRedirect(message) {
  return `/login?error=${encodeURIComponent(message)}`;
}

export async function login(formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect(buildLoginRedirect("Please enter your email and password."));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      buildLoginRedirect(
        error.message || "Login failed. Please check your credentials."
      )
    );
  }

  redirect("/");
}