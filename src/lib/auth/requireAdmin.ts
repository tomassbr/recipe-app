import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileRole } from "@/types/profile";

export type RequireAdminResult =
  | { ok: true; userId: string }
  | { ok: false; error: string };

/**
 * Server-only guard: loads `profiles.role` for the current session user.
 * All mutations that must be admin-only should call this before writing.
 */
export async function requireAdmin(
  supabase: SupabaseClient
): Promise<RequireAdminResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Nejste přihlášeni" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  const role = data?.role as ProfileRole | undefined;
  if (role !== "admin" && role !== "user") {
    return { ok: false, error: "Profil nenalezen nebo nemá přiřazenou roli" };
  }

  if (role !== "admin") {
    return {
      ok: false,
      error:
        "Tuto akci smí provádět pouze uživatel s rolí administrátor (tabulka profiles).",
    };
  }

  return { ok: true, userId: user.id };
}
